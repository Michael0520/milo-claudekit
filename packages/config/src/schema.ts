export enum CommitLogic {
  AND = "AND",
  OR = "OR",
}

/**
 * Configuration for enforcing Claude Code to not commit large changes.
 */
export type CommitConfig = {
  threshold: {
    enabled: boolean;
    maxFilesChanged?: number;
    maxLinesChanged?: number;
    logic?: CommitLogic;
    blockReason?: string;
  };
  /**
   * Configuration for detecting debug statements in staged files.
   */
  debugDetection?: {
    enabled: boolean;
    /** Patterns to detect (default: console.log, console.debug, debugger) */
    patterns?: string[];
    /** File extensions to check (default: ts, tsx, js, jsx) */
    extensions?: string[];
    /** Path patterns to exclude from detection (e.g., ["dist/", "node_modules/"]) */
    exclude?: string[];
    /** Whether to block commit or just warn (default: false = warn only) */
    enforce?: boolean;
    /** Custom warning message */
    warnMessage?: string;
  };
};

export type Rubric = {
  name?: string;
  pattern: string;
  path: string;
};

export type RubricConfig = {
  enforce?: boolean;
  rules?: Rubric[];
  reviewMessage?: string;
};

/**
 * Configuration for auto-formatting on Edit/Write operations.
 */
export type FormatConfig = {
  enabled: boolean;
  /** Run Prettier on JS/TS files (default: true) */
  prettier?: boolean;
  /** Run TypeScript compiler check (default: true) */
  tsc?: boolean;
  /** File extensions for Prettier (default: ts, tsx, js, jsx, json, css, scss, html) */
  prettierExtensions?: string[];
  /** File extensions for TSC (default: ts, tsx) */
  tscExtensions?: string[];
  /** Whether to block on format/type errors (default: false = warn only) */
  enforce?: boolean;
};

/**
 * Configuration for continuous learning pattern extraction.
 */
export type LearningConfig = {
  enabled: boolean;
  /** Minimum session messages before extraction (default: 10) */
  minSessionLength?: number;
  /** Directory to save learned patterns (default: ~/.claude/learned/) */
  outputDir?: string;
  /** Pattern categories to extract */
  categories?: Array<"error-resolution" | "framework-workaround" | "debugging" | "convention">;
};

/**
 * Guard rule for PreToolUse protection.
 */
export type GuardRule = {
  name: string;
  /** Tool name pattern (regex) */
  toolPattern: string;
  /** Command/input pattern to match (regex) */
  inputPattern?: string;
  /** Action: warn (show message) or block (prevent execution) */
  action: "warn" | "block";
  /** Message to show when triggered */
  message: string;
};

/**
 * Configuration for PreToolUse guards.
 */
export type GuardConfig = {
  enabled: boolean;
  /** Custom guard rules */
  rules?: GuardRule[];
  /** Enable built-in guards */
  builtIn?: {
    /** Warn before git push */
    gitPushConfirm?: boolean;
    /** Remind to use tmux for long-running commands */
    tmuxReminder?: boolean;
    /** Block dangerous rm commands */
    dangerousRm?: boolean;
  };
};

/**
 * Configuration for session memory persistence.
 */
export type SessionMemoryConfig = {
  enabled: boolean;
  /** Directory to store session data (default: ~/.claude/sessions/) */
  storageDir?: string;
  /** Number of days to retain sessions (default: 7) */
  retentionDays?: number;
  /** Maximum number of session files to keep (default: 50) */
  maxSessions?: number;
  /** What to include in session context */
  include?: {
    /** Current working directory */
    cwd?: boolean;
    /** Git branch info */
    gitBranch?: boolean;
    /** Recently modified files */
    recentFiles?: boolean;
    /** Custom notes/context */
    customContext?: boolean;
  };
};

export type Config = {
  commit?: CommitConfig;
  rubric?: RubricConfig;
  format?: FormatConfig;
  learning?: LearningConfig;
  guard?: GuardConfig;
  sessionMemory?: SessionMemoryConfig;
};
