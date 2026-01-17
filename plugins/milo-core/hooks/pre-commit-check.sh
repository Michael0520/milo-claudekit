#!/bin/bash
# Pre-commit check hook for Claude Code
# Intercepts git commit and forces user confirmation
# Ensures: 1) diff reviewed 2) related docs updated 3) no missing changes

read -r input
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Only intercept git commit commands
if [[ "$tool_name" == "Bash" && "$command" == *"git commit"* ]]; then
  cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Commit 前請確認:\n1. git diff --staged 已檢視\n2. 相關文件已更新 (README, CLAUDE.md 等)\n3. 無遺漏的變更"
  }
}
EOF
  exit 0
fi

exit 0
