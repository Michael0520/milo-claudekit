---
name: one-ui-migration-checker
description: Checking One-UI migration compliance against 29 rules. Trigger: check migration for {path}
tools: Read, Grep, Glob, Bash
model: sonnet
---

# One-UI Migration Checker

Check code against one-ui migration rules. Violations = PR rejected.

## Rules Reference

**Rules location**: `projects/one-ui/skills/one-ui-migration/rules/`

```
rules/
├── index.md                    # Router entry
├── tools/                      # Tool reference (9 files)
│   ├── one-validators.md
│   ├── form-builder.md
│   ├── signal-store.md
│   ├── common-table.md
│   ├── dialog.md
│   ├── mx-components.md
│   ├── page-layout.md
│   ├── transloco.md
│   └── auth.md
├── guides/                     # Integration guides (3 files)
│   ├── create-page.md
│   ├── create-dialog.md
│   └── create-table.md
└── reference/                  # Reference docs (3 files)
    ├── ddd-architecture.md
    ├── angular-20-syntax.md
    └── checklist.md
```

---

## Quick Check (29 Rules)

### Category A: Angular 20 Syntax (Rules 1-5)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 1 | Old control flow | `*ngIf`, `*ngFor` | `@if`, `@for (track)` | `reference/angular-20-syntax.md` |
| 2 | Old DI | `constructor(private x)` | `inject()` | `reference/angular-20-syntax.md` |
| 3 | Old decorators | `@Input()`, `@Output()` | `input()`, `output()` | `reference/angular-20-syntax.md` |
| 4 | Old state | `BehaviorSubject` | `signal()` | `tools/signal-store.md` |
| 5 | Async pipe | `\| async` | Signal call `()` | `tools/signal-store.md` |

### Category B: Forms (Rules 6-8)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 6 | Wrong validators | `Validators.required` | `OneValidators.required` | `tools/one-validators.md` |
| 7 | Nullable forms | `inject(FormBuilder)` | `NonNullableFormBuilder` | `tools/form-builder.md` |
| 8 | No error directive | `<mat-error>` without directive | `oneUiFormError` | `tools/mx-components.md` |

### Category C: Storage & Types (Rules 9-11)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 9 | Wrong storage | `localStorage` | `sessionStorage` + `mx_token` | `tools/auth.md` |
| 10 | Wrong button | `mat-raised-button` | `mat-flat-button` | `tools/mx-components.md` |
| 11 | No type | `: any` | Proper type | `reference/checklist.md` |

### Category D: DDD Layer (Rules 12-13)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 12 | Store in UI layer | `inject(Store)` in ui/ | Move to features/ | `reference/ddd-architecture.md` |
| 13 | HTTP in features | `HttpClient` in features/ | Move to domain/ | `reference/ddd-architecture.md` |

### Category E: UI Patterns - Page Layout (Rules 14-15)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 14 | Wrong page wrapper | `mat-card` | `gl-page-content` + `content-wrapper` | `tools/page-layout.md` |
| 15 | Old translation pipe | `\| translate` | `*transloco="let t"` | `tools/transloco.md` |

### Category F: UI Patterns - Dialog (Rules 16-19)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 16 | Loading button clickable | `[disabled]="form.invalid"` | Add `\|\| loading()` | `tools/dialog.md` |
| 17 | Dialog closes on error | `close()` after submit | Close in `next:` callback only | `tools/dialog.md` |
| 18 | Missing viewContainerRef | `dialog.open()` without vcr | Pass `viewContainerRef` | `tools/dialog.md` |
| 19 | Manual cancel handler | `(click)="cancel()"` | Use `mat-dialog-close` | `tools/dialog.md` |

### Category G: UI Patterns - Table (Rules 20-23)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 20 | Text overflow | Plain text in cell | `gl-ellipsis-text` + `mxAutoTooltip` | `tools/common-table.md` |
| 21 | Custom column no filter | `noAutoGenerate: true` without `filter` | Add filter function | `tools/common-table.md` |
| 22 | Missing MatSortModule | `mat-sort-header` without import | Import `MatSortModule` | `tools/common-table.md` |

### Category H: UI Patterns - Tabs (Rules 23-24)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 23 | Missing mxTabGroup | `mat-tab-group` without directive | Add `mxTabGroup` | `tools/mx-components.md` |
| 24 | Tab animation | No `animationDuration="0ms"` | Add attribute | `tools/mx-components.md` |

### Category I: UI Patterns - Button (Rules 25-26)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 25 | Loading but not disabled | `mxButtonIsLoading` without `loading()` in disabled | Add `\|\| loading()` | `tools/mx-components.md` |

### Category J: State Management (Rules 26-27)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 26 | Old rxMethod | `rxMethod` | `queryMethod`/`mutationMethod` | `tools/signal-store.md` |

### Category K: Translation (Rules 27-29)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 27 | Creating new keys | Key not in Legacy en.json | Use existing keys only | `tools/transloco.md` |

---

## Detection Commands

Run these in order. Stop at first failure category.

### Category A: Angular 20 Syntax (Rules 1-5)

```bash
# 1. Old control flow
rg -n '\*ngIf|\*ngFor|\[ngSwitch\]' --type html {path}

# 2. Constructor injection
rg -n 'constructor\(private|constructor\(readonly' --type ts --glob '!*.spec.ts' {path}

# 3. Old decorators
rg -n '@Input\(\)|@Output\(\)' --type ts --glob '!*.spec.ts' {path}

# 4. BehaviorSubject
rg -n 'BehaviorSubject|Subject<' --type ts --glob '!*.spec.ts' {path}

# 5. Async pipe
rg -n '\| async' --type html {path}
```

### Category B: Forms (Rules 6-8)

```bash
# 6. Angular Validators
rg -n 'Validators\.' --type ts --glob '!*.spec.ts' {path}

# 7. FormBuilder (should be NonNullableFormBuilder)
rg -n 'inject\(FormBuilder\)' --type ts --glob '!*.spec.ts' {path}

# 8. mat-error without oneUiFormError
rg -n '<mat-error>' --type html {path} | rg -v 'oneUiFormError'
```

### Category C: Storage & Types (Rules 9-11)

```bash
# 9. localStorage
rg -n 'localStorage' --type ts --glob '!*.spec.ts' {path}

# 10. mat-raised-button
rg -n 'mat-raised-button' --type html {path}

# 11. any type
rg -n ': any\b|as any\b' --type ts --glob '!*.spec.ts' {path}
```

### Category D: DDD Layer (Rules 12-13)

```bash
# 12. Store in UI layer (WRONG)
rg -n 'inject\(.*Store\)' --glob '**/ui/**/*.ts' --glob '!*.spec.ts' {path}

# 13. HttpClient in features (WRONG)
rg -n 'inject\(HttpClient\)' --glob '**/features/**/*.ts' --glob '!*.spec.ts' {path}
```

### Category E: UI Patterns - Page Layout (Rules 14-15)

```bash
# 14. mat-card (should be gl-page-content)
rg -n 'mat-card' --type html {path}

# 15. Old translation pipe
rg -n '\| translate' --type html {path}
```

### Category F: UI Patterns - Dialog (Rules 16-19)

```bash
# 16. Loading button - check if disabled includes loading()
rg -n 'mxButtonIsLoading' --type html {path} -A2 -B2

# 17. Dialog close - should be inside next: callback
rg -n '\.close\(\)' --type ts --glob '**/*dialog*.ts' --glob '!*.spec.ts' {path} -B5

# 18. dialog.open without viewContainerRef
rg -n '\.open\(' --type ts --glob '!*.spec.ts' {path} -A5 | rg -v 'viewContainerRef'

# 19. Manual cancel handler
rg -n '\(click\)="cancel\(\)"|\(click\)="onCancel\(\)"' --type html {path}
```

### Category G: UI Patterns - Table (Rules 20-22)

```bash
# 20. Table cells without ellipsis (manual review)
rg -n 'matCellDef' --type html {path} | rg -v 'gl-ellipsis-text|mx-status|mat-icon|mat-checkbox'

# 21. noAutoGenerate without filter function
rg -n 'noAutoGenerate.*true' --type ts {path} -A10

# 22. mat-sort-header usage (check imports separately)
rg -n 'mat-sort-header' --type html {path}
```

### Category H: UI Patterns - Tabs (Rules 23-24)

```bash
# 23. mat-tab-group without mxTabGroup
rg -n 'mat-tab-group' --type html {path} | rg -v 'mxTabGroup'

# 24. mat-tab-group without animationDuration
rg -n 'mat-tab-group' --type html {path} | rg -v 'animationDuration'
```

### Category I: UI Patterns - Button (Rule 25)

```bash
# 25. mxButtonIsLoading but disabled doesn't include loading()
rg -n 'mxButtonIsLoading' --type html {path} -B2 -A2
```

### Category J: State Management (Rule 26)

```bash
# 26. rxMethod (should be queryMethod/mutationMethod)
rg -n 'rxMethod' --type ts --glob '!*.spec.ts' {path}
```

---

## Report Format

```
═══════════════════════════════════════════════════════════════
  ONE-UI MIGRATION CHECK: {path}
═══════════════════════════════════════════════════════════════

❌ ERRORS (must fix before PR):

Category A: Angular 20 Syntax
1. [Rule 1] Old control flow (3 files)
   • page.component.html:15 - *ngIf="loading"
   • list.component.html:8 - *ngFor="let item of items"
   → Fix: @if (loading) { } / @for (item of items; track item.id) { }
   → Ref: rules/reference/angular-20-syntax.md

Category D: DDD Layer
2. [Rule 12] Store injected in UI layer (1 file)
   • ui/form.component.ts:12 - inject(UserStore)
   → Fix: Move component to features/ layer
   → Ref: rules/reference/ddd-architecture.md

Category F: Dialog
3. [Rule 16] Loading button still clickable (1 file)
   • dialog.component.html:45 - [disabled]="form.invalid"
   → Fix: [disabled]="form.invalid || loading()"
   → Ref: rules/tools/dialog.md

⚠️ WARNINGS (should fix):

1. [Rule 11] any type usage (2 files)
   • api.ts:45 - response: any
   → Fix: Add proper TypeScript type

📋 MANUAL REVIEW NEEDED:

1. [Rule 17] Dialog close timing - verify close is in next: callback
2. [Rule 20] Table cells - verify text columns use gl-ellipsis-text
3. [Rule 21] Custom columns - verify filter functions exist

───────────────────────────────────────────────────────────────
  SUMMARY: 3 errors, 1 warning, 3 manual reviews
  STATUS: ❌ NOT READY FOR PR
═══════════════════════════════════════════════════════════════
```

---

## Quick Scan Script

```bash
echo "=== One-UI Migration Quick Scan: {path} ==="

echo -e "\n[A] Angular 20 Syntax (Rules 1-5):"
echo -n "  *ngIf/*ngFor: "; rg -c '\*ngIf|\*ngFor' --type html {path} 2>/dev/null | wc -l
echo -n "  constructor DI: "; rg -c 'constructor\(private' --type ts {path} 2>/dev/null | wc -l
echo -n "  @Input/@Output: "; rg -c '@Input\(\)|@Output\(\)' --type ts {path} 2>/dev/null | wc -l
echo -n "  BehaviorSubject: "; rg -c 'BehaviorSubject' --type ts {path} 2>/dev/null | wc -l
echo -n "  | async: "; rg -c '\| async' --type html {path} 2>/dev/null | wc -l

echo -e "\n[B] Forms (Rules 6-8):"
echo -n "  Validators.: "; rg -c 'Validators\.' --type ts {path} 2>/dev/null | wc -l
echo -n "  FormBuilder: "; rg -c 'inject\(FormBuilder\)' --type ts {path} 2>/dev/null | wc -l
echo -n "  mat-error no directive: "; rg '<mat-error>' --type html {path} 2>/dev/null | rg -vc 'oneUiFormError' 2>/dev/null || echo "0"

echo -e "\n[C] Storage & Types (Rules 9-11):"
echo -n "  localStorage: "; rg -c 'localStorage' --type ts {path} 2>/dev/null | wc -l
echo -n "  mat-raised-button: "; rg -c 'mat-raised-button' --type html {path} 2>/dev/null | wc -l
echo -n "  any type: "; rg -c ': any' --type ts {path} 2>/dev/null | wc -l

echo -e "\n[D] DDD Layer (Rules 12-13):"
echo -n "  Store in ui/: "; rg -c 'inject\(.*Store\)' --glob '**/ui/**/*.ts' {path} 2>/dev/null | wc -l
echo -n "  HttpClient in features/: "; rg -c 'inject\(HttpClient\)' --glob '**/features/**/*.ts' {path} 2>/dev/null | wc -l

echo -e "\n[E] Page Layout (Rules 14-15):"
echo -n "  mat-card: "; rg -c 'mat-card' --type html {path} 2>/dev/null | wc -l
echo -n "  | translate: "; rg -c '\| translate' --type html {path} 2>/dev/null | wc -l

echo -e "\n[F] Dialog (Rules 16-19):"
echo -n "  mxButtonIsLoading: "; rg -c 'mxButtonIsLoading' --type html {path} 2>/dev/null | wc -l
echo -n "  .close() calls: "; rg -c '\.close\(\)' --glob '**/*dialog*.ts' {path} 2>/dev/null | wc -l
echo -n "  cancel handlers: "; rg -c '\(click\)="cancel' --type html {path} 2>/dev/null | wc -l

echo -e "\n[G] Table (Rules 20-22):"
echo -n "  matCellDef: "; rg -c 'matCellDef' --type html {path} 2>/dev/null | wc -l
echo -n "  noAutoGenerate: "; rg -c 'noAutoGenerate' --type ts {path} 2>/dev/null | wc -l
echo -n "  mat-sort-header: "; rg -c 'mat-sort-header' --type html {path} 2>/dev/null | wc -l

echo -e "\n[H] Tabs (Rules 23-24):"
echo -n "  mat-tab-group: "; rg -c 'mat-tab-group' --type html {path} 2>/dev/null | wc -l

echo -e "\n[J] State (Rule 26):"
echo -n "  rxMethod: "; rg -c 'rxMethod' --type ts {path} 2>/dev/null | wc -l

echo -e "\n=== Scan Complete ==="
```

---

## Rule Severity

| Severity | Rules | Description |
|----------|-------|-------------|
| **BLOCKER** | 1-5, 12-13 | PR will be rejected |
| **ERROR** | 6-10, 14-19, 23-26 | Must fix |
| **WARNING** | 11, 20-22 | Should fix |

---

## Notes

1. **Zero tolerance**: Rules 1-5, 12-13 are PR blockers
2. **Exclude tests**: Always use `--glob '!*.spec.ts'`
3. **Manual review**: Rules 17, 20, 21 need context check
4. **Reference files**: Always point to specific `rules/` file for fixes
