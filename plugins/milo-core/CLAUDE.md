# CLAUDE.md - Global Standards

## Critical Rules

### Forbidden
- `rm -rf`, `sudo rm`, `chmod 777`
- Commit secrets, API keys, credentials
- Auto-commit without user approval
- Use `npm` (use `bun` instead)
- Using `any` type

### Required
- Show diff after code changes
- Ask before destructive operations
- Use current year (2025) in searches

**IMPORTANT: English only in code, comments, and code blocks. Never write Chinese in generated code.**

## Prompt Quality Guide

When I give you instructions, I'll follow these patterns. If my prompt is unclear, ask for clarification.

### Good Prompts Include
- **File path**: `fix bug in src/auth/login.ts` (not just "fix the bug")
- **Error context**: Include error message when debugging
- **Success criteria**: Define what "done" looks like
- **Approach hint**: Mention preferred method if multiple exist

### Context-Rich Brief Prompts Are OK
- `git commit` → You have git diff context
- `run tests` → You know the project's test command
- `yes/no/1/2` → Answering your question

### Templates
See `~/.claude/docs/prompt-templates.md` for reusable patterns.

## Quick Reference

| Topic | Superpowers Skill |
|-------|-------------------|
| **TDD** | `superpowers:test-driven-development` |
| **Debugging** | `superpowers:systematic-debugging` |
| **Code Review** | `superpowers:requesting-code-review` |
| **Planning** | `superpowers:writing-plans` |
| **DDD** | `~/.claude/rules/ddd.md` |
| **Git** | `<type>(scope): description` |
| **Package** | Always use `bun` |

## Tech Stack

- TypeScript 5.3+, Angular/React/Next.js
- State: SignalStore, Zustand, TanStack Query
- Testing: Vitest, Playwright
- Linting: Biome

## Context Management

For long sessions (50+ messages):
- Use `session-memory` skill for artifact trails
- Use `context-compression` skill at 70% utilization

## Browser Tool Selection

When browser automation is needed:
1. **Prefer** `mcp__chrome-devtools__*` if available (faster, more reliable)
2. **Fallback** to `agent-browser` skill if chrome-devtools MCP not connected

## Detailed Rules

See `~/.claude/rules/` for specifics:
- `ddd.md` - Architecture layers
- `typescript.md` - Type safety
- `security.md` - Security practices
- `angular-code-quality.md` - Angular best practices
- `prompt-quality.md` - Effective prompts

---
**Version**: 2025.6.0 | Integrated with Superpowers plugin
