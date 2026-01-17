Worktree Manager
===

## Purpose

Git worktree management for parallel development with Claude Code agents. Create isolated worktrees, allocate ports, and launch agents in separate terminal windows.

## Skills

| Skill | Description |
|-------|-------------|
| worktree-manager | Manage git worktrees for parallel development |

## Configuration

Skill config at `~/.claude/skills/worktree-manager/config.json`:

| Option | Default | Description |
|--------|---------|-------------|
| terminal | ghostty | Terminal app (ghostty, iterm2, tmux) |
| portPool.start | 8100 | First port in pool |
| portPool.end | 8199 | Last port in pool |
| portsPerWorktree | 2 | Ports allocated per worktree |
