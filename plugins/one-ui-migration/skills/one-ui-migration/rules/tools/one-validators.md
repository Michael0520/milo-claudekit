# OneValidators

## What is this?

One-UI's form validation utility, replacing Angular's native `Validators`.

## When to use

When forms need validation (required, length, range, pattern, etc.).

## Import

```typescript
import { OneValidators } from '@one-ui/shared/domain';
```

---

## Basic Usage

```typescript
form = this.#fb.group({
  name: ['', [OneValidators.required, OneValidators.maxLength(32)]],
  description: ['', [OneValidators.maxLength(255)]],
  port: ['', [OneValidators.required, OneValidators.range(1, 65535)]]
});
```

---

## Full API

### Basic Validators

| Method | Description |
|--------|-------------|
| `OneValidators.required` | Required field |
| `OneValidators.minLength(n)` | Minimum length |
| `OneValidators.maxLength(n)` | Maximum length |
| `OneValidators.min(n)` | Minimum value |
| `OneValidators.max(n)` | Maximum value |
| `OneValidators.range(min, max)` | Numeric range |
| `OneValidators.rangeLength(min, max, fieldName)` | Length range |
| `OneValidators.email` | Email format |
| `OneValidators.pattern(regex)` | Regex pattern |

### Custom Validators

| Method | Description |
|--------|-------------|
| `OneValidators.duplicate(tableData, 'fieldName')` | Duplicate check |
| `OneValidators.matchFieldsValidator('password', 'confirmPassword')` | Field matching |

### Override Error Messages

```typescript
// Default message
OneValidators.minLength(8)

// Custom message
OneValidators.minLength(8).error('validators.notMeetPolicy')
OneValidators.pattern(PATTERN).error('validators.notMeetPolicy')
```

---

## MXSecurity-specific Validators

```typescript
import { Validators } from '@one-ui/mxsecurity/shared/ui';

// Pattern validators
Validators.name32          // a-z, A-Z, 0-9, . _ - (max 32)
Validators.name50          // a-z, A-Z, 0-9, . _ - (max 50)
Validators.ipv4            // IPv4 format
Validators.domain          // FQDN format
Validators.portPattern     // 1-65535

// Function validators
Validators.ipOrDomain      // IPv4 OR domain
Validators.port            // Port number
Validators.passwordStrength(level, minLen)
Validators.passwordMatch() // FormGroup-level

// Async validators
Validators.usernameExists(500)
Validators.emailExists(500, excludeEmail?)
```

---

## Common Mistakes

```typescript
// ❌ WRONG: Using Angular's native Validators
import { Validators } from '@angular/forms';
Validators.required
Validators.minLength(3)

// ✅ CORRECT: Using OneValidators
import { OneValidators } from '@one-ui/shared/domain';
OneValidators.required
OneValidators.minLength(3)
```

---

## Related Tools

- [form-builder.md](./form-builder.md) - NonNullableFormBuilder
- [mx-components.md](./mx-components.md) - oneUiFormError directive
