# Prompt Templates

Reusable patterns for effective Claude Code prompts.

## Bug Fix Template

```
fix [error message] in [file path]
- Expected: [what should happen]
- Actual: [what's happening]
- Steps to reproduce: [if applicable]
```

**Example:**
```
fix "Cannot read property 'id' of undefined" in src/hooks/useAuth.ts:42
- Expected: user object with id
- Actual: undefined after logout
```

## Refactor Template

```
refactor [component/function] in [file path]
- Current: [describe current approach]
- Target: [describe desired approach]
- Constraint: [what should NOT change]
```

**Example:**
```
refactor UserList component in src/components/UserList.tsx
- Current: uses RxJS valueChanges with takeUntilDestroyed
- Target: use toSignal + effect pattern
- Constraint: keep existing form validation logic
```

## Feature Template

```
add [feature] to [file/component]

Requirements:
1. [specific requirement]
2. [specific requirement]

Success criteria:
- [ ] [testable outcome]
- [ ] [testable outcome]
```

**Example:**
```
add password strength indicator to ChangePasswordDialog

Requirements:
1. Show strength as weak/medium/strong
2. Update in real-time as user types
3. Block submit if strength < medium

Success criteria:
- [ ] Visual indicator shows 3 levels
- [ ] Updates without page refresh
- [ ] Submit disabled for weak passwords
```

## Exploration Template

```
explore [topic/component] in [scope]

Focus on:
1. [specific aspect]
2. [specific aspect]

Goal: [why you need this information]
```

**Example:**
```
explore Signal patterns in libs/switch/snmp/features/

Focus on:
1. How toSignal replaces valueChanges
2. How effect handles side effects
3. How computed derives values

Goal: Apply same pattern to change-password-dialog
```

## Comparison Template

```
compare [option A] vs [option B] for [use case]

Criteria:
- [criterion 1]
- [criterion 2]

Context: [your specific situation]
```

**Example:**
```
compare Redis vs in-memory caching for API responses

Criteria:
- Latency for 1000 req/sec
- Memory usage
- Complexity to implement

Context: Single server deployment, 90% read traffic
```

## Translation/Migration Template

```
translate/migrate [what] in [file path]

Rules:
- DO: [what to change]
- DON'T: [what to preserve]
```

**Example:**
```
translate Chinese comments in src/core/graph.ts to English

Rules:
- DO: Translate JSDoc comments and inline comments
- DON'T: Change code logic or variable names
```

## Quick Patterns

| Task | Pattern |
|------|---------|
| Debug | `debug [symptom] in [file] - check [suspected area]` |
| Optimize | `optimize [target] in [file] to [measurable goal]` |
| Test | `add tests for [function] covering [scenarios]` |
| Review | `review [file] for [specific concerns]` |
| Document | `add JSDoc to [function] explaining [key behaviors]` |

## Anti-Patterns to Avoid

| Bad | Better |
|-----|--------|
| `fix the bug` | `fix auth error in src/login.ts where JWT fails` |
| `make it better` | `optimize query in src/db.ts to < 200ms` |
| `update the component` | `update Button in src/Button.tsx to use new tokens` |
| `add caching` | `add Redis caching to /api/users with 5min TTL` |
