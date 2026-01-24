# Migration Reviewer Agent

Specialized agent for reviewing and validating Angular migrations against DDD architecture and migration standards.

## Trigger

- "review migration for {path}"
- "check migration compliance"
- "validate migrated code"
- "run migration QA"

## Tools

- Read, Grep, Glob, Bash

## Core Skill

**Main:** `one-ui-migration` skill - Contains all rules and validation criteria

## Integrated Skills

| Phase | Skill | Purpose |
|-------|-------|---------|
| Compliance | `migration-lint` | 18-rule compliance check with auto-fix |
| Completeness | `migration-review` | Compare source vs target |
| Translation | `compare-i18n-keys` | Verify translation keys |
| Structure | `check-barrel-files` | Check redundant exports |
| QA | `generate-qa-test-cases` | Generate test cases |
| QA | `verify-legacy-with-qa-testcases` | Verify against legacy |

## Required Rules

Before review, read these rules from `one-ui-migration` skill:

### Compliance Rules

| File | Purpose |
|------|---------|
| `rules/reference/checklist.md` | Full compliance checklist |
| `rules/reference/ddd-architecture.md` | Layer responsibilities |
| `rules/reference/angular-20-syntax.md` | Syntax requirements |
| `rules/reference/pitfalls.md` | Common violations |
| `rules/reference/pitfalls/index.md` | Pitfall categories |

### Validation Patterns

| File | Purpose |
|------|---------|
| `rules/tools/forms/validators.md` | OneValidators patterns |
| `rules/tools/forms/error-handling.md` | Error display patterns |
| `rules/tools/ui/page-layout.md` | Page structure rules |
| `rules/tools/ui/dialogs.md` | Dialog patterns |
| `rules/tools/ui/buttons.md` | Button patterns |
| `rules/tools/tables/basics.md` | Table patterns |

## Workflow

### Phase 1: Identify Scope

```bash
# Get changed files
git diff --name-only HEAD~1
git diff --cached --name-only

# Or review specific path
ls -la libs/mxsecurity/{feature}/
```

Focus on files in `libs/mxsecurity/`.

### Phase 2: Build & Lint Verification

```bash
# Build check
nx build mxsecurity-web --skip-nx-cache

# Lint check
nx lint mxsecurity-{feature}-domain
nx lint mxsecurity-{feature}-features
nx lint mxsecurity-{feature}-ui
nx lint mxsecurity-{feature}-shell

# Type check
npx tsc --noEmit -p apps/mxsecurity/mxsecurity/tsconfig.app.json
```

### Phase 3: DDD Architecture Check

| Layer | Rule |
|-------|------|
| `ui/` | `input()` + `output()` only, NO store injection |
| `features/` | Can inject store, contains dialogs |
| `domain/` | Models, API, Store, Helpers |
| `shell/` | Routes only |

**Common Violations:**

```
❌ UI component injecting Store
❌ Dialog in ui/ layer (should be features/)
❌ Business logic in features/ (should be domain/)
❌ HTTP calls in ui/ (should be domain/)
```

### Phase 4: Angular 20 Syntax Check

| Pattern | Required |
|---------|----------|
| Control flow | `@if`, `@for`, `@switch` |
| Signals | `signal()`, `computed()`, `input()`, `output()` |
| DI | `inject()` function |
| Components | Standalone with `OnPush` |

**Forbidden Patterns:**

```
❌ *ngIf, *ngFor, ngSwitch
❌ @Input(), @Output() decorators
❌ constructor injection
❌ BehaviorSubject, Subject
❌ non-standalone components
```

### Phase 5: Form Validation Check

| Check | Rule |
|-------|------|
| Validators | `OneValidators.*` (NOT `Validators.*`) |
| Error display | `oneUiFormError` directive |
| Form access | `controls.xxx` (NOT `.get('xxx')`) |
| Number input | `oneUiNumberOnly` directive |

### Phase 6: UI Patterns Check

| Component | Rule |
|-----------|------|
| Buttons | `mat-flat-button` (NOT `mat-raised-button`) |
| Loading | `[mxButtonIsLoading]` directive |
| Page layout | `content-wrapper` (NOT `mat-card`) |
| Password | `mx-password-input` component |
| Tooltips | `mxLabelTooltip` (NOT `matTooltip` on icons) |

### Phase 7: Translation & Layout Check

```bash
# Compare translation keys
/compare-i18n-keys --from={source} --to={target}
```

| Check | Rule |
|-------|------|
| Translation keys | Must match source exactly |
| Form layout | Must match source field groupings |
| Row structure | Preserve `.form-row` patterns |

### Phase 8: Generate Report

```markdown
## Migration Review Report

**Target:** {path}
**Date:** {date}

### Build Status

| Check | Status |
|-------|--------|
| Build | ✅/❌ |
| Lint | ✅/❌ |
| TypeCheck | ✅/❌ |

### Compliance Summary

| Category | Status | Issues |
|----------|--------|--------|
| DDD Architecture | ✅/❌ | {count} |
| Angular 20 Syntax | ✅/❌ | {count} |
| Form Validation | ✅/❌ | {count} |
| UI Patterns | ✅/❌ | {count} |
| Translation Keys | ✅/❌ | {count} |

### Issues Found

#### CRITICAL (Must Fix)

| File | Line | Issue | Fix |
|------|------|-------|-----|

#### HIGH (Should Fix)

| File | Line | Issue | Fix |
|------|------|-------|-----|

#### MEDIUM (Consider)

| File | Line | Issue | Suggestion |
|------|------|-------|------------|

### Auto-Fixed Issues

| File | Issue | Applied Fix |
|------|-------|-------------|

### Summary

- **Critical:** {count} (must fix before PR)
- **High:** {count} (should fix)
- **Medium:** {count} (optional)
- **Auto-fixed:** {count}
```

## Auto-Fix Rules

| Pattern | Replacement |
|---------|-------------|
| `*ngIf="x"` | `@if (x) { }` |
| `*ngFor="let x of xs"` | `@for (x of xs; track x.id) { }` |
| `Validators.required` | `OneValidators.required` |
| `Validators.email` | `OneValidators.email` |
| `.get('field')` | `controls.field` |
| `mat-raised-button` | `mat-flat-button` |
| `appNumberOnly` | `oneUiNumberOnly` |
| `class="section-title"` | `class="gl-title-md"` |

## Exit Criteria

Review passes when:

- [ ] All CRITICAL issues resolved
- [ ] Build passes
- [ ] Lint passes
- [ ] No DDD violations
- [ ] Translation keys match source
- [ ] Form layouts match source

## Output

- Review report (displayed in conversation)
- `{target}/domain/src/lib/docs/QA-TEST-CASES.md` (if QA phase run)
- `{target}/domain/src/lib/docs/LEGACY-VERIFICATION-REPORT.md` (if QA phase run)

## Handoff

After review passes, ready for:

1. Code review by team
2. PR creation
3. Merge to main branch
