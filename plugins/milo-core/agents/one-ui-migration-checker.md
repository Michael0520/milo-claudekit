---
name: one-ui-migration-checker
description: Checking One-UI migration compliance against 16 rules. Trigger: check migration for {path}
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

## Quick Check (16 Rules)

| # | Symptom | Pattern | Fix | Reference |
|---|---------|---------|-----|-----------|
| 1 | Old control flow | `*ngIf`, `*ngFor` | `@if`, `@for (track)` | `reference/angular-20-syntax.md` |
| 2 | Old DI | `constructor(private x)` | `inject()` | `reference/angular-20-syntax.md` |
| 3 | Old decorators | `@Input()`, `@Output()` | `input()`, `output()` | `reference/angular-20-syntax.md` |
| 4 | Old state | `BehaviorSubject` | `signal()` | `tools/signal-store.md` |
| 5 | Async pipe | `\| async` | Signal call `()` | `tools/signal-store.md` |
| 6 | Wrong validators | `Validators.required` | `OneValidators.required` | `tools/one-validators.md` |
| 7 | Nullable forms | `inject(FormBuilder)` | `NonNullableFormBuilder` | `tools/form-builder.md` |
| 8 | Wrong storage | `localStorage` | `sessionStorage` + `mx_token` | `tools/auth.md` |
| 9 | Wrong button | `mat-raised-button` | `mat-flat-button` | `tools/mx-components.md` |
| 10 | No type | `: any` | Proper type | `reference/checklist.md` |
| 11 | Store in UI layer | `inject(Store)` in ui/ | Move to features/ | `reference/ddd-architecture.md` |
| 12 | HTTP in features | `HttpClient` in features/ | Move to domain/ | `reference/ddd-architecture.md` |
| 13 | Wrong page wrapper | `mat-card` | `gl-page-content` + `content-wrapper` | `tools/page-layout.md` |
| 14 | Loading button clickable | `[disabled]="form.invalid"` | Add `\|\| loading()` | `tools/dialog.md` |
| 15 | Dialog closes on error | `close()` after submit | Close in `next:` callback only | `tools/dialog.md` |
| 16 | Text overflow | Plain text in cell | `gl-ellipsis-text` + `mxAutoTooltip` | `tools/common-table.md` |

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

### Category B: Forms (Rules 6-7)

```bash
# 6. Angular Validators
rg -n 'Validators\.' --type ts --glob '!*.spec.ts' {path}

# 7. FormBuilder (should be NonNullableFormBuilder)
rg -n 'inject\(FormBuilder\)' --type ts --glob '!*.spec.ts' {path}
```

### Category C: Storage & Types (Rules 8-10)

```bash
# 8. localStorage
rg -n 'localStorage' --type ts --glob '!*.spec.ts' {path}

# 9. mat-raised-button
rg -n 'mat-raised-button' --type html {path}

# 10. any type
rg -n ': any\b|as any\b' --type ts --glob '!*.spec.ts' {path}
```

### Category D: DDD Layer (Rules 11-12)

```bash
# 11. Store in UI layer (WRONG)
rg -n 'inject\(.*Store\)' --glob '**/ui/**/*.ts' --glob '!*.spec.ts' {path}

# 12. HttpClient in features (WRONG)
rg -n 'inject\(HttpClient\)' --glob '**/features/**/*.ts' --glob '!*.spec.ts' {path}
```

### Category E: UI Patterns (Rules 13-16)

```bash
# 13. mat-card (should be gl-page-content)
rg -n 'mat-card' --type html {path}

# 14. Loading button - check if disabled includes loading()
rg -n 'mxButtonIsLoading' --type html {path} -A2 -B2

# 15. Dialog close - should be inside next: callback
rg -n '\.close\(\)' --type ts --glob '**/*dialog*.ts' --glob '!*.spec.ts' {path} -B5

# 16. Table cells without ellipsis
rg -n 'matCellDef' --type html {path} | rg -v 'gl-ellipsis-text|mx-status|mat-icon|mat-checkbox'
```

---

## Report Format

```
═══════════════════════════════════════════════════════════════
  ONE-UI MIGRATION CHECK: {path}
═══════════════════════════════════════════════════════════════

❌ ERRORS (must fix before PR):

1. [Rule 1] Old control flow (3 files)
   • page.component.html:15 - *ngIf="loading"
   • list.component.html:8 - *ngFor="let item of items"
   → Fix: @if (loading) { } / @for (item of items; track item.id) { }
   → Ref: rules/reference/angular-20-syntax.md

2. [Rule 11] Store injected in UI layer (1 file)
   • ui/form.component.ts:12 - inject(UserStore)
   → Fix: Move component to features/ layer
   → Ref: rules/reference/ddd-architecture.md

3. [Rule 14] Loading button still clickable (1 file)
   • dialog.component.html:45 - [disabled]="form.invalid"
   → Fix: [disabled]="form.invalid || loading()"
   → Ref: rules/tools/dialog.md

⚠️ WARNINGS (should fix):

1. [Rule 10] any type usage (2 files)
   • api.ts:45 - response: any
   → Fix: Add proper TypeScript type

───────────────────────────────────────────────────────────────
  SUMMARY: 3 errors, 1 warning
  STATUS: ❌ NOT READY FOR PR
═══════════════════════════════════════════════════════════════
```

---

## Quick Scan Script

```bash
echo "=== One-UI Migration Quick Scan: {path} ==="

echo -e "\n[1-5] Angular 20 Syntax:"
echo -n "  *ngIf/*ngFor: "; rg -c '\*ngIf|\*ngFor' --type html {path} 2>/dev/null | wc -l
echo -n "  constructor DI: "; rg -c 'constructor\(private' --type ts {path} 2>/dev/null | wc -l
echo -n "  @Input/@Output: "; rg -c '@Input\(\)|@Output\(\)' --type ts {path} 2>/dev/null | wc -l
echo -n "  BehaviorSubject: "; rg -c 'BehaviorSubject' --type ts {path} 2>/dev/null | wc -l
echo -n "  | async: "; rg -c '\| async' --type html {path} 2>/dev/null | wc -l

echo -e "\n[6-7] Forms:"
echo -n "  Validators.: "; rg -c 'Validators\.' --type ts {path} 2>/dev/null | wc -l
echo -n "  FormBuilder: "; rg -c 'inject\(FormBuilder\)' --type ts {path} 2>/dev/null | wc -l

echo -e "\n[8-10] Storage & Types:"
echo -n "  localStorage: "; rg -c 'localStorage' --type ts {path} 2>/dev/null | wc -l
echo -n "  mat-raised-button: "; rg -c 'mat-raised-button' --type html {path} 2>/dev/null | wc -l
echo -n "  any type: "; rg -c ': any' --type ts {path} 2>/dev/null | wc -l

echo -e "\n[11-12] DDD Layer:"
echo -n "  Store in ui/: "; rg -c 'inject\(.*Store\)' --glob '**/ui/**/*.ts' {path} 2>/dev/null | wc -l
echo -n "  HttpClient in features/: "; rg -c 'inject\(HttpClient\)' --glob '**/features/**/*.ts' {path} 2>/dev/null | wc -l

echo -e "\n[13] Page Layout:"
echo -n "  mat-card: "; rg -c 'mat-card' --type html {path} 2>/dev/null | wc -l

echo -e "\n=== Scan Complete ==="
```

---

## Notes

1. **Zero tolerance**: Rules 1-5, 11-12 are PR blockers
2. **Exclude tests**: Always use `--glob '!*.spec.ts'`
3. **False positives**: Rule 14-15 need manual review of context
4. **Reference files**: Always point to specific `rules/` file for fixes
