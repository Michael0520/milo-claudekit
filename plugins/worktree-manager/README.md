Worktree Manager
===

## Purpose

Git worktree management for parallel development with Claude Code agents. Create isolated worktrees with optional sparse-checkout for monorepos, allocate ports, and launch agents in separate terminal windows.

## Skills

| Skill | Description |
|-------|-------------|
| worktree-manager | Manage git worktrees for parallel development |

## Configuration

Skill config at `~/.claude/skills/worktree-manager/config.json`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `terminal` | string | `"ghostty"` | Terminal app (ghostty, iterm2, tmux) |
| `portPool.start` | number | `8100` | First port in pool |
| `portPool.end` | number | `8199` | Last port in pool |
| `portsPerWorktree` | number | `2` | Ports allocated per worktree |
| `sparseCheckout.enabled` | boolean | `false` | Enable sparse-checkout for new worktrees |
| `sparseCheckout.defaultDirectories` | string[] | `[]` | Default directories to check out when sparse-checkout is enabled |
