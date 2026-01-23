#!/usr/bin/env node

import { exec } from "child_process";
import { loadConfig } from "@claudekit/config";
import { loadHook, postToolUse, type PostToolUseInput } from "@claudekit/hook";

const SUPPORTED_TOOL_NAMES = ["Edit", "Write"];

const hook = await loadHook<PostToolUseInput>();

if (!SUPPORTED_TOOL_NAMES.includes(hook.toolName)) {
  process.exit(0);
}

const config = await loadConfig();
const formatConfig = config.format;

if (!formatConfig?.enabled) {
  console.log(postToolUse(true));
  process.exit(0);
}

const filePath = hook.toolInput.filePath;
const issues: string[] = [];

// Check file extension
const ext = filePath.split(".").pop()?.toLowerCase() || "";

// Prettier check
const runPrettier = formatConfig.prettier ?? true;
const prettierExts = formatConfig.prettierExtensions ?? [
  "ts", "tsx", "js", "jsx", "json", "css", "scss", "html", "md",
];

if (runPrettier && prettierExts.includes(ext)) {
  const prettierResult = await runCommand(`npx prettier --check "${filePath}"`);
  if (!prettierResult.success) {
    issues.push(`Prettier: File needs formatting. Run: npx prettier --write "${filePath}"`);
  }
}

// TypeScript check
const runTsc = formatConfig.tsc ?? true;
const tscExts = formatConfig.tscExtensions ?? ["ts", "tsx"];

if (runTsc && tscExts.includes(ext)) {
  const tscResult = await runCommand(`npx tsc --noEmit "${filePath}" 2>&1`);
  if (!tscResult.success && tscResult.output) {
    // Extract first error line for brevity
    const errorLines = tscResult.output
      .split("\n")
      .filter((line) => line.includes("error TS"))
      .slice(0, 3);
    if (errorLines.length > 0) {
      issues.push(`TypeScript errors:\n${errorLines.join("\n")}`);
    }
  }
}

// Output result
if (issues.length === 0) {
  console.log(postToolUse(true));
} else {
  const message = `⚠️ Code quality issues detected:\n\n${issues.join("\n\n")}`;
  const enforce = formatConfig.enforce ?? false;

  if (enforce) {
    console.log(postToolUse(false, message));
  } else {
    console.log(postToolUse(true, "Format check completed with warnings.", message));
  }
}

// Helper function to run shell commands
function runCommand(command: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        output: stdout || stderr || "",
      });
    });
  });
}
