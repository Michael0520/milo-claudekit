---
description: Setup Nx MCP server for current Nx workspace
argument-hint: [--scope project|user]
---

## Setup Nx MCP

Configure the Nx MCP server for the current workspace.

### Steps

1. **Verify Nx workspace**: Check if `nx.json` exists in the current directory
   - If not found, stop and inform user this is not an Nx workspace

2. **Check existing configuration**: Run `claude mcp list` to check if nx-mcp is already configured
   - If already configured, inform user and ask if they want to reconfigure

3. **Determine scope**:
   - If `$ARGUMENTS` contains `--scope user`, use user scope
   - Default: `project` scope (creates `.mcp.json`, shareable via git)

4. **Install nx-mcp**:
   - Project scope: `claude mcp add --scope project nx-mcp -- npx nx-mcp@latest`
   - User scope: `claude mcp add --scope user nx-mcp -- npx nx-mcp@latest`

5. **Verify installation**: Run `claude mcp list` to confirm nx-mcp appears

6. **Optional - Nx AI init**: Ask user if they want to run `npx nx configure-ai-agents` to generate `CLAUDE.md` and `AGENTS.md`

### Arguments

- `$ARGUMENTS` (optional):
  - `--scope project` (default) — shared via `.mcp.json`, can commit to repo
  - `--scope user` — global, available in all projects

### Example Usage

```
/setup-nx-mcp
/setup-nx-mcp --scope user
```

### Prerequisites

- Current directory must be an Nx workspace (has `nx.json`)
- `npx` must be available
