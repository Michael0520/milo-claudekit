# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Milo ClaudeKit is a collection of Claude Code plugins maintained by Michael0520. The repository is organized as a bun monorepo containing multiple plugins that extend Claude Code's capabilities.

## Repository Structure

This is a bun workspace monorepo with two main directories:

**`packages/`** - Shared TypeScript libraries:
- `@claudekit/config` - Configuration loading with deep merge support for `claudekit.json` and `claudekit.local.json`
- `@claudekit/hook` - Hook system utilities for Claude Code hooks (stdin JSON parsing, stop hook helpers)

**`plugins/`** - Claude Code plugins:
```
plugins/
├── chrome-devtools-mcp/   # UI testing via Chrome DevTools MCP
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   └── chrome-devtools-mcp/
│   │       └── SKILL.md
│   └── README.md
├── dependabot/            # Dependabot PR management
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   ├── merge.md
│   │   └── setup.md
│   └── README.md
├── git/                   # Git operations with hooks
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   └── ignore.md
│   ├── hooks/
│   │   └── hooks.json
│   ├── src/
│   │   ├── commit.ts
│   │   └── git.ts
│   └── README.md
├── license/               # License management
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   └── setup.md
│   └── README.md
├── one-ui-migration/      # Angular 16→20 migration
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   └── one-ui-migration/
│   │       ├── SKILL.md
│   │       └── rules/
│   └── README.md
├── rubric/                # Code standards validation
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   │   ├── config.md
│   │   └── create.md
│   ├── hooks/
│   │   └── hooks.json
│   ├── src/
│   │   └── review.ts
│   └── README.md
├── milo-core/             # Personal settings backup
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── rules/
│   ├── docs/
│   ├── agents/
│   ├── commands/
│   ├── hooks/
│   └── README.md
└── worktree-manager/      # Git worktree management
    ├── .claude-plugin/
    │   └── plugin.json
    ├── skills/
    │   └── worktree-manager/
    │       ├── SKILL.md
    │       ├── scripts/
    │       └── templates/
    └── README.md
```

**Important**: Plugin `dist/` directories are tracked in git. This is intentional - Claude Code plugin marketplace requires built executables to be present in the repository, as plugins are installed directly from git without a build step.

## Build Commands

Build all plugins:
```bash
bun run build
```

This runs the build script in each workspace package recursively.

**Build Process**:
- TypeScript compilation (`tsc`) generates type definitions
- Rolldown bundles source into single executable files in `dist/`
- Plugins with build scripts (`git`, `rubric`) require building when hook logic changes
- Packages (`config`, `hook`) are consumed directly via TypeScript source (`"main": "src/index.ts"`)

## Plugin Architecture

Each plugin follows a consistent structure:

1. **Plugin manifest** (`.claude-plugin/plugin.json`): Contains plugin metadata (name, description, version, author)
2. **Command definitions** (`commands/*.md`): Markdown files with procedural instructions
3. **Skills** (`skills/*/SKILL.md`): Knowledge and workflow definitions
4. **Hooks** (`hooks/hooks.json` + `src/*.ts`): Intercept Claude Code operations
5. **Documentation** (`README.md`): User-facing documentation

## Plugins Overview

| Plugin | Type | Source | Description |
|--------|------|--------|-------------|
| chrome-devtools-mcp | Skill | Local | UI testing and browser automation via Chrome DevTools MCP |
| dependabot | Commands | Local | Manage Dependabot PRs in GitHub repositories |
| git | Commands + Hook | Local | Git operations with commit threshold enforcement |
| license | Commands | Local | Manage open source licenses |
| milo-core | Rules + Docs + Agents | Local | Personal Claude Code settings backup |
| one-ui-migration | Skill | Local | Angular 16→20 migration with DDD architecture |
| rubric | Commands + Hook | Local | Automated code standards checks |
| superpowers | Skills + Commands | External | TDD, debugging, code review, planning workflows |
| worktree-manager | Skill | Local | Git worktree management for parallel development |

## Configuration System

ClaudeKit uses a hierarchical configuration system via `@claudekit/config`:

**Search Order** (later overrides earlier):
1. `claudekit.config.json` / `claudekit.json` (project-wide)
2. `.claude/claudekit.config.json` / `.claude/claudekit.json` (project-wide)
3. `claudekit.local.json` / `.claude/claudekit.local.json` (gitignored local overrides)

**Current Config Options**:

Git plugin:
- `commit.threshold.enabled` - Enable/disable commit size checks
- `commit.threshold.maxFilesChanged` - File count limit (default: 10)
- `commit.threshold.maxLinesChanged` - Line count limit (default: 500)
- `commit.threshold.logic` - "OR" (either) or "AND" (both) for thresholds

Rubric plugin:
- `rubric.enforce` - Block operations on violations (default: true)
- `rubric.rules` - Array of rule objects with pattern and path

## Marketplace Management

**Marketplace Configuration** (`.claude-plugin/marketplace.json`):
- **name**: `milo-claudekit`
- **owner**: `Michael0520`
- **plugins**: 8 local plugins + 1 external plugin (superpowers)

**Installation**:
```
/plugin marketplace add Michael0520/milo-claudekit
/plugin install <plugin-name>@milo-claudekit
```

## Development Notes

- **Package Manager**: bun
- **Plugin Distribution**: Via Claude Code plugin marketplace at `Michael0520/milo-claudekit`
- **License**: MIT

## Creating New Plugins

1. Create plugin directory: `plugins/<plugin-name>/`
2. Add plugin manifest: `.claude-plugin/plugin.json`
3. Add commands (`commands/*.md`) or skills (`skills/*/SKILL.md`)
4. Optional: Add hooks for intercepting operations
5. Update `marketplace.json` to include the new plugin
6. Build if needed: `bun run build`
