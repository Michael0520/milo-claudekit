# Migration Code Review Agent

Specialized code review agent for MXsecurity migration. Combines general code quality checks with migration-specific validation.

## Trigger

Invoke after completing migration work, before creating PR.

## Tools

- Read, Grep, Glob, Bash

## Workflow

### Phase 1: Identify Changes

```bash
git diff --name-only HEAD~1
git diff --cached --name-only
```

Focus only on modified files in `libs/mxsecurity/`.

### Phase 2: Build & Lint Verification

```bash
# Build check
nx build mxsecurity --skip-nx-cache

# Lint check
nx run-many -t lint -p $(echo $CHANGED_PROJECTS | tr '\n' ',') --skip-nx-cache

# Type check
npx tsc --noEmit -p apps/mxsecurity/mxsecurity/tsconfig.app.json
```

### Phase 3: Migration Compliance Check

Read `.claude/skills/one-ui-migration/SKILL.md` and verify:

#### DDD Architecture

| Check               | Rule                                            |
| ------------------- | ----------------------------------------------- |
| UI components       | `input()` + `output()` only, NO store injection |
| Features components | Can inject store                                |
| Dialogs             | Must be in `features/`, NOT `ui/`               |
| Forms/Tables        | Must be in `ui/`                                |

#### Angular 20 Syntax

| Pattern      | Required                                         |
| ------------ | ------------------------------------------------ |
| Control flow | `@if`, `@for`, `@switch` (NOT `*ngIf`, `*ngFor`) |
| Signals      | `signal()`, `computed()`, `input()`, `output()`  |
| DI           | `inject()` (NOT constructor injection)           |
| Components   | Standalone with `OnPush`                         |

#### Form Validation

| Check         | Rule                                   |
| ------------- | -------------------------------------- |
| Validators    | `OneValidators.*` (NOT `Validators.*`) |
| Error display | `oneUiFormError` directive             |
| Form access   | `controls.xxx` (NOT `.get('xxx')`)     |

### Phase 4: Security & Quality Check

#### CRITICAL (Must Fix)

- [ ] No hardcoded credentials or API keys
- [ ] No `console.log` or debugging statements
- [ ] No `any` types (use proper typing)
- [ ] No disabled ESLint rules without justification

#### HIGH (Should Fix)

- [ ] Functions < 50 lines
- [ ] Files < 400 lines
- [ ] Nesting depth < 4 levels
- [ ] Proper error handling in async operations

#### MEDIUM (Consider)

- [ ] Descriptive variable/function names
- [ ] No magic numbers (use constants)
- [ ] Comments explain "why", not "what"

### Phase 5: Migration-Specific Pitfalls

| Pitfall          | Check                                                  |
| ---------------- | ------------------------------------------------------ |
| Translation keys | Must match source exactly                              |
| Form layout      | Must match source field groupings                      |
| Page styling     | No padding in page components                          |
| Button order     | Refresh → Create/Delete (only if old code has refresh) |
| Password fields  | Use `mx-password-input`                                |
| Number input     | Use `oneUiNumberOnly` directive                        |

### Phase 6: Generate Report

```markdown
## Migration Code Review Report

**Branch:** {branch_name}
**Files Changed:** {count}
**Date:** {date}

### Build Status

- [ ] Build: PASS/FAIL
- [ ] Lint: PASS/FAIL
- [ ] TypeCheck: PASS/FAIL

### Migration Compliance

| Category          | Status | Issues  |
| ----------------- | ------ | ------- |
| DDD Architecture  | ✅/❌  | {count} |
| Angular 20 Syntax | ✅/❌  | {count} |
| Form Validation   | ✅/❌  | {count} |
| UI Patterns       | ✅/❌  | {count} |

### Issues Found

#### CRITICAL

| File | Line | Issue | Fix |
| ---- | ---- | ----- | --- |

#### HIGH

| File | Line | Issue | Fix |
| ---- | ---- | ----- | --- |

#### MEDIUM

| File | Line | Issue | Suggestion |
| ---- | ---- | ----- | ---------- |

### Auto-Fixed Issues

| File | Issue | Applied Fix |
| ---- | ----- | ----------- |

### Summary

- **Critical:** {count} (must fix before PR)
- **High:** {count} (should fix)
- **Medium:** {count} (optional)
- **Auto-fixed:** {count}
```

## Auto-Fix Rules

| Pattern                 | Replacement                      |
| ----------------------- | -------------------------------- |
| `*ngIf="x"`             | `@if (x) { }`                    |
| `*ngFor="let x of xs"`  | `@for (x of xs; track x.id) { }` |
| `Validators.required`   | `OneValidators.required`         |
| `Validators.email`      | `OneValidators.email`            |
| `.get('field')`         | `controls.field`                 |
| `mat-raised-button`     | `mat-flat-button`                |
| `appNumberOnly`         | `oneUiNumberOnly`                |
| `class="section-title"` | `class="gl-title-md"`            |

## Exit Criteria

- All CRITICAL issues resolved
- Build passes
- Lint passes
- No DDD violations
