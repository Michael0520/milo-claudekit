import { exec } from "child_process";

export type DebugStatementMatch = {
  file: string;
  line: number;
  content: string;
  pattern: string;
};

export async function isGitAvailable(): Promise<boolean> {
  try {
    return new Promise((resolve) => {
      exec("git status", (error) => {
        resolve(!error);
      });
    });
  } catch {
    return false;
  }
}

export async function getChangedFilesCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec("git status --porcelain", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const changedFiles = stdout
        .split("\n")
        .filter((line) => line.trim() !== "");
      resolve(changedFiles.length);
    });
  });
}

export async function getChangedLinesCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec("git diff --numstat", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const lines = stdout
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const parts = line.split("\t");
          const added = parseInt(parts[0] || "0", 10);
          const deleted = parseInt(parts[1] || "0", 10);
          return (isNaN(added) ? 0 : added) + (isNaN(deleted) ? 0 : deleted);
        });
      const totalChangedLines = lines.reduce((acc, curr) => acc + curr, 0);
      resolve(totalChangedLines);
    });
  });
}

export async function getUntrackedLinesCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(
      "git ls-files --others --exclude-standard | xargs wc -l",
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const lines = stdout
          .split("\n")
          .filter((line) => line.trim() !== "" && !line.includes("total"))
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            return parseInt(parts[0] || "0", 10);
          });
        const totalUntrackedLines = lines.reduce((acc, curr) => acc + curr, 0);
        resolve(totalUntrackedLines);
      },
    );
  });
}

/**
 * Get list of staged files (files added to git index).
 */
export async function getStagedFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec("git diff --cached --name-only", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const files = stdout
        .split("\n")
        .filter((line) => line.trim() !== "");
      resolve(files);
    });
  });
}

/**
 * Get list of modified files (staged + unstaged).
 */
export async function getModifiedFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    exec("git diff --name-only HEAD", (error, stdout) => {
      if (error) {
        // If HEAD doesn't exist (new repo), try without HEAD
        exec("git diff --cached --name-only", (err2, stdout2) => {
          if (err2) {
            reject(err2);
            return;
          }
          const files = stdout2.split("\n").filter((line) => line.trim() !== "");
          resolve(files);
        });
        return;
      }
      const files = stdout
        .split("\n")
        .filter((line) => line.trim() !== "");
      resolve(files);
    });
  });
}

/**
 * Detect debug statements in modified files.
 */
export async function detectDebugStatements(
  patterns: string[] = ["console\\.log", "console\\.debug", "console\\.warn", "console\\.info", "debugger"],
  extensions: string[] = ["ts", "tsx", "js", "jsx"],
): Promise<DebugStatementMatch[]> {
  const modifiedFiles = await getModifiedFiles();

  // Filter by extensions
  const extRegex = new RegExp(`\\.(${extensions.join("|")})$`);
  const targetFiles = modifiedFiles.filter((f) => extRegex.test(f));

  if (targetFiles.length === 0) {
    return [];
  }

  const matches: DebugStatementMatch[] = [];
  const patternRegex = new RegExp(`(${patterns.join("|")})`, "g");

  for (const file of targetFiles) {
    try {
      const content = await getFileContent(file);
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const match = line.match(patternRegex);
        if (match) {
          matches.push({
            file,
            line: index + 1,
            content: line.trim(),
            pattern: match[0],
          });
        }
      });
    } catch {
      // File might be deleted or inaccessible, skip
    }
  }

  return matches;
}

/**
 * Get file content from working directory.
 */
async function getFileContent(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`cat "${filePath}"`, { maxBuffer: 1024 * 1024 }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}
