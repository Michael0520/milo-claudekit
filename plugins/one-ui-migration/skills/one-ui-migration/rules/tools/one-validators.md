# OneValidators

## What is this?

One-UI's form validation utility, replacing Angular's native `Validators`.

## When to use

When forms need validation (required, length, range, pattern, etc.).

## Quick Reference

| Need | How to Use |
|------|------------|
| Basic validation | `OneValidators.required` / `.maxLength(n)` / `.range(min, max)` |
| Custom error message | `OneValidators.maxLength(8).error('i18n.key')` |
| Custom validator + message | `validatorFnWithMessage(fn, errorMsg, hintMsg?)` |
| Display error message | `<mat-error oneUiFormError="field">` → see [mx-components.md](./mx-components.md#form-validation-directives) |
| Display hint | `<mat-hint oneUiFormHint="field">` → see [mx-components.md](./mx-components.md#form-validation-directives) |

## Validation Flow

**Step 1: Define Validators (TypeScript)**
- Option A: `OneValidators.required`, `OneValidators.maxLength(n)` — built-in validators
- Option B: `validatorFnWithMessage(fn, errorMsg, hintMsg?)` — custom validator with message

**Step 2: Display in Template (HTML)**
- `<mat-error oneUiFormError="fieldName">` — auto-displays error message
- `<mat-hint oneUiFormHint="fieldName">` — auto-displays hint (character count / range)

---

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

> 📖 For template usage, see [mx-components.md - Form Validation Directives](./mx-components.md#form-validation-directives)

### validatorFnWithMessage

Wraps a simple `ValidatorFn` with error and optional hint message renderers.

```typescript
import { validatorFnWithMessage } from '@one-ui/shared/domain';

// Basic usage - error message only
const myValidator = validatorFnWithMessage(
  (control) => control.value === 'invalid' ? { invalid: true } : null,
  'validators.invalidValue'  // i18n key for error message
);

// With hint message (common for character count)
const maxLengthValidator = validatorFnWithMessage(
  (control) => control.value?.length > 32 ? { maxLength: true } : null,
  'validators.maxLength',
  (control) => `${control.value?.length ?? 0} / 32`
);
```

### validatorWithMessage

For validators that need parameters (factory function pattern).

```typescript
import { validatorWithMessage } from '@one-ui/shared/domain';

const maxLength = validatorWithMessage(
  (max: number) => (control) =>
    control.value?.length > max ? { maxLength: true } : null,
  (max: number) => `validators.maxLength`,
  (max: number) => (control) => `${control.value?.length ?? 0} / ${max}`
);
```

### Error/Hint Message Types

| Type | Example |
|------|---------|
| i18n key | `'validators.required'` |
| Dynamic function | `(control) => ({ key: 'validators.maxLength', params: { max: 32 } })` |
| String function (hint) | `(control) => \`${control.value?.length ?? 0} / 32\`` |

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

## Complete Example

```typescript
// ===== Component =====
import { OneValidators, validatorFnWithMessage } from '@one-ui/shared/domain';

// Custom validator with character count hint
const descriptionValidator = validatorFnWithMessage(
  (c) => (c.value?.length ?? 0) > 255 ? { maxLength: true } : null,
  'validators.maxLength',
  (c) => `${c.value?.length ?? 0} / 255`
);

form = this.#fb.group({
  name: ['', [OneValidators.required, OneValidators.maxLength(32)]],
  port: [514, [OneValidators.required, OneValidators.range(1, 65535)]],
  description: ['', [descriptionValidator]]
});
```

```html
<!-- ===== Template ===== -->
<form [formGroup]="form">
  <!-- Name field -->
  <mat-form-field>
    <mat-label>{{ t('field.name') }}</mat-label>
    <input matInput formControlName="name" />
    <mat-error oneUiFormError="name"></mat-error>
  </mat-form-field>

  <!-- Port field with number-only input -->
  <mat-form-field>
    <mat-label>{{ t('field.port') }}</mat-label>
    <input matInput type="text" oneUiNumberOnly formControlName="port" />
    <mat-hint oneUiFormHint="port"></mat-hint>  <!-- Shows "1 ~ 65535" -->
    <mat-error oneUiFormError="port"></mat-error>
  </mat-form-field>

  <!-- Description with character count -->
  <mat-form-field>
    <mat-label>{{ t('field.description') }}</mat-label>
    <textarea matInput formControlName="description"></textarea>
    <mat-hint oneUiFormHint="description"></mat-hint>  <!-- Shows "0 / 255" -->
    <mat-error oneUiFormError="description"></mat-error>
  </mat-form-field>
</form>
```

---

## Related Tools

- [form-builder.md](./form-builder.md) - NonNullableFormBuilder
- [mx-components.md](./mx-components.md#form-validation-directives) - oneUiFormError / oneUiFormHint directives
