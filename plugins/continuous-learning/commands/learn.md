---
description: Manually extract and save learnable patterns from current session
---

# /learn Command

Extract learnable patterns from the current session and save them to `~/.claude/learned/`.

## Usage

```
/learn
```

## What It Does

1. Analyzes the current conversation for learnable patterns
2. Identifies patterns in these categories:
   - **error-resolution**: How errors were diagnosed and fixed
   - **framework-workaround**: Workarounds for framework limitations
   - **debugging**: Debugging approaches and techniques
   - **convention**: Best practices and coding conventions
3. Saves patterns as markdown files to the learned directory

## Pattern Format

Each saved pattern includes:
- Category
- Date extracted
- Context (the problem)
- Solution (how it was resolved)

## Configuration

In `claudekit.json`:

```json
{
  "learning": {
    "enabled": true,
    "minSessionLength": 10,
    "outputDir": "~/.claude/learned/",
    "categories": ["error-resolution", "debugging"]
  }
}
```

## Notes

- Patterns are automatically extracted at session end if enabled
- Use this command for mid-session extraction
- Duplicate patterns are avoided by using timestamped filenames
