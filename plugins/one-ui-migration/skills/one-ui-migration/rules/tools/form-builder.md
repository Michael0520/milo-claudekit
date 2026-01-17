# NonNullableFormBuilder

## What is this?

Angular's FormBuilder, but all values are non-nullable by default, avoiding `null` type issues.

## When to use

When creating Reactive Forms.

## Import

```typescript
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
```

---

## Basic Usage

```typescript
@Component({...})
export class FeatureDialogComponent {
  readonly #fb = inject(NonNullableFormBuilder);

  form = this.#fb.group({
    name: ['', [OneValidators.required, OneValidators.maxLength(32)]],
    description: ['', [OneValidators.maxLength(255)]],
    port: [8080, [OneValidators.required, OneValidators.range(1, 65535)]]
  });
}
```

---

## FormGroup-Level Validation

For cross-field validation (e.g., password confirmation):

```typescript
form = this.#fb.group(
  {
    password: ['', [OneValidators.required]],
    confirmPassword: ['', [OneValidators.required]]
  },
  { validators: [Validators.passwordMatch()] }  // FormGroup validator
);
```

---

## Getting Form Values

```typescript
// Get all values (including disabled fields)
const value = this.form.getRawValue();

// Get values (excluding disabled fields)
const value = this.form.value;
```

---

## Common Mistakes

```typescript
// ❌ WRONG: Using FormBuilder (values can be null)
readonly #fb = inject(FormBuilder);

// ✅ CORRECT: Using NonNullableFormBuilder
readonly #fb = inject(NonNullableFormBuilder);
```

---

## Related Tools

- [one-validators.md](./one-validators.md) - Form validation
- [mx-components.md](./mx-components.md) - oneUiFormError, mxLabel
