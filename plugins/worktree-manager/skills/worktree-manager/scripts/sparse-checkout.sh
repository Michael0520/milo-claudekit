#!/bin/bash
# sparse-checkout.sh - Manage git sparse-checkout in worktrees
#
# Usage:
#   ./sparse-checkout.sh setup <worktree-path> <dir1> [dir2]...
#   ./sparse-checkout.sh list <worktree-path>
#   ./sparse-checkout.sh add <worktree-path> <dir1> [dir2]...
#   ./sparse-checkout.sh disable <worktree-path>
#
# Subcommands:
#   setup   - Initialize sparse-checkout with specified directories
#   list    - Show currently checked-out directories
#   add     - Add directories to existing sparse-checkout
#   disable - Disable sparse-checkout (restore full checkout)
#
# Examples:
#   ./sparse-checkout.sh setup ~/tmp/worktrees/my-project/feature-auth apps/api packages/core
#   ./sparse-checkout.sh list ~/tmp/worktrees/my-project/feature-auth
#   ./sparse-checkout.sh add ~/tmp/worktrees/my-project/feature-auth apps/frontend
#   ./sparse-checkout.sh disable ~/tmp/worktrees/my-project/feature-auth

set -e

SUBCOMMAND="$1"
WORKTREE_PATH="$2"
shift 2 2>/dev/null || true

# Validate inputs
if [ -z "$SUBCOMMAND" ] || [ -z "$WORKTREE_PATH" ]; then
    echo "Usage: $0 <setup|list|add|disable> <worktree-path> [directories...]"
    exit 1
fi

# Expand ~ in path
WORKTREE_PATH="${WORKTREE_PATH/#\~/$HOME}"

# Verify worktree exists
if [ ! -d "$WORKTREE_PATH" ]; then
    echo "Error: Worktree path does not exist: $WORKTREE_PATH"
    exit 1
fi

# Verify it's a git directory
if ! git -C "$WORKTREE_PATH" rev-parse --git-dir &>/dev/null; then
    echo "Error: Not a git repository: $WORKTREE_PATH"
    exit 1
fi

case "$SUBCOMMAND" in
    setup)
        DIRS=("$@")
        if [ ${#DIRS[@]} -eq 0 ]; then
            echo "Error: At least one directory required for setup"
            echo "Usage: $0 setup <worktree-path> <dir1> [dir2]..."
            exit 1
        fi

        echo "Setting up sparse-checkout in: $WORKTREE_PATH"
        echo "Directories: ${DIRS[*]}"

        git -C "$WORKTREE_PATH" sparse-checkout init --cone
        git -C "$WORKTREE_PATH" sparse-checkout set "${DIRS[@]}"

        echo ""
        echo "Sparse-checkout configured. Checked-out directories:"
        git -C "$WORKTREE_PATH" sparse-checkout list
        ;;

    list)
        if ! git -C "$WORKTREE_PATH" sparse-checkout list &>/dev/null; then
            echo "Sparse-checkout is not enabled in: $WORKTREE_PATH"
            exit 0
        fi

        echo "Sparse-checkout directories in: $WORKTREE_PATH"
        git -C "$WORKTREE_PATH" sparse-checkout list
        ;;

    add)
        DIRS=("$@")
        if [ ${#DIRS[@]} -eq 0 ]; then
            echo "Error: At least one directory required for add"
            echo "Usage: $0 add <worktree-path> <dir1> [dir2]..."
            exit 1
        fi

        # Get current directories
        CURRENT_DIRS=$(git -C "$WORKTREE_PATH" sparse-checkout list 2>/dev/null || echo "")
        if [ -z "$CURRENT_DIRS" ]; then
            echo "Sparse-checkout not initialized. Use 'setup' first."
            exit 1
        fi

        # Merge current + new directories
        ALL_DIRS=()
        while IFS= read -r dir; do
            [ -n "$dir" ] && ALL_DIRS+=("$dir")
        done <<< "$CURRENT_DIRS"
        ALL_DIRS+=("${DIRS[@]}")

        # Remove duplicates
        mapfile -t UNIQUE_DIRS < <(printf '%s\n' "${ALL_DIRS[@]}" | sort -u)

        echo "Adding directories to sparse-checkout in: $WORKTREE_PATH"
        echo "New directories: ${DIRS[*]}"

        git -C "$WORKTREE_PATH" sparse-checkout set "${UNIQUE_DIRS[@]}"

        echo ""
        echo "Updated sparse-checkout directories:"
        git -C "$WORKTREE_PATH" sparse-checkout list
        ;;

    disable)
        echo "Disabling sparse-checkout in: $WORKTREE_PATH"
        git -C "$WORKTREE_PATH" sparse-checkout disable

        echo "Sparse-checkout disabled. Full checkout restored."
        ;;

    *)
        echo "Unknown subcommand: $SUBCOMMAND"
        echo "Usage: $0 <setup|list|add|disable> <worktree-path> [directories...]"
        exit 1
        ;;
esac
