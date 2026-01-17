# Migration Checklist

## Quick Verification Commands

```bash
# Check for forbidden patterns (all should return 0 results)
rg -n 'BehaviorSubject|Subject<' --type ts --glob '!*.spec.ts' {path}
rg -n 'constructor\(private' --type ts --glob '!*.spec.ts' {path}
rg -n ': any' --type ts --glob '!*.spec.ts' {path}
rg -n '\*ngIf|\*ngFor' --type html {path}
rg -n 'mat-raised-button' --type html {path}
rg -n 'localStorage' --type ts --glob '!*.spec.ts' {path}

# Lint & Test
nx lint {scope}-{feature}-domain
nx test {scope}-{feature}-domain --coverage
npx tsc --noEmit --project libs/{scope}/{feature}/domain/tsconfig.lib.json
```

---

## Angular 20 Syntax (8 items)

- [ ] Convert to standalone component
- [ ] All `*ngIf` → `@if`
- [ ] All `*ngFor` → `@for` (with `track item.id`)
- [ ] All `*ngSwitch` → `@switch`
- [ ] All constructor DI → `inject()`
- [ ] All `@Input()` → `input()` or `input.required()`
- [ ] All `@Output()` → `output()`
- [ ] All `BehaviorSubject` → `signal()`

---

## State Management (8 items)

- [ ] Use NgRx SignalStore pattern
- [ ] Use `queryMethod` for GET requests (auto page loading)
- [ ] Use `mutationMethod` for POST/PUT/DELETE (auto snackbar)
- [ ] Use `showPageLoading: false` for background refresh
- [ ] Extend `LoadingState` interface in store state
- [ ] Use `loadingInitialState` spread in initial state
- [ ] All `| async` → signal call `()`
- [ ] All `combineLatest` → `computed()`

---

## DDD Architecture (18 items)

### Layer Placement
- [ ] Business logic / API → `domain/`
- [ ] Smart component → `features/`
- [ ] Dialog → `features/`
- [ ] Table / Form → `ui/`
- [ ] Routes → `shell/`

### 4-File Pattern in domain/
- [ ] `{feature}.model.ts` (UI view models, constants)
- [ ] `{feature}.api.ts` (HTTP calls)
- [ ] `{feature}.store.ts` (SignalStore)
- [ ] `{feature}.helper.ts` (optional, pure functions)

### API Types
- [ ] API types in `libs/mxsecurity/shared/domain/src/lib/api/*.api-model.ts`
- [ ] Import API types from `@one-ui/mxsecurity/shared/domain`

### UI Components
- [ ] Use `input()` to receive data
- [ ] Use `output()` to emit events
- [ ] NO store injection
- [ ] NO HTTP calls
- [ ] NO business logic

### Feature Components
- [ ] Inject stores
- [ ] Pass data to UI via `[property]`
- [ ] Handle UI events via `(event)`
- [ ] Manage dialog lifecycle

### Domain Layer
- [ ] Export public API via `index.ts`

---

## Form Validation (9 items)

- [ ] Import `{ OneValidators }` (not `{ Validators }`)
- [ ] `Validators.required` → `OneValidators.required`
- [ ] `Validators.minLength` → `OneValidators.minLength`
- [ ] `Validators.maxLength` → `OneValidators.maxLength`
- [ ] `Validators.pattern` → `OneValidators.pattern`
- [ ] Add `oneUiFormError` directive to `<mat-error>`
- [ ] Add `oneUiFormHint` directive to `<mat-hint>` for range fields
- [ ] Use `NonNullableFormBuilder` (not `FormBuilder`)
- [ ] Remove manual error message handling

---

## UI Components (12 items)

- [ ] All `mat-raised-button` → `mat-flat-button`
- [ ] All components use `OnPush`
- [ ] Use `MxStatusComponent` for status columns (not plain text)
- [ ] Use `mxLabelTooltip` for hints (not mat-icon with matTooltip)
- [ ] Use `mxLabelOptional` for optional fields
- [ ] Use `mx-file-uploader` for file inputs
- [ ] Use `[mxButtonIsLoading]` for submit buttons
- [ ] Include `loading()` in `[disabled]` condition: `form.invalid || loading()`
- [ ] Dialog close only on API success (use callback, not immediate close)
- [ ] Dialog uses `viewContainerRef` when injecting store
- [ ] Table toolbar order: Refresh → Create → Delete
- [ ] Use `oneUiTableMaxSize` directive for table footer

---

## Translation Keys (9 items)

- [ ] DO NOT create new translation keys
- [ ] DO NOT modify existing translation keys
- [ ] Read source HTML to find exact keys
- [ ] Copy keys exactly as they appear
- [ ] Verify keys exist in `assets/i18n/en.json`
- [ ] Use `general.*` for common terms
- [ ] Use `features.{feature}.*` for feature-specific
- [ ] Translation keys match source EXACTLY
- [ ] All tooltip/hint keys from source

---

## Form Layout (5 items)

- [ ] DO NOT change form field row groupings
- [ ] Analyze source for `fxLayout="row"` patterns
- [ ] Use `.form-row` class to maintain layout
- [ ] Field order matches source exactly
- [ ] Single vs multi-field rows match source

---

## Page Layout (4 items)

- [ ] Use `gl-page-content` wrapper class
- [ ] Use `content-wrapper` (not mat-card)
- [ ] Page component has NO padding (`:host { display: block; }`)
- [ ] Layout padding handled by shell/app layout

---

## Tab Group (4 items)

- [ ] Import `MxTabGroupDirective` from `@moxa/formoxa/mx-tabs`
- [ ] Add `MxTabGroupDirective` to imports array
- [ ] `mat-tab-group` has `mxTabGroup` directive
- [ ] `mat-tab-group` has `animationDuration="0ms"`
- [ ] `mat-tab-group` has `[mat-stretch-tabs]="false"`

---

## Storage & Auth (3 items)

- [ ] Token uses `sessionStorage` (not `localStorage`)
- [ ] Token key is `'mx_token'`
- [ ] Use `parseJwt` from `@one-ui/mx-ros/shared/domain`

---

## Code Quality (8 items)

- [ ] No `any` types (use proper TypeScript types)
- [ ] No magic numbers (use config constants)
- [ ] API endpoints centralized in `api.ts`
- [ ] Update imports to `@one-ui/mx-ros/*` paths
- [ ] Prefer type union over enum
- [ ] Use `readonly #` prefix for private injected services
- [ ] Lint passes
- [ ] Tests ≥ 95% coverage for domain layer

---

## Table Component (11 items)

- [ ] Use `CommonTableComponent` from `@one-ui/shared/ui`
- [ ] Create data item interface in domain layer (`model.ts`)
- [ ] Create table component in UI layer
- [ ] Define columns using `TableColumn<T>`
- [ ] Use `input()` for data, `output()` for events
- [ ] Custom columns have `noAutoGenerate: true`
- [ ] Custom columns have filter function for searchable
- [ ] Custom columns have `mat-sort-header` in `<th>`
- [ ] `EDIT_COLUMN_KEY` has `stickyEnd: true`
- [ ] Long text cells use `gl-ellipsis-text` class
- [ ] Long text cells use `mxAutoTooltip` directive

---

## Final Steps

1. Run `one-ui-migration-checker` agent: `check migration for {path}`
2. Run linting: `nx lint {scope}-{feature}-domain`
3. Run tests: `nx test {scope}-{feature}-domain --coverage`
4. Type check: `npx tsc --noEmit`
5. Visual comparison with Legacy app
