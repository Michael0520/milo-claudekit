---
description: Guidelines for writing effective prompts
---
# Prompt Quality Rules

## The Golden Rule

> "If a colleague with minimal context would be confused, Claude will be too."

## Quality Checklist

Before sending a prompt, ensure it has:

- [ ] **What**: Clear action to take
- [ ] **Where**: File path or component name
- [ ] **Why**: Context or goal (if not obvious)
- [ ] **How**: Approach hint (if multiple options exist)

## Scoring Guide

| Score | Description | Example |
|-------|-------------|---------|
| 9-10 | Clear + specific + actionable | `fix JWT error in src/auth.ts:42 - token expires too early` |
| 7-8 | Clear with minor gaps | `fix JWT error in src/auth.ts` |
| 5-6 | Needs some clarification | `fix the auth error` |
| 1-4 | Too vague to act | `fix the bug` |

## Context-Aware Brevity

Short prompts are OK when context is clear:

### High Context (OK to be brief)
- After reading a file → `fix line 42`
- After discussing approach → `do it`
- Git commands → `git commit` (diff provides context)
- Answering questions → `yes`, `option 2`
- Build/test → `run tests` (project structure is known)

### Low Context (Need more detail)
- Session start → Full context needed
- New topic → Specify file and requirements
- Ambiguous → Clarify which one

## Common Issues

### Missing File Path
```
❌ "fix the validation"
✅ "fix email validation in src/utils/validator.ts"
```

### Missing Error Details
```
❌ "it's not working"
✅ "login fails with 401 - expected redirect to /dashboard"
```

### Vague Goals
```
❌ "optimize it"
✅ "reduce UserList render time from 800ms to <200ms"
```

### Missing Approach
```
❌ "add caching"
✅ "add Redis caching with 5min TTL, invalidate on user update"
```

## Templates Reference

See `~/.claude/docs/prompt-templates.md` for reusable patterns:
- Bug fix template
- Refactor template
- Feature template
- Exploration template
