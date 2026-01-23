#!/usr/bin/env node

import { loadConfig, type GuardRule } from "@claudekit/config";
import { loadHook, preToolUse, type PreToolUseInput } from "@claudekit/hook";

const config = await loadConfig();
const guardConfig = config.guard;

// If guard is not enabled, exit silently
if (!guardConfig?.enabled) {
  console.log(preToolUse(true));
  process.exit(0);
}

const hook = await loadHook<PreToolUseInput>();
const toolName = hook.toolName;
const toolInput = hook.toolInput;

// Built-in guards
const builtInGuards = guardConfig.builtIn ?? {};
const triggeredWarnings: string[] = [];
let blocked = false;
let blockReason = "";

// 1. Git push confirmation
if (builtInGuards.gitPushConfirm && toolName === "Bash") {
  const command = toolInput.command as string || "";
  if (command.includes("git push")) {
    triggeredWarnings.push(
      "⚠️ Git Push: You are about to push changes to remote. Please review your commits before proceeding.",
    );
  }
}

// 2. Tmux reminder for long-running commands
if (builtInGuards.tmuxReminder && toolName === "Bash") {
  const command = toolInput.command as string || "";
  const longRunningPatterns = [
    "npm install",
    "npm ci",
    "yarn install",
    "pnpm install",
    "bun install",
    "npm run build",
    "npm run test",
    "npm run dev",
    "npm start",
    "yarn build",
    "yarn test",
    "yarn dev",
    "pnpm build",
    "pnpm test",
    "bun run build",
    "bun run test",
    "docker build",
    "docker-compose up",
  ];

  const isLongRunning = longRunningPatterns.some((p) =>
    command.toLowerCase().includes(p.toLowerCase()),
  );

  // Check if running in tmux
  const inTmux = process.env.TMUX !== undefined;

  if (isLongRunning && !inTmux) {
    triggeredWarnings.push(
      "💡 Tmux Reminder: Consider running this long-running command in tmux for better log accessibility.",
    );
  }
}

// 3. Dangerous rm commands
if (builtInGuards.dangerousRm && toolName === "Bash") {
  const command = toolInput.command as string || "";
  const dangerousPatterns = [
    /rm\s+-rf\s+\/(?!\w)/,           // rm -rf / (root)
    /rm\s+-rf\s+~\s*$/,              // rm -rf ~ (home)
    /rm\s+-rf\s+\*\s*$/,             // rm -rf * (everything)
    /sudo\s+rm\s+-rf/,               // sudo rm -rf anything
    /rm\s+-rf\s+\.\.?\s*$/,          // rm -rf . or rm -rf ..
  ];

  const isDangerous = dangerousPatterns.some((p) => p.test(command));

  if (isDangerous) {
    blocked = true;
    blockReason = "🚫 BLOCKED: Dangerous rm command detected. This could delete critical files. Please use a safer approach.";
  }
}

// 4. Custom rules
const customRules = guardConfig.rules ?? [];
for (const rule of customRules) {
  const matches = matchRule(rule, toolName, toolInput);
  if (matches) {
    if (rule.action === "block") {
      blocked = true;
      blockReason = rule.message;
      break;
    } else {
      triggeredWarnings.push(rule.message);
    }
  }
}

// Output result
if (blocked) {
  console.log(preToolUse(false, blockReason));
} else if (triggeredWarnings.length > 0) {
  // Warnings don't block, just inform
  console.log(preToolUse(true, triggeredWarnings.join("\n\n")));
} else {
  console.log(preToolUse(true));
}

// Helper function to match custom rules
function matchRule(
  rule: GuardRule,
  toolName: string,
  toolInput: Record<string, any>,
): boolean {
  // Check tool pattern
  const toolRegex = new RegExp(rule.toolPattern, "i");
  if (!toolRegex.test(toolName)) {
    return false;
  }

  // Check input pattern if specified
  if (rule.inputPattern) {
    const inputRegex = new RegExp(rule.inputPattern, "i");
    const inputStr = JSON.stringify(toolInput);
    if (!inputRegex.test(inputStr)) {
      return false;
    }
  }

  return true;
}
