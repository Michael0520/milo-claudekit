#!/usr/bin/env node

import { loadConfig, CommitLogic } from "@claudekit/config";
import { loadHook, stop, type StopInput } from "@claudekit/hook";
import {
  getChangedFilesCount,
  getChangedLinesCount,
  getUntrackedLinesCount,
  isGitAvailable,
  detectDebugStatements,
  type DebugStatementMatch,
} from "./git.js";

const DEFAULT_BLOCK_REASON =
  "There are too many changes {changedFiles}/{maxChangedFiles} changed files and {totalChangedLines}/{maxChangedLines} changed lines in the working directory. Please review and commit your changes before proceeding.";

const DEFAULT_DEBUG_WARN_MESSAGE =
  "⚠️ Debug statements detected in modified files:\n{matches}\n\nPlease remove debug statements before committing.";

const config = await loadConfig();

const isCommitHookEnabled = config.commit?.threshold.enabled ?? false;
if (!isCommitHookEnabled) {
  console.log(stop(true, `Commit hook is disabled in configuration`));
  process.exit(0);
}

if (!(await isGitAvailable())) {
  console.log(stop(true, `Git is not available in the current project`));
  process.exit(0);
}

const hook = await loadHook<StopInput>();
if (hook.stopHookActive) {
  console.log(stop(true, `Commit hook is skipped because stop hook is active`));
  process.exit(0);
}

const maxFilesChanged = config.commit?.threshold.maxFilesChanged ?? 10;
const maxLinesChanged = config.commit?.threshold.maxLinesChanged ?? 500;
const conditionLogic = config.commit?.threshold.logic ?? CommitLogic.OR;
const stopReasonTemplate =
  config.commit?.threshold.blockReason ?? DEFAULT_BLOCK_REASON;

const changedFiles = await getChangedFilesCount();
const changedLines = await getChangedLinesCount();
const untrackedLines = await getUntrackedLinesCount();

const isExceededFiles = changedFiles >= maxFilesChanged;
const isExceededLines = changedLines + untrackedLines >= maxLinesChanged;
const isBlocked =
  conditionLogic === CommitLogic.AND
    ? isExceededFiles && isExceededLines
    : isExceededFiles || isExceededLines;

// Debug detection check
const debugConfig = config.commit?.debugDetection;
const isDebugDetectionEnabled = debugConfig?.enabled ?? false;
let debugMatches: DebugStatementMatch[] = [];
let debugWarning = "";

if (isDebugDetectionEnabled) {
  const patterns = debugConfig?.patterns ?? [
    "console\\.log",
    "console\\.debug",
    "console\\.warn",
    "console\\.info",
    "debugger",
  ];
  const extensions = debugConfig?.extensions ?? ["ts", "tsx", "js", "jsx"];
  const exclude = debugConfig?.exclude ?? [];

  debugMatches = await detectDebugStatements(patterns, extensions, exclude);

  if (debugMatches.length > 0) {
    const matchesStr = debugMatches
      .map((m) => `  • ${m.file}:${m.line} - ${m.pattern}`)
      .join("\n");
    const warnTemplate = debugConfig?.warnMessage ?? DEFAULT_DEBUG_WARN_MESSAGE;
    debugWarning = warnTemplate.replace("{matches}", matchesStr);
  }
}

const isDebugBlocked = debugConfig?.enforce && debugMatches.length > 0;
const finalBlocked = isBlocked || isDebugBlocked;

// Build final reason
let finalReason = "";
if (isBlocked) {
  finalReason = stopReasonTemplate
    .replace("{changedFiles}", changedFiles.toString())
    .replace("{maxChangedFiles}", maxFilesChanged.toString())
    .replace("{changedLines}", changedLines.toString())
    .replace("{untrackedLines}", untrackedLines.toString())
    .replace("{totalChangedLines}", (changedLines + untrackedLines).toString())
    .replace("{maxChangedLines}", maxLinesChanged.toString());
}

if (debugWarning) {
  finalReason = finalReason ? `${finalReason}\n\n${debugWarning}` : debugWarning;
}

console.log(stop(!finalBlocked, finalReason || undefined));
