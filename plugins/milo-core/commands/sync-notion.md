---
description: Sync repo markdown files to Notion pages using MCP
argument-hint: [notion-page-url-or-id]
---

## Notion Sync Task

Sync all markdown files (*.md) from the current repo to their corresponding Notion pages.

### Steps

1. **Find markdown files**: Use Glob to find all `*.md` files in the repo root (exclude CLAUDE.md, README.md, and files in hidden directories)

2. **Identify Notion target**:
   - If `$ARGUMENTS` is provided, use it as the Notion page URL or ID
   - Otherwise, search Notion for a page matching the repo directory name

3. **Fetch page structure**: Use `notion-fetch` to get the main page and its sub-pages

4. **Map files to pages**: Match markdown filenames to Notion page titles by:
   - Stripping number prefixes (e.g., `01-`, `02-`)
   - Removing the `.md` extension
   - Matching against Notion sub-page titles

5. **Sync each file**:
   - Read the local markdown file content
   - Use `notion-update-page` with `replace_content` command to fully overwrite
   - Report success/failure for each file

### Arguments

- `$ARGUMENTS` (optional): Notion page URL or page ID
  - Example URL: `https://notion.so/workspace/Page-Title-abc123`
  - Example ID: `2bef08b5-ac20-80a8-ad04-d68b4b4812e1`

### Example Usage

```
/sync-notion
/sync-notion https://notion.so/your-page
/sync-notion 2bef08b5-ac20-80a8-ad04-d68b4b4812e1
```

### Output Format

Report a summary table after syncing:

| File | Notion Page | Status |
|------|-------------|--------|
| 01-xxx.md | Page Title | ✅ Synced |
| 02-yyy.md | Page Title | ✅ Synced |
| 03-zzz.md | Page Title | ❌ Failed (reason) |

### Prerequisites

1. Notion MCP must be configured:
   ```bash
   # Add to ~/.zshrc
   export NOTION_API_KEY="your-api-key"

   # Add MCP server
   claude mcp add notion --env NOTION_API_KEY=$NOTION_API_KEY -- npx @notionhq/notion-mcp-server
   ```

2. Notion integration must have access to target pages

### Notes

- This command requires Notion MCP to be configured
- Files are fully replaced (not merged) on each sync
- The command works with any repo that has markdown files
