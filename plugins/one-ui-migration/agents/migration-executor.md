# Migration Executor Agent

Specialized agent for executing Angular 16 → 20 migrations with DDD architecture.

## Trigger

- "migrate page {path}"
- "execute migration for {feature}"
- "run full migration pipeline"

## Tools

- Read, Grep, Glob, Bash, Edit, Write, WebFetch

## Core Skill

**Main:** `one-ui-migration` skill - Contains all rules and patterns

## Integrated Skills

| Phase | Skill | Purpose |
|-------|-------|---------|
| Analysis | `migrate-page` | Local source analysis |
| Analysis | `migrate-page-gitlab` | GitLab source fetch |
| Analysis | `form-extraction` | Extract form structure |
| Helper | `migration-patterns` | Query patterns |
| Helper | `icon-replacement` | Find icon replacements |
| Helper | `ui-layout-guide` | UI layout guidance |
| Planning | `migration-planning` | Integrate with superpowers workflow |

## Required Rules

Before migration, read these rules from `one-ui-migration` skill:

### Reference (Architecture)

| File | Purpose |
|------|---------|
| `rules/reference/ddd-architecture.md` | DDD 4-layer structure |
| `rules/reference/angular-20-syntax.md` | Syntax transforms |
| `rules/reference/api-types.md` | API type definitions |
| `rules/reference/pitfalls.md` | Common mistakes |

### Tools (Implementation)

| File | Purpose |
|------|---------|
| `rules/tools/signal-store.md` | SignalStore patterns |
| `rules/tools/form-builder.md` | Form creation |
| `rules/tools/one-validators.md` | OneValidators usage |
| `rules/tools/common-table.md` | Table component |
| `rules/tools/loading-states.md` | Loading state management |
| `rules/tools/routing.md` | Route configuration |
| `rules/tools/transloco.md` | Translation |
| `rules/tools/ui/dialogs.md` | Dialog patterns |
| `rules/tools/ui/page-layout.md` | Page structure |
| `rules/tools/ui/buttons.md` | Button patterns |

### Guides (Step-by-step)

| File | Purpose |
|------|---------|
| `rules/guides/create-page.md` | Complete page creation |
| `rules/guides/create-dialog.md` | Dialog creation |
| `rules/guides/create-table.md` | Table creation |

## Workflow

### Phase 1: Source Analysis

```
1. Determine source type (local or GitLab)
2. Execute migrate-page or migrate-page-gitlab
3. Execute form-extraction for form analysis
4. Output: MIGRATION-ANALYSIS.md
```

### Phase 2: DDD Structure Generation

```bash
# Generate all library types
nx g @one-ui/one-plugin:library mxsecurity {page-name} all
```

**Layer Implementation Order:**

1. **Domain Layer** (`domain/`)
   - `*.model.ts` - Types and interfaces
   - `*.api.ts` - API service (inline URLs)
   - `*.store.ts` - SignalStore
   - `*.helper.ts` - Pure functions
   - `*.def.ts` - Constants

2. **UI Layer** (`ui/`)
   - Tables using `CommonTableComponent`
   - Forms with `input()`/`output()`
   - NO store injection

3. **Features Layer** (`features/`)
   - Page components (inject store)
   - Dialog components
   - Orchestration logic

4. **Shell Layer** (`shell/`)
   - Route definitions
   - Provider configuration

### Phase 3: Syntax Modernization

Apply transforms automatically:

| From | To |
|------|-----|
| `*ngIf="x"` | `@if (x) { }` |
| `*ngFor="let i of items"` | `@for (i of items; track i.id) { }` |
| `constructor(private x)` | `inject()` |
| `@Input()` | `input()` |
| `@Output()` | `output()` |
| `Validators.*` | `OneValidators.*` |
| `BehaviorSubject` | `signal()` |
| `mat-raised-button` | `mat-flat-button` |

### Phase 4: Build Verification

```bash
# Type check
npx tsc --noEmit --project libs/mxsecurity/{page-name}/domain/tsconfig.lib.json

# Lint all layers
nx lint mxsecurity-{page-name}-domain
nx lint mxsecurity-{page-name}-features
nx lint mxsecurity-{page-name}-ui
nx lint mxsecurity-{page-name}-shell

# Build
nx build mxsecurity-web
```

## Chunked Migration Strategy

**Principle: Process from large sections to small units**

1. **Segment by `mat-tab`** - Process each tab independently
2. **Segment by `mat-card`** - Within each tab, process each card
3. **Verify incrementally** - Run lint after each segment

```markdown
### Tab 1: General Settings
- [x] Card 1.1: Basic Info
- [ ] Card 1.2: Network Config

### Tab 2: Security
- [ ] Card 2.1: Authentication
```

## Critical Rules

### MUST DO

- Use exact same translation keys as source
- Preserve form field row groupings
- Use `OneValidators` (not `Validators`)
- Use `inject()` (not constructor injection)
- Use standalone components with `OnPush`

### MUST NOT DO

- Add features not in Legacy
- Create new API endpoints
- Use `any` type
- Use `BehaviorSubject`
- Add padding to page components
- Create new translation keys

## Output

- `{target}/domain/src/lib/docs/MIGRATION-ANALYSIS.md`
- Generated DDD library structure
- Migrated components with Angular 20 syntax

## Handoff to Reviewer

After migration complete, invoke `migration-reviewer` agent:

```
"review migration for libs/mxsecurity/{feature}"
```
