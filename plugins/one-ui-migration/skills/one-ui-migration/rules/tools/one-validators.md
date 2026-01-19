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

## Enhanced Validators

For custom validators that need automatic error/hint message rendering with `oneUiFormError` and `oneUiFormHint` directives.

### validatorFnWithMessage

Wraps a simple `ValidatorFn` with error and optional hint message renderers.

```typescript
import { validatorFnWithMessage } from '@one-ui/shared/domain';

// Basic usage - error message only
const myValidator = validatorFnWithMessage(
  (control) => control.value === 'invalid' ? { invalid: true } : null,
  'validators.invalidValue'  // i18n key for error message
);

// With hint message
const maxLengthValidator = validatorFnWithMessage(
  (control) => control.value?.length > 32 ? { maxLength: true } : null,
  'validators.maxLength',           // error message i18n key
  (control) => `${control.value?.length ?? 0} / 32`  // hint renderer function
);
```

### validatorWithMessage

For validators that need parameters (factory function pattern).

```typescript
import { validatorWithMessage } from '@one-ui/shared/domain';

// Create a parameterized validator
const maxLength = validatorWithMessage(
  (max: number) => (control) =>
    control.value?.length > max ? { maxLength: true } : null,
  (max: number) => `validators.maxLength`,  // error message
  (max: number) => (control) => `${control.value?.length ?? 0} / ${max}`  // hint
);

// Usage
form = this.#fb.group({
  name: ['', [maxLength(32)]]
});
```

### Error Message Renderer

The error message can be:

1. **i18n key (string)** - Translated automatically
   ```typescript
   validatorFnWithMessage(fn, 'validators.required')
   ```

2. **Function** - For dynamic messages with interpolation
   ```typescript
   validatorFnWithMessage(
     fn,
     (control) => ({ key: 'validators.maxLength', params: { max: 32, current: control.value?.length } })
   )
   ```

### Hint Message Renderer

Optional hint message displayed in `<mat-hint oneUiFormHint>`:

```typescript
// Static hint
validatorFnWithMessage(fn, errorMsg, 'validators.hint.maxLength')

// Dynamic hint (common for character count)
validatorFnWithMessage(
  fn,
  errorMsg,
  (control) => `${control.value?.length ?? 0} / 32`
)
```

### Custom Validator Example

```typescript
// Custom validator with character count hint
const descriptionValidator = validatorFnWithMessage(
  (control: AbstractControl) => {
    const value = control.value ?? '';
    return value.length > 255 ? { maxLength: true } : null;
  },
  'validators.maxLength',
  (control: AbstractControl) => `${control.value?.length ?? 0} / 255`
);

// In form group
form = this.#fb.group({
  description: ['', [descriptionValidator]]
});
```

```html
<!-- Template automatically displays error and hint -->
<mat-form-field>
  <mat-label>{{ t('field.description') }}</mat-label>
  <textarea matInput formControlName="description"></textarea>
  <mat-hint oneUiFormHint="description"></mat-hint>  <!-- Shows "0 / 255" -->
  <mat-error oneUiFormError="description"></mat-error>
</mat-form-field>
```

### Why Use Enhanced Validators?

| Without Enhanced Validators | With Enhanced Validators |
|----------------------------|--------------------------|
| Manual `{{ form.get('x')?.value?.length }} / 32` | `<mat-hint oneUiFormHint="x">` |
| Manual `*ngIf` for each error type | `<mat-error oneUiFormError="x">` |
| Repeated error message logic | Centralized in validator |
| No i18n support in hints | Automatic i18n translation |

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
