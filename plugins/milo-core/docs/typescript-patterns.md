# TypeScript Patterns

## Type Safety Requirements

### Prefer Interface for Objects

```typescript
interface UserData {
  readonly id: string;
  email: string;
  createdAt: Date;
  preferences?: UserPreferences;
}
```

### Result Type for Error Handling

```typescript
type Result<T, E = Error> =
  | { readonly success: true; data: T }
  | { readonly success: false; error: E };
```

### Async Function Pattern

```typescript
const fetchUser = async (id: string): Promise<UserData | null> => {
  using resource = new DatabaseConnection();
  return await resource.query('users', { id });
};
```

## Forbidden Patterns

- `any` type - use `unknown` or proper types
- Type assertions without validation
- Non-null assertions (`!`) without checks

## Config-Driven Development

```typescript
// Business rules in config
const VALIDATION_RULES = {
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { minLength: 8, requireSpecialChar: true }
} as const;

// Feature flags
const FEATURES = {
  enableNewDashboard: process.env.NODE_ENV === 'development',
  maxFileUploadSize: 10 * 1024 * 1024 // 10MB
} as const;
```

## File Naming Conventions

- Components: `PascalCase.tsx` (UserProfile.tsx)
- Hooks: `camelCase.ts` (useUserData.ts)
- Utilities: `camelCase.ts` (formatCurrency.ts)
- Types: `PascalCase.types.ts` (User.types.ts)
