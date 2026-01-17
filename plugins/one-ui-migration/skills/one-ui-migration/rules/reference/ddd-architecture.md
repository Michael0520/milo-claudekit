# DDD Architecture

## Layer Decision Flow

```
QUESTION: Does component have HTTP calls or business logic?
  YES → domain/
  NO  ↓

QUESTION: Does component inject Store or manage dialogs?
  YES → features/
  NO  ↓

QUESTION: Does component ONLY have input()/output()?
  YES → ui/
  NO  ↓

QUESTION: Does component define routes/guards/resolvers?
  YES → shell/
```

## Layer Constraints

| Layer | CAN | CANNOT |
|-------|-----|--------|
| **domain/** | inject HttpClient/RestService, define stores | import from features or ui |
| **features/** | inject stores, open dialogs | make HTTP calls directly |
| **ui/** | use input()/output(), inject FormBuilder | inject stores, make HTTP calls |
| **shell/** | define routes, resolvers | contain business logic |

## 4-File Pattern (Domain Layer)

```
libs/{scope}/{feature}/domain/src/lib/
├── {feature}.model.ts      # UI view models, constants (frontend-defined)
├── {feature}.api.ts        # HTTP calls (MxRestService)
├── {feature}.store.ts      # SignalStore
├── {feature}.helper.ts     # Pure utility functions (optional)
└── index.ts                # Public exports
```

### model.ts (UI Models)

```typescript
/**
 * {Feature} UI Models
 */

// Constants
export const FEATURE_DEFAULTS = {
  TABLE_MAX_SIZE: 10,
  PASSWORD_MIN_LENGTH: 4
} as const;

// Type union (preferred over enum)
export type UserRole = 'admin' | 'user' | 'supervisor';

/** Flattened for table display */
export interface UserTableItem {
  key: number;
  username: string;
  roleName: string;  // flattened from role.name
}

/** Form data */
export interface UserFormData {
  username: string;
  password: string;
}
```

### api.ts (HTTP calls)

```typescript
import type { User, UserCreate } from '@one-ui/mxsecurity/shared/domain';

@Injectable({ providedIn: 'root' })
export class FeatureApiService {
  readonly #api = inject(MxRestService);

  getUsers$(): Observable<User[]> {
    return this.#api.get$<User[]>('/api/users');
  }
}
```

## Shared API Types (Centralized)

API types are stored in shared domain, NOT in feature domain:

```
libs/mxsecurity/shared/domain/src/lib/api/
├── config.api-model.ts
├── dashboard.api-model.ts
├── device.api-model.ts
├── user.api-model.ts
├── ... (organized by backend domain)
└── index.ts
```

### Import Pattern

```typescript
// Import API types from shared domain
import type { User, UserCreate } from '@one-ui/mxsecurity/shared/domain';

// Import UI models from feature domain
import type { UserTableItem } from './{feature}.model';
```

## Full Directory Structure

```
libs/{scope}/{feature}/
├── domain/
│   ├── {feature}.model.ts      # UI view models, constants
│   ├── {feature}.api.ts        # HTTP calls
│   ├── {feature}.store.ts      # SignalStore
│   ├── {feature}.helper.ts     # optional
│   └── index.ts
├── features/
│   ├── {feature}-page.component.ts
│   └── {feature}-dialog/
├── ui/
│   ├── {feature}-table/
│   └── {feature}-form/
└── shell/
    └── {feature}.routes.ts

# Shared API types (centralized by backend domain)
libs/mxsecurity/shared/domain/src/lib/api/
├── config.api-model.ts
├── dashboard.api-model.ts
├── user.api-model.ts
└── index.ts
```

## Type vs Enum

Prefer TypeScript `type` over `enum`:

```typescript
// ❌ Avoid enum
enum Status { Active, Inactive }

// ✅ Prefer type union
type Status = 'active' | 'inactive';

// ✅ Prefer const object for values
const STATUS = {
  Active: 'active',
  Inactive: 'inactive'
} as const;
type Status = typeof STATUS[keyof typeof STATUS];
```

## Legacy Path Mapping

```
LEGACY (f2e-networking)              → NEW (one-ui)
src/app/pages/{Page}/                → libs/mxsecurity/{feature}/features/
src/app/components/                  → libs/mxsecurity/{feature}/ui/
src/app/services/{name}.service.ts   → libs/mxsecurity/{feature}/domain/
```
