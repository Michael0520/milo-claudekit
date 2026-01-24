---
name: migrate-mx-ros-page
description: Migrate MX-ROS page from local source following DDD architecture.
---

# MX-ROS Page Migration Command

Migrate a page from old MX-ROS project (Angular 16) to new one-ui monorepo (Angular 20) following DDD architecture.

## Arguments

- `$ARGUMENTS` - Format: `--from <source_path> --to <target_path>`
  - `--from`: Source path in old project (e.g., `/Users/jayden/f2e-networking-jayden/apps/mx-ros-web/src/app/pages/account`)
  - `--to`: Target path in new project (e.g., `libs/mx-ros/account-page`)

> **Note: No page ID required**
>
> Only provide `--from` and `--to` path arguments, no additional page ID needed.

## Workflow

### Phase 1: Source Analysis

Analyze the source path and create a migration analysis document in `{target}/domain/src/lib/docs/MIGRATION-ANALYSIS.md`:

1. **File Structure Analysis**
   - List all files in the source directory
   - Categorize by type: components, services, models, templates, styles

2. **Component Analysis**
   - Identify all components and their relationships
   - Note parent/child relationships
   - Identify dialog components
   - Identify table/form components

3. **Form Validation Analysis**
   - List all form controls and their validators
   - Identify `Validators.*` usage that needs `OneValidators.*` replacement
   - Document custom validators

4. **API Calls Analysis**
   - List all HTTP calls (endpoints, methods, request/response types)
   - Identify API services being used
   - Document data flow

5. **Dependencies Analysis**
   - Third-party libraries used
   - Angular Material components used
   - Shared services/utils used

6. **UI Interactions (for E2E testing)**
   - Button clicks and their actions
   - Form submissions
   - Dialog open/close triggers
   - Table operations (select, edit, delete, add)
   - Navigation actions

7. **Translation Keys Analysis (CRITICAL)**
   - **DO NOT create new translation keys**
   - **DO NOT modify existing translation keys**
   - List all translation keys used in source HTML templates
   - Copy exact keys for use in migrated components
   - Document all translation keys by category:
     - Page titles
     - Tab labels
     - Dialog titles and descriptions
     - Form field labels
     - Button labels
     - Tooltip texts
     - Table column headers
     - Error messages and hints

8. **Form Layout Analysis (CRITICAL)**
   - **DO NOT change form field row groupings**
   - Analyze `fxLayout="row"` patterns in source templates
   - Document which fields appear on same row
   - Use `.form-row` class in migrated components to preserve layout

### Phase 2: DDD Structure Migration

Reference documents (see `.claude/skills/mx-ros-migration/SKILL.md` for core principles):

- `references/ddd-architecture.md` - DDD layers, helper files
- `references/forms/validators.md` - OneValidators usage, pattern constants
- `references/forms/error-handling.md` - Template errors, custom errors, long error messages
- `references/ui/page-layout.md` - Page layout, breadcrumb
- `references/ui/forms.md` - Form layout, validation, error messages
- `references/ui/buttons.md` - Button types, loading states
- `references/ui/components.md` - File upload, form component pattern
- `references/ui/dialogs.md` - Dialog config, loading state, viewContainerRef
- `references/tables/basics.md` - CommonTableComponent, migration pattern
- `references/tables/columns.md` - Column API, custom templates
- `references/tables/advanced.md` - Paginator config, footer styling
- `references/api-types.md` - API types, def files

Generate libraries using the Nx plugin:

```bash
# Generate all library types at once
nx g @one-ui/one-plugin:library mx-ros {page-name} all

# Or generate individually if needed
nx g @one-ui/one-plugin:library mx-ros {page-name} domain
nx g @one-ui/one-plugin:library mx-ros {page-name} features
nx g @one-ui/one-plugin:library mx-ros {page-name} ui
nx g @one-ui/one-plugin:library mx-ros {page-name} shell
```

### 分塊遷移技巧 (降低遺漏風險)

**原則：由大到小，逐塊完成**

1. **以 `mat-tab` 為區塊** - 先識別頁面有幾個 tab，每個 tab 獨立處理
2. **以 `mat-card` / section 切塊** - 在每個 tab 內，識別所有 card/section
3. **逐一遷移並驗證** - 完成一個區塊後立即執行 `/mx-ros-lint` 檢查

**範例 Checklist：**
```markdown
### Tab 1: General Settings
- [x] Card 1.1: Basic Info
- [ ] Card 1.2: Network Config

### Tab 2: Security
- [ ] Card 2.1: Authentication
```

### Phase 3: Layer-by-Layer Migration

1. **Domain Layer** (`domain/`) - see `.claude/skills/mx-ros-migration/references/ddd-architecture.md`
   - API response types → use existing types from `@one-ui/mx-ros/shared/domain` (e.g., `SRV_USER_ACCOUNT`)
   - If API type missing → create in `libs/mx-ros/shared/domain/src/lib/models/api/`
   - Page-specific models (view models, form models) → `*.model.ts`
   - Migrate API service → `*.api.ts`
   - Create SignalStore → `*.store.ts`
   - Migrate constants → `*.def.ts`
   - Extract pure functions → `*.helper.ts` (data transformations, serialization)
   - Keep `MIGRATION-ANALYSIS.md` in `domain/src/lib/docs/` folder

2. **UI Layer** (`ui/`) - see `.claude/skills/mx-ros-migration/references/tables/basics.md`
   - Migrate tables → use `CommonTableComponent` pattern
   - Migrate forms → use `input()`, `output()` pattern
   - Table toolbar → use `mat-stroked-button` with `general.button.create`/`delete`
   - Keep components dumb (no store injection, no HTTP)

3. **Features Layer** (`features/`) - see `.claude/skills/mx-ros-migration/references/ui/forms.md`, `buttons.md` and `dialogs.md`
   - Migrate page component → smart component pattern
   - Migrate dialogs → use `smallDialogConfig`, `mediumDialogConfig`, `largeDialogConfig`
   - Form tooltips → use `mxLabelTooltip` instead of `mat-icon` with `matTooltip`
   - Inject store, pass data to UI via inputs

4. **Shell Layer** (`shell/`)
   - Create routes with resolver pattern
   - Provide store and services

5. **App Routes Registration** (see `.claude/skills/mx-ros-migration/references/ui/page-layout.md`)
   - Add route to `apps/mx-ros/mx-ros/src/app/app.routes.ts`
   - Register in `appRoutes` children array with breadcrumb resolver:

   ```typescript
   import { createBreadcrumbResolver, ROUTES_ALIASES } from '@one-ui/mx-ros/shared/domain';

   {
     path: ROUTES_ALIASES['{pageAlias}'].route,
     loadChildren: () =>
       import('@one-ui/mx-ros/{page-name}/shell').then((m) => m.createRoutes()),
     resolve: {
       breadcrumb: createBreadcrumbResolver(ROUTES_ALIASES['{pageAlias}'].id)
     }
   }
   ```

### Phase 4: Syntax Modernization

Apply Angular 20 syntax updates (see `.claude/skills/mx-ros-migration/references/angular-syntax.md`):

- `*ngIf` → `@if`
- `*ngFor` → `@for (item of items; track item.id)`
- `constructor(private service: Service)` → `inject()`
- `@Input()` → `input()`
- `@Output()` → `output()`
- `BehaviorSubject` → `signal()`

**Form Validation** (see `.claude/skills/mx-ros-migration/references/forms/validators.md`):

- `Validators.required` → `OneValidators.required` (no parentheses)
- `Validators.email` → `OneValidators.email` (no parentheses)
- `Validators.minLength(n)` → `OneValidators.minLength(n)`
- Import from `@one-ui/mx-ros/shared/domain`

**UI Patterns**:

- Buttons (see `buttons.md`):
  - `mat-raised-button` → `mat-flat-button`
  - Form tooltips: Use `mxLabelTooltip` instead of `mat-icon` with `matTooltip`
  - Loading states: Use `MxLoadingButtonDirective` with `[mxButtonIsLoading]="loading()"`

- Page Layout (see `page-layout.md`):
  - `mat-card` → `<div class="content-wrapper">`

- Dialogs (see `dialogs.md`):
  - Dialog sizing: Use `smallDialogConfig`, `mediumDialogConfig`, `largeDialogConfig`
  - Dialog API calls: Call API inside dialog, close only on success via `next` callback
  - Dialog viewContainerRef: Set `viewContainerRef: this.#viewContainerRef` when dialog uses store

- Tables (see `basics.md`):
  - Table toolbar buttons: Use `mat-stroked-button` with `general.button.create`/`general.button.delete`

**Helper Files** (see `.claude/skills/mx-ros-migration/references/ddd-architecture.md`):

- Extract pure functions to `*.helper.ts` files in domain layer
- Keep store files focused on state management

**Translation Keys** (see `.claude/skills/mx-ros-migration/references/pitfalls/translation-layout.md`):

- **MUST use exact same translation keys as source**
- Read source HTML templates to find correct keys
- DO NOT create new keys or modify existing ones
- Example: `{{ 'general.common.name' | translate }}` → `{{ t('general.common.name') }}`

**Number-Only Input Directive** (see `.claude/skills/mx-ros-migration/references/pitfalls/forms-services.md`):

- **MUST replace `appNumberOnly` with `oneUiNumberOnly`**
- Search source for `appNumberOnly` usage: `grep -r "appNumberOnly" {source_path}`
- Import `NumberOnlyDirective` from `@one-ui/mx-ros/shared/domain`
- Location: `libs/mx-ros/shared/domain/src/lib/directives/number-only.directive.ts`

### Phase 5: Verification

```bash
# Type check
npx tsc --noEmit --project libs/mx-ros/{page-name}/domain/tsconfig.lib.json

# Lint
nx lint mx-ros-{page-name}-domain
nx lint mx-ros-{page-name}-features
nx lint mx-ros-{page-name}-ui
nx lint mx-ros-{page-name}-shell

# Build
nx build mx-ros-web
```

## Output Format

After completing migration analysis (Phase 1), save the analysis to:
`{target}/domain/src/lib/docs/MIGRATION-ANALYSIS.md`

The document should contain:

- File structure overview
- Component hierarchy
- Form validations to migrate
- API endpoints to migrate
- UI interaction steps (for E2E testing)
- Migration checklist with checkboxes

## Reference Examples

- MAF Account Settings: `libs/maf/act-account/`
- Switch L3 Interface: `libs/switch/l3-interface/`
- MX-ROS Login: `libs/mx-ros/login-page/`
