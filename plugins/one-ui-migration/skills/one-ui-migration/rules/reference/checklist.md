# Migration Checklist

> 發現問題 → 看 Wrong/Correct → 快速修復
> 需要更多說明 → 點擊 📖 連結

---

## Quick Verification Commands

```bash
# Check for forbidden patterns (all should return 0 results)
rg -n 'BehaviorSubject|Subject<' --type ts --glob '!*.spec.ts' {path}
rg -n 'constructor\(private' --type ts --glob '!*.spec.ts' {path}
rg -n ': any' --type ts --glob '!*.spec.ts' {path}
rg -n '\*ngIf|\*ngFor|\*ngSwitch' --type html {path}
rg -n 'mat-raised-button' --type html {path}
rg -n 'localStorage' --type ts --glob '!*.spec.ts' {path}
rg -n '\| async' --type html {path}
rg -n '<mat-icon>[a-z_]+</mat-icon>' --type html {path}  # Text icons (should use svgIcon)

# Lint & Test
nx lint {scope}-{feature}-domain
nx test {scope}-{feature}-domain --coverage
npx tsc --noEmit --project libs/{scope}/{feature}/domain/tsconfig.lib.json
```

---

## Angular 20 Syntax (8 items)

📖 詳細: [angular-20-syntax.md](./angular-20-syntax.md)

### Control Flow

- [ ] All `*ngIf` → `@if`
- [ ] All `*ngFor` → `@for` (with `track`)
- [ ] All `*ngSwitch` → `@switch`

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `*ngIf="isLoading"` | `@if (isLoading()) { }` |
| `*ngFor="let item of items"` | `@for (item of items; track item.id) { }` |
| `[ngSwitch]="value"` | `@switch (value) { @case ('a') { } }` |

🔍 檢查: `rg -n '\*ngIf|\*ngFor|\*ngSwitch' --type html {path}`

### Dependency Injection

- [ ] All constructor DI → `inject()`

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `constructor(private store: MyStore)` | `readonly #store = inject(MyStore);` |
| `constructor(@Inject(TOKEN) data)` | `readonly data = inject(TOKEN);` |

🔍 檢查: `rg -n 'constructor\(private' --type ts {path}`

### Component I/O

- [ ] All `@Input()` → `input()` or `input.required()`
- [ ] All `@Output()` → `output()`

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `@Input() data: Item[] = []` | `data = input<Item[]>([]);` |
| `@Input() loading!: boolean` | `loading = input.required<boolean>();` |
| `@Output() edit = new EventEmitter<Item>()` | `edit = output<Item>();` |

### Signals

- [ ] All `BehaviorSubject` → `signal()`
- [ ] Convert to standalone component

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `new BehaviorSubject<boolean>(false)` | `signal<boolean>(false)` |
| `subject.value` | `sig()` |
| `subject.next(value)` | `sig.set(value)` |

🔍 檢查: `rg -n 'BehaviorSubject|Subject<' --type ts {path}`

---

## State Management (8 items)

📖 詳細: [signal-store.md](../tools/signal-store.md) | [loading-states.md](../tools/loading-states.md)

### SignalStore Pattern

- [ ] Use NgRx SignalStore pattern
- [ ] Extend `LoadingState` interface in store state
- [ ] Use `loadingInitialState` spread in initial state

```typescript
// ✅ Correct pattern
interface State extends LoadingState {
  items: Item[];
}

const initialState: State = {
  ...loadingInitialState,
  items: []
};

export const FeatureStore = signalStore(
  withState(initialState),
  withMethods((store, api = inject(ApiService)) => ({
    // ...
  }))
);
```

### API Methods

- [ ] Use `queryMethod` for GET requests (auto page loading)
- [ ] Use `mutationMethod` for POST/PUT/DELETE (auto snackbar)
- [ ] Use `showPageLoading: false` for background refresh

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `rxMethod<void>(pipe(...))` | `queryMethod<void, Data[]>({ store, observe, next })` |
| Manual `patchState({ loading: true })` | `queryMethod` handles automatically |

### Observable to Signal

- [ ] All `| async` → signal call `()`
- [ ] All `combineLatest` → `computed()`

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `{{ data$ \| async }}` | `{{ data() }}` |
| `*ngIf="loading$ \| async"` | `@if (loading()) { }` |
| `combineLatest([a$, b$])` | `computed(() => [a(), b()])` |

🔍 檢查: `rg -n '\| async' --type html {path}`

---

## Loading States (5 items)

📖 詳細: [loading-states.md](../tools/loading-states.md)

### Button Loading

- [ ] Use `[mxButtonIsLoading]` for submit buttons
- [ ] Include `loading()` in `[disabled]` condition

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `[disabled]="form.invalid"` | `[disabled]="form.invalid \|\| loading()"` |
| Only `[mxButtonIsLoading]` | `[mxButtonIsLoading]` + `loading()` in disabled |

```html
<!-- ❌ Wrong: Button still clickable during loading -->
<button [mxButtonIsLoading]="loading()" [disabled]="form.invalid">

<!-- ✅ Correct: Properly disabled -->
<button
  mat-flat-button
  [mxButtonIsLoading]="loading()"
  [disabled]="form.invalid || loading()"
  (click)="onSubmit()">
  {{ t('general.button.submit') }}
</button>
```

🔍 檢查: `rg -n 'mxButtonIsLoading.*disabled.*form\.invalid[^|]' --type html {path}`

### Dialog Close Timing

- [ ] Dialog close only on API success (use callback, not immediate close)

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `this.store.update(data); this.dialogRef.close();` | `this.store.update({ input: data, next: () => this.dialogRef.close() });` |

```typescript
// ❌ Wrong: Closes immediately, even on API failure
onSubmit(): void {
  this.#store.updateItem(formData);
  this.#dialogRef.close();
}

// ✅ Correct: Close only on success
onSubmit(): void {
  this.#store.updateItem({
    input: this.form.getRawValue(),
    next: () => this.#dialogRef.close({ success: true })
  });
}
```

### LoadingState Signals

- [ ] Use correct loading signal for UI

| Signal | Use Case |
|--------|----------|
| `fetching()` | GET requests (queryMethod) |
| `updating()` | POST/PUT/DELETE (mutationMethod) |
| `loading()` | Either (fetching \|\| updating) |
| `successful()` | After mutation succeeded - use in effect() |

---

## DDD Architecture (18 items)

📖 詳細: [ddd-architecture.md](./ddd-architecture.md)

### Layer Placement

- [ ] Business logic / API → `domain/`
- [ ] Smart component (injects Store) → `features/`
- [ ] Dialog → `features/` (NOT ui/)
- [ ] Table / Form (dumb component) → `ui/`
- [ ] Routes → `shell/`

| Component Type | Layer | Can Inject |
|---------------|-------|------------|
| API Service | domain/ | HttpClient, MxRestService |
| Store | domain/ | ApiService |
| Page Component | features/ | Store, MatDialog |
| Dialog | features/ | Store, DialogRef |
| Table | ui/ | FormBuilder, TranslocoService only |
| Form | ui/ | FormBuilder, TranslocoService only |

### 5-File Pattern in domain/

- [ ] `{feature}.api-model.ts` (Backend API types - OpenAPI schema)
- [ ] `{feature}.model.ts` (Frontend UI view models, constants)
- [ ] `{feature}.api.ts` (HTTP calls)
- [ ] `{feature}.store.ts` (SignalStore)
- [ ] `{feature}.helper.ts` (optional, pure functions)

```
libs/{scope}/{feature}/domain/src/lib/
├── {feature}.api-model.ts  # Types from backend API
├── {feature}.model.ts      # UI view models, constants
├── {feature}.api.ts        # HTTP calls
├── {feature}.store.ts      # SignalStore
├── {feature}.helper.ts     # Pure functions (optional)
└── index.ts                # Public exports
```

⚠️ **No Re-export**: Import types directly from source. Do NOT re-export `api-model` types in `model.ts`.

### API Types Location

- [ ] API types in `libs/{scope}/shared/domain/src/lib/api/*.api-model.ts`
- [ ] Import API types from `@one-ui/{scope}/shared/domain`

```typescript
// ✅ Correct: Import from separate files
import type { User, UserCreate } from './{feature}.api-model';  // Backend types
import type { UserTableItem } from './{feature}.model';          // UI types
```

### UI Components Rules

- [ ] Use `input()` to receive data
- [ ] Use `output()` to emit events
- [ ] NO store injection
- [ ] NO HTTP calls
- [ ] NO business logic

```typescript
// ❌ Wrong: UI component injecting store
@Component({ selector: 'one-ui-user-table' })
export class UserTableComponent {
  readonly #store = inject(UserStore);  // ❌ NOT allowed
}

// ✅ Correct: UI component with input/output only
@Component({ selector: 'one-ui-user-table' })
export class UserTableComponent {
  users = input.required<User[]>();
  deleteUser = output<string>();
}
```

### Feature Components Rules

- [ ] Inject stores
- [ ] Pass data to UI via `[property]`
- [ ] Handle UI events via `(event)`
- [ ] Manage dialog lifecycle

### Domain Layer

- [ ] Export public API via `index.ts`

---

## Form Validation (9 items)

📖 詳細: [one-validators.md](../tools/one-validators.md) | [form-builder.md](../tools/form-builder.md)

### Import

- [ ] Import `{ OneValidators }` (not `{ Validators }`)
- [ ] Use `NonNullableFormBuilder` (not `FormBuilder`)

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `import { Validators } from '@angular/forms'` | `import { OneValidators } from '@one-ui/shared/domain'` |
| `inject(FormBuilder)` | `inject(NonNullableFormBuilder)` |

### Validators

- [ ] `Validators.required` → `OneValidators.required`
- [ ] `Validators.minLength` → `OneValidators.minLength`
- [ ] `Validators.maxLength` → `OneValidators.maxLength`
- [ ] `Validators.pattern` → `OneValidators.pattern`

```typescript
// ✅ Correct usage
form = this.#fb.group({
  name: ['', [OneValidators.required, OneValidators.maxLength(32)]],
  port: [8080, [OneValidators.required, OneValidators.range(1, 65535)]]
});
```

### Form Error Display

- [ ] Add `oneUiFormError` directive to `<mat-error>`
- [ ] Add `oneUiFormHint` directive to `<mat-hint>` for range fields
- [ ] Remove manual error message handling

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `<mat-error *ngIf="...">Required</mat-error>` | `<mat-error oneUiFormError="fieldName"></mat-error>` |
| Manual hint text | `<mat-hint oneUiFormHint="port"></mat-hint>` |

---

## UI Components (12 items)

📖 詳細: [mx-components.md](../tools/mx-components.md) | [dialog.md](../tools/dialog.md)

### Buttons

- [ ] All `mat-raised-button` → `mat-flat-button`
- [ ] All components use `OnPush`

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `mat-raised-button` | `mat-flat-button` |
| Default change detection | `changeDetection: ChangeDetectionStrategy.OnPush` |

🔍 檢查: `rg -n 'mat-raised-button' --type html {path}`

### Icons (CRITICAL)

- [ ] All icons use `svgIcon` attribute (NOT text content)

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `<mat-icon>refresh</mat-icon>` | `<mat-icon svgIcon="icon:refresh"></mat-icon>` |
| `<mat-icon>edit</mat-icon>` | `<mat-icon svgIcon="icon:edit"></mat-icon>` |
| `<mat-icon>delete</mat-icon>` | `<mat-icon svgIcon="icon:delete"></mat-icon>` |

🔍 檢查: `rg -n '<mat-icon>[a-z_]+</mat-icon>' --type html {path}`

### MX Components

- [ ] Use `MxStatusComponent` for status columns (not plain text)
- [ ] Use `mxLabelTooltip` for hints (not mat-icon with matTooltip)
- [ ] Use `mxLabelOptional` for optional fields
- [ ] Use `mx-file-uploader` for file inputs

```html
<!-- ❌ Wrong: Plain text status -->
<td>{{ row.enabled ? 'Enabled' : 'Disabled' }}</td>

<!-- ✅ Correct: MxStatus component -->
@if (row.enabled) {
  <mx-status statusType="success" statusIcon="icon:task_alt" [statusText]="t('general.common.enable')" />
} @else {
  <mx-status statusType="neutral" statusIcon="icon:hide_source" [statusText]="t('general.common.disable')" />
}
```

```html
<!-- ❌ Wrong: mat-icon with tooltip -->
<mat-icon matSuffix [matTooltip]="hint">info</mat-icon>

<!-- ✅ Correct: mxLabelTooltip -->
<mat-label mxLabel [mxLabelTooltip]="t('hint')">{{ t('label') }}</mat-label>
```

### Dialog

- [ ] Dialog uses `viewContainerRef` when injecting store

```typescript
// ❌ Wrong: Missing viewContainerRef
this.#dialog.open(FeatureDialogComponent, {
  ...mediumDialogConfig,
  data: { mode: 'create' }
});

// ✅ Correct: Include viewContainerRef
this.#dialog.open(FeatureDialogComponent, {
  ...mediumDialogConfig,
  viewContainerRef: this.#viewContainerRef,  // Required!
  data: { mode: 'create' }
});
```

### Table

- [ ] Table toolbar order: Refresh → Create → Delete
- [ ] Use `oneUiTableMaxSize` directive for table footer

```html
<!-- ✅ Correct toolbar order -->
<ng-template #rightToolbarTemplate>
  <!-- 1. Refresh (always visible) -->
  <button mat-button (click)="refresh.emit()">
    <mat-icon svgIcon="icon:refresh"></mat-icon>
  </button>
  <!-- 2. Create (when nothing selected) -->
  @if (selection.length === 0) {
    <button mat-stroked-button (click)="add.emit()">{{ t('general.button.create') }}</button>
  }
  <!-- 3. Delete (when items selected) -->
  @if (selection.length >= 1) {
    <button mat-stroked-button (click)="onDelete()">{{ t('general.button.delete') }}</button>
  }
</ng-template>
```

---

## Translation Keys (9 items)

📖 詳細: [transloco.md](../tools/transloco.md)

### Critical Rules

- [ ] DO NOT create new translation keys
- [ ] DO NOT modify existing translation keys
- [ ] Read source HTML to find exact keys
- [ ] Copy keys exactly as they appear
- [ ] Verify keys exist in `assets/i18n/en.json`

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `t('features.user.my_custom_label')` | `t('features.user.page_title')` (from Legacy) |
| Creating new key structure | Copy exact key from source HTML |

### Key Patterns

- [ ] Use `general.*` for common terms
- [ ] Use `features.{feature}.*` for feature-specific
- [ ] Translation keys match source EXACTLY
- [ ] All tooltip/hint keys from source

| Pattern | Example |
|---------|---------|
| `general.common.*` | `general.common.name`, `general.common.status` |
| `general.button.*` | `general.button.create`, `general.button.delete` |
| `general.tooltip.*` | `general.tooltip.refresh` |
| `features.{feature}.*` | `features.user.page_title` |

---

## Form Layout (5 items)

### Critical Rules

- [ ] DO NOT change form field row groupings
- [ ] Analyze source for `fxLayout="row"` patterns
- [ ] Use `.form-row` class to maintain layout
- [ ] Field order matches source exactly
- [ ] Single vs multi-field rows match source

```html
<!-- Source (Legacy) has two fields on same row -->
<div fxLayout="row">
  <mat-form-field>organization_name</mat-form-field>
  <mat-form-field>organizational_unit</mat-form-field>
</div>

<!-- ❌ Wrong: Separated into different rows -->
<mat-form-field>organization_name</mat-form-field>
<mat-form-field>organizational_unit</mat-form-field>

<!-- ✅ Correct: Keep same row grouping -->
<div class="form-row">
  <mat-form-field>organization_name</mat-form-field>
  <mat-form-field>organizational_unit</mat-form-field>
</div>
```

---

## Page Layout (4 items)

📖 詳細: [page-layout.md](../tools/page-layout.md)

- [ ] Use `gl-page-content` wrapper class
- [ ] Use `content-wrapper` (not mat-card)
- [ ] Page component has NO padding (`:host { display: block; }`)
- [ ] Layout padding handled by shell/app layout

```html
<!-- ✅ Correct page structure -->
<div *transloco="let t" class="gl-page-content">
  <one-ui-breadcrumb />
  <mx-page-title [title]="t('features.xxx.page_title')" />
  <div class="content-wrapper">
    <!-- Page content -->
  </div>
</div>
```

```scss
// ❌ Wrong: Page component with padding
:host {
  display: block;
  padding: 24px;  // ❌ NO!
}

// ✅ Correct: Only display: block
:host {
  display: block;
}
```

---

## Tab Group (5 items)

📖 詳細: [mx-components.md](../tools/mx-components.md)

- [ ] Import `MxTabGroupDirective` from `@moxa/formoxa/mx-tabs`
- [ ] Add `MxTabGroupDirective` to imports array
- [ ] `mat-tab-group` has `mxTabGroup` directive
- [ ] `mat-tab-group` has `animationDuration="0ms"`
- [ ] `mat-tab-group` has `[mat-stretch-tabs]="false"`

```typescript
import { MxTabGroupDirective } from '@moxa/formoxa/mx-tabs';

@Component({
  imports: [MatTabsModule, MxTabGroupDirective, ...]
})
```

```html
<!-- ✅ Correct tab group -->
<mat-tab-group mxTabGroup animationDuration="0ms" [mat-stretch-tabs]="false">
  <mat-tab [label]="t('tab.general')">...</mat-tab>
</mat-tab-group>
```

---

## Storage & Auth (3 items)

📖 詳細: [auth.md](../tools/auth.md)

- [ ] Token uses `sessionStorage` (not `localStorage`)
- [ ] Token key is `'mx_token'`
- [ ] Use `parseJwt` from `@one-ui/mx-ros/shared/domain`

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `localStorage.getItem('token')` | `sessionStorage.getItem('mx_token')` |
| `localStorage.setItem(...)` | `sessionStorage.setItem('mx_token', value)` |

🔍 檢查: `rg -n 'localStorage' --type ts {path}`

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

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `: any` | Proper type definition |
| `if (status === 1)` | `if (status === STATUS.ACTIVE)` |
| `enum Status { }` | `type Status = 'active' \| 'inactive'` |
| `private store` | `readonly #store` |

🔍 檢查: `rg -n ': any' --type ts --glob '!*.spec.ts' {path}`

---

## Table Component (11 items)

📖 詳細: [common-table.md](../tools/common-table.md) | [create-table.md](../guides/create-table.md)

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

```typescript
// ✅ Correct column definition
readonly columns = computed(() => [
  { key: SELECT_COLUMN_KEY, disable: (row) => row.isCurrentUser },
  { key: 'name', header: this.#transloco.translate('general.common.name') },
  {
    key: 'status',
    header: this.#transloco.translate('general.common.status'),
    noAutoGenerate: true,  // Custom template
    filter: (data, filter) => {  // Required for search
      const status = data.enabled ? 'Enabled' : 'Disabled';
      return status.toLowerCase().includes(filter.toLowerCase());
    }
  },
  { key: EDIT_COLUMN_KEY, stickyEnd: true }
]);
```

---

## Final Steps

1. Run `one-ui-migration-checker` agent: `check migration for {path}`
2. Run linting: `nx lint {scope}-{feature}-domain`
3. Run tests: `nx test {scope}-{feature}-domain --coverage`
4. Type check: `npx tsc --noEmit`
5. Visual comparison with Legacy app
