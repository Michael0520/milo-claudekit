interface TerminalLine {
  type: "command" | "output" | "error" | "success";
  text: string;
  delay?: number;
}

export const pluginTerminalContent: Record<string, TerminalLine[]> = {
  git: [
    { type: "command", text: "git commit -m \"feat: add user authentication\"" },
    { type: "error", text: "Hook blocked: Too many changes detected", delay: 10 },
    { type: "output", text: "  Files changed: 15 (limit: 10)", delay: 5 },
    { type: "output", text: "  Lines changed: 847 (limit: 500)", delay: 3 },
    { type: "output", text: "Please split your commit into smaller chunks.", delay: 5 },
  ],

  rubric: [
    { type: "command", text: "claude rubric check src/" },
    { type: "output", text: "Checking code standards...", delay: 10 },
    { type: "success", text: "README.md - passed (3/3 criteria)", delay: 15 },
    { type: "success", text: "src/index.ts - passed (5/5 criteria)", delay: 5 },
    { type: "output", text: "All checks passed!", delay: 5 },
  ],

  superpowers: [
    { type: "command", text: "/tdd" },
    { type: "output", text: "Starting TDD workflow...", delay: 10 },
    { type: "error", text: "RED: test('validates input') - FAILED", delay: 15 },
    { type: "output", text: "Writing implementation...", delay: 10 },
    { type: "success", text: "GREEN: test('validates input') - PASSED", delay: 15 },
  ],

  worktree: [
    { type: "command", text: "claude worktree create feature/auth" },
    { type: "output", text: "Creating worktree at ../project-auth...", delay: 10 },
    { type: "success", text: "Worktree created successfully", delay: 15 },
    { type: "output", text: "Active worktrees:", delay: 5 },
    { type: "output", text: "  main          /project", delay: 3 },
    { type: "output", text: "  feature/auth  /project-auth", delay: 3 },
  ],

  "chrome-devtools": [
    { type: "command", text: "claude test:ui login-form" },
    { type: "output", text: "Launching Chrome DevTools...", delay: 10 },
    { type: "output", text: "→ Navigate to /login", delay: 15 },
    { type: "output", text: "→ Fill email: test@example.com", delay: 10 },
    { type: "output", text: "→ Click submit button", delay: 10 },
    { type: "success", text: "Login flow verified!", delay: 10 },
  ],
};
