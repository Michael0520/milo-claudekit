#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join, basename } from "path";
import { homedir } from "os";
import { loadConfig } from "@claudekit/config";

const DEFAULT_STORAGE_DIR = join(homedir(), ".claude", "sessions");

const config = await loadConfig();
const memoryConfig = config.sessionMemory;

// If session memory is not enabled, exit silently
if (!memoryConfig?.enabled) {
  // Output empty context
  console.log(JSON.stringify({ context: null }));
  process.exit(0);
}

const storageDir = memoryConfig.storageDir ?? DEFAULT_STORAGE_DIR;
const projectName = basename(process.cwd());

// Find most recent session for this project
const session = findLatestSession(storageDir, projectName);

if (!session) {
  console.log(JSON.stringify({ context: null, message: "No previous session found" }));
  process.exit(0);
}

// Output session context
const output = {
  context: session,
  message: `📂 Restored session from ${session.timestamp}`,
};

console.log(JSON.stringify(output));

// Format context for display
const contextLines: string[] = [];

if (session.cwd) {
  contextLines.push(`Working directory: ${session.cwd}`);
}

if (session.gitBranch) {
  contextLines.push(`Git branch: ${session.gitBranch}`);
}

if (session.recentFiles && session.recentFiles.length > 0) {
  contextLines.push(`Recently modified files:\n  • ${session.recentFiles.join("\n  • ")}`);
}

if (contextLines.length > 0) {
  // Output to stderr for hook display (stdout is for JSON)
  console.error(`\n📂 Previous Session Context:\n${contextLines.join("\n")}\n`);
}

type SessionContext = {
  timestamp: string;
  project: string;
  cwd?: string;
  gitBranch?: string;
  recentFiles?: string[];
  customContext?: string;
};

// Find the latest session file for a project
function findLatestSession(dir: string, project: string): SessionContext | null {
  if (!existsSync(dir)) {
    return null;
  }

  const files = readdirSync(dir)
    .filter((f) => f.startsWith(project) && f.endsWith(".json"))
    .map((f) => ({
      name: f,
      path: join(dir, f),
      mtime: statSync(join(dir, f)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (files.length === 0) {
    return null;
  }

  const latestFile = files[0];
  if (!latestFile) {
    return null;
  }

  try {
    const content = readFileSync(latestFile.path, "utf-8");
    return JSON.parse(content) as SessionContext;
  } catch {
    return null;
  }
}
