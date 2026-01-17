---
paths: **/*.ts, **/*.tsx
---
# TypeScript Rules

## Type Safety

### Required
- Explicit return types on public functions
- Strict null checks enabled
- Use `unknown` over `any` when type is unclear

### Forbidden
- `any` type (use `unknown` or generics)
- Type assertions (`as Type`) without validation
- Non-null assertions (`!`) without checks
- `@ts-ignore` without explanation

## Patterns

### Prefer
```typescript
// Discriminated unions
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

// Const assertions
const config = { mode: 'dark' } as const;

// Satisfies operator
const user = { name: 'Ming' } satisfies User;
```

### Avoid
```typescript
// Implicit any
function process(data) { }  // ❌

// Type assertion without check
const user = data as User;  // ❌

// Better: type guard
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'name' in data;
}
```

## Naming

| Type | Convention | Example |
|------|------------|---------|
| Interface | PascalCase | `UserProfile` |
| Type | PascalCase | `UserId` |
| Enum | PascalCase | `UserRole` |
| Constant | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Function | camelCase | `getUserById` |
