#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { loadConfig } from "@claudekit/config";
import { loadHook, stop, type StopInput } from "@claudekit/hook";

const DEFAULT_OUTPUT_DIR = join(homedir(), ".claude", "learned");
const DEFAULT_MIN_SESSION_LENGTH = 10;

const config = await loadConfig();
const learningConfig = config.learning;

// If learning is not enabled, exit silently
if (!learningConfig?.enabled) {
  console.log(stop(true));
  process.exit(0);
}

const hook = await loadHook<StopInput>();

// Skip if stop hook is already active (avoid recursion)
if (hook.stopHookActive) {
  console.log(stop(true));
  process.exit(0);
}

// Get transcript from hook input (if available)
const transcript = (hook as any).transcript || [];
const sessionLength = transcript.length;

const minLength = learningConfig.minSessionLength ?? DEFAULT_MIN_SESSION_LENGTH;

// Check minimum session length
if (sessionLength < minLength) {
  console.log(
    stop(
      true,
      `Session too short for learning extraction (${sessionLength}/${minLength} messages)`,
    ),
  );
  process.exit(0);
}

// Ensure output directory exists
const outputDir = learningConfig.outputDir ?? DEFAULT_OUTPUT_DIR;
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Extract patterns from transcript
const patterns = extractPatterns(transcript, learningConfig.categories);

if (patterns.length === 0) {
  console.log(stop(true, "No learnable patterns detected in this session"));
  process.exit(0);
}

// Save patterns
const savedFiles = savePatterns(patterns, outputDir);

console.log(
  stop(
    true,
    `📚 Learned ${patterns.length} pattern(s) from this session:\n${savedFiles.map((f) => `  • ${f}`).join("\n")}`,
  ),
);

// Pattern extraction logic
type Pattern = {
  category: string;
  title: string;
  content: string;
  context: string;
};

function extractPatterns(
  transcript: Array<{ role: string; content: string }>,
  categories?: string[],
): Pattern[] {
  const patterns: Pattern[] = [];
  const defaultCategories = [
    "error-resolution",
    "framework-workaround",
    "debugging",
    "convention",
  ];
  const activeCategories = categories ?? defaultCategories;

  // Look for error resolution patterns
  if (activeCategories.includes("error-resolution")) {
    const errorPatterns = findErrorResolutions(transcript);
    patterns.push(...errorPatterns);
  }

  // Look for framework workarounds
  if (activeCategories.includes("framework-workaround")) {
    const workaroundPatterns = findWorkarounds(transcript);
    patterns.push(...workaroundPatterns);
  }

  // Look for debugging patterns
  if (activeCategories.includes("debugging")) {
    const debugPatterns = findDebuggingPatterns(transcript);
    patterns.push(...debugPatterns);
  }

  // Look for convention patterns
  if (activeCategories.includes("convention")) {
    const conventionPatterns = findConventionPatterns(transcript);
    patterns.push(...conventionPatterns);
  }

  return patterns;
}

function findErrorResolutions(
  transcript: Array<{ role: string; content: string }>,
): Pattern[] {
  const patterns: Pattern[] = [];

  for (let i = 0; i < transcript.length - 1; i++) {
    const msg = transcript[i];
    const nextMsg = transcript[i + 1];

    if (!msg || !nextMsg) continue;

    // Look for error messages followed by resolution
    const errorIndicators = [
      "error:",
      "Error:",
      "ERROR",
      "failed",
      "Failed",
      "exception",
      "Exception",
    ];

    const hasError = errorIndicators.some((ind) => msg.content?.includes(ind));
    const hasResolution =
      nextMsg.role === "assistant" &&
      (nextMsg.content?.includes("fix") ||
        nextMsg.content?.includes("solution") ||
        nextMsg.content?.includes("resolve"));

    if (hasError && hasResolution) {
      // Extract error type from message
      const errorMatch = msg.content?.match(
        /(?:error|Error|ERROR)[:\s]+([^\n]+)/,
      );
      const errorType = errorMatch?.[1]?.slice(0, 50) || "Unknown Error";

      patterns.push({
        category: "error-resolution",
        title: `Fix: ${errorType}`,
        content: nextMsg.content?.slice(0, 500) || "",
        context: msg.content?.slice(0, 200) || "",
      });
    }
  }

  return patterns.slice(0, 3); // Limit to 3 patterns per category
}

function findWorkarounds(
  transcript: Array<{ role: string; content: string }>,
): Pattern[] {
  const patterns: Pattern[] = [];
  const workaroundKeywords = [
    "workaround",
    "instead of",
    "alternative",
    "hack",
    "trick",
  ];

  for (const msg of transcript) {
    if (msg.role !== "assistant" || !msg.content) continue;

    const hasWorkaround = workaroundKeywords.some((kw) =>
      msg.content.toLowerCase().includes(kw),
    );

    if (hasWorkaround) {
      patterns.push({
        category: "framework-workaround",
        title: "Workaround Pattern",
        content: msg.content.slice(0, 500),
        context: "",
      });
    }
  }

  return patterns.slice(0, 2);
}

function findDebuggingPatterns(
  transcript: Array<{ role: string; content: string }>,
): Pattern[] {
  const patterns: Pattern[] = [];
  const debugKeywords = [
    "debug",
    "investigate",
    "root cause",
    "the issue is",
    "found the problem",
  ];

  for (const msg of transcript) {
    if (msg.role !== "assistant" || !msg.content) continue;

    const hasDebug = debugKeywords.some((kw) =>
      msg.content.toLowerCase().includes(kw),
    );

    if (hasDebug && msg.content.length > 200) {
      patterns.push({
        category: "debugging",
        title: "Debugging Approach",
        content: msg.content.slice(0, 500),
        context: "",
      });
    }
  }

  return patterns.slice(0, 2);
}

function findConventionPatterns(
  transcript: Array<{ role: string; content: string }>,
): Pattern[] {
  const patterns: Pattern[] = [];
  const conventionKeywords = [
    "convention",
    "best practice",
    "pattern",
    "standard",
    "should always",
    "never use",
  ];

  for (const msg of transcript) {
    if (msg.role !== "assistant" || !msg.content) continue;

    const hasConvention = conventionKeywords.some((kw) =>
      msg.content.toLowerCase().includes(kw),
    );

    if (hasConvention) {
      patterns.push({
        category: "convention",
        title: "Convention/Best Practice",
        content: msg.content.slice(0, 500),
        context: "",
      });
    }
  }

  return patterns.slice(0, 2);
}

function savePatterns(patterns: Pattern[], outputDir: string): string[] {
  const savedFiles: string[] = [];
  const timestamp = new Date().toISOString().slice(0, 10);

  // Get existing files to avoid duplicates
  const existingFiles = existsSync(outputDir) ? readdirSync(outputDir) : [];
  let counter = existingFiles.length + 1;

  for (const pattern of patterns) {
    const filename = `${timestamp}-${pattern.category}-${counter}.md`;
    const filepath = join(outputDir, filename);

    const content = `---
category: ${pattern.category}
date: ${timestamp}
---

# ${pattern.title}

## Context

${pattern.context || "N/A"}

## Solution

${pattern.content}
`;

    writeFileSync(filepath, content);
    savedFiles.push(filename);
    counter++;
  }

  return savedFiles;
}
