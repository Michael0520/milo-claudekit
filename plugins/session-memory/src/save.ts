#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync, statSync } from "fs";
import { join, basename } from "path";
import { homedir } from "os";
import { exec } from "child_process";
import { loadConfig } from "@claudekit/config";
import { loadHook, stop, type StopInput } from "@claudekit/hook";

const DEFAULT_STORAGE_DIR = join(homedir(), ".claude", "sessions");
const DEFAULT_RETENTION_DAYS = 7;
const DEFAULT_MAX_SESSIONS = 50;

const config = await loadConfig();
const memoryConfig = config.sessionMemory;

// If session memory is not enabled, exit silently
if (!memoryConfig?.enabled) {
  console.log(stop(true));
  process.exit(0);
}

const hook = await loadHook<StopInput>();

// Skip if stop hook is already active
if (hook.stopHookActive) {
  console.log(stop(true));
  process.exit(0);
}

const storageDir = memoryConfig.storageDir ?? DEFAULT_STORAGE_DIR;
const retentionDays = memoryConfig.retentionDays ?? DEFAULT_RETENTION_DAYS;
const maxSessions = memoryConfig.maxSessions ?? DEFAULT_MAX_SESSIONS;
const includeConfig = memoryConfig.include ?? {
  cwd: true,
  gitBranch: true,
  recentFiles: true,
  customContext: false,
};

// Ensure storage directory exists
if (!existsSync(storageDir)) {
  mkdirSync(storageDir, { recursive: true });
}

// Build session context
const sessionContext = await buildSessionContext(includeConfig);

// Save session
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const projectName = basename(process.cwd());
const filename = `${projectName}-${timestamp}.json`;
const filepath = join(storageDir, filename);

writeFileSync(filepath, JSON.stringify(sessionContext, null, 2));

// Cleanup old sessions
cleanupOldSessions(storageDir, retentionDays, maxSessions);

console.log(stop(true, `💾 Session context saved to ${filename}`));

// Build session context from current state
async function buildSessionContext(include: typeof includeConfig): Promise<SessionContext> {
  const context: SessionContext = {
    timestamp: new Date().toISOString(),
    project: basename(process.cwd()),
  };

  if (include.cwd) {
    context.cwd = process.cwd();
  }

  if (include.gitBranch) {
    context.gitBranch = await getGitBranch();
  }

  if (include.recentFiles) {
    context.recentFiles = await getRecentlyModifiedFiles();
  }

  return context;
}

type SessionContext = {
  timestamp: string;
  project: string;
  cwd?: string;
  gitBranch?: string;
  recentFiles?: string[];
  customContext?: string;
};

// Get current git branch
function getGitBranch(): Promise<string> {
  return new Promise((resolve) => {
    exec("git branch --show-current", (error, stdout) => {
      if (error) {
        resolve("");
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Get recently modified files (last 10)
function getRecentlyModifiedFiles(): Promise<string[]> {
  return new Promise((resolve) => {
    exec("git diff --name-only HEAD~5 2>/dev/null || git diff --name-only", (error, stdout) => {
      if (error) {
        resolve([]);
        return;
      }
      const files = stdout
        .split("\n")
        .filter((f) => f.trim() !== "")
        .slice(0, 10);
      resolve(files);
    });
  });
}

// Cleanup old sessions based on retention policy
function cleanupOldSessions(dir: string, retentionDays: number, maxSessions: number): void {
  if (!existsSync(dir)) return;

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      name: f,
      path: join(dir, f),
      mtime: statSync(join(dir, f)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  const now = Date.now();
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

  // Remove old files beyond retention
  for (const file of files) {
    if (now - file.mtime.getTime() > retentionMs) {
      try {
        unlinkSync(file.path);
      } catch {
        // Ignore errors
      }
    }
  }

  // Remove excess files beyond max count
  const remainingFiles = readdirSync(dir).filter((f) => f.endsWith(".json"));
  if (remainingFiles.length > maxSessions) {
    const sortedFiles = remainingFiles
      .map((f) => ({
        name: f,
        path: join(dir, f),
        mtime: statSync(join(dir, f)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    for (let i = maxSessions; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      if (file) {
        try {
          unlinkSync(file.path);
        } catch {
          // Ignore errors
        }
      }
    }
  }
}
