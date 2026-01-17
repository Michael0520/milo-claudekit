# TDD Examples and Patterns

## TDD Workflow

1. **Red**: Write failing test for important behavior first
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve design while keeping tests green

## Test by Business Risk

### Priority 1: Domain Layer (Critical Business Rules)

```typescript
describe('AuthDomain', () => {
  it('should enforce business rule: only active users can login', () => {
    const user = new User({ status: 'inactive' });
    expect(() => user.authenticate()).toThrow('User not active');
  });
});
```

### Priority 2: Application Layer (User Workflows)

```typescript
describe('LoginUseCase', () => {
  it('should complete authentication workflow successfully', () => {
    const result = loginUseCase.execute(validCredentials);
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/dashboard');
  });
});
```

### Priority 3: Infrastructure Layer (Integration Contracts)

```typescript
describe('AuthRepository', () => {
  it('should maintain data integrity during user operations', () => {
    const user = repository.save(userData);
    expect(user.id).toBeDefined();
    expect(user.hashedPassword).not.toBe(userData.password);
  });
});
```

## Migration-Safe Testing

```typescript
describe('Legacy Compatibility', () => {
  it('should maintain exact same behavior as legacy system', () => {
    const legacyResult = legacySystem.processLogin(credentials);
    const newResult = newSystem.processLogin(credentials);
    expect(newResult).toDeepEqual(legacyResult);
  });
});
```

## Layer Testing Focus

| Layer | Focus | Skip |
|-------|-------|------|
| Domain | Business invariants, domain events | Getters/setters |
| Application | Use case flows, coordination | Parameter validation details |
| Infrastructure | Integration contracts, data mapping | Framework internals |
| Presentation | User interactions, state changes | UI styling |

## Coverage Philosophy

- Focus on **behavior coverage**, not code coverage
- Test what matters to users and business
- Avoid testing implementation details
- Never modify passing tests to make new code pass
