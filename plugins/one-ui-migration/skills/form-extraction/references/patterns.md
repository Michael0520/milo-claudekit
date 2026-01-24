# Form Extraction Patterns - Detailed Reference

## Form Group Definition Patterns

### Pattern 1: FormBuilder (Injected)

```typescript
// Old style - constructor injection
constructor(private fb: FormBuilder) {}

form = this.fb.group({
  username: ['', [Validators.required, Validators.maxLength(32)]],
  password: ['', [Validators.required]]
});
```

### Pattern 2: FormBuilder (Private Field with inject)

```typescript
// New style - inject function
readonly #fb = inject(NonNullableFormBuilder);

form = this.#fb.group({
  username: ['', [OneValidators.required, OneValidators.maxLength(32)]],
  password: ['', [OneValidators.required]]
});
```

### Pattern 3: NonNullableFormBuilder

```typescript
readonly #fb = inject(NonNullableFormBuilder);

// Using nonNullable explicitly
form = this.#fb.group({
  name: [''],  // Type: FormControl<string>, not FormControl<string | null>
});
```

### Pattern 4: Direct FormGroup Instantiation

```typescript
// Less common, but still used
form = new FormGroup({
  username: new FormControl('', [Validators.required]),
  password: new FormControl('')
});
```

### Pattern 5: UntypedFormGroup (Legacy)

```typescript
// Legacy untyped forms
form = new UntypedFormGroup({
  username: new UntypedFormControl('', [Validators.required])
});
```

### Pattern 6: Nested Form Groups

```typescript
form = this.#fb.group({
  basicInfo: this.#fb.group({
    name: ['', [OneValidators.required]],
    email: ['', [OneValidators.email]]
  }),
  address: this.#fb.group({
    street: [''],
    city: ['']
  })
});
```

### Pattern 7: FormArray

```typescript
form = this.#fb.group({
  users: this.#fb.array([
    this.#fb.group({
      name: ['', [OneValidators.required]]
    })
  ])
});
```

## Validator Definition Patterns

### Pattern 1: Array Syntax (Most Common)

```typescript
// [defaultValue, [syncValidators], [asyncValidators]]
username: ['', [Validators.required, Validators.maxLength(32)]]

// With async validator
email: ['', [Validators.required], [this.#emailExistsValidator()]]
```

### Pattern 2: Object Syntax

```typescript
username: this.fb.control('', {
  validators: [Validators.required],
  asyncValidators: [this.#asyncValidator()],
  updateOn: 'blur'
})
```

### Pattern 3: Group-Level Validators (Cross-Field)

```typescript
form = this.#fb.group(
  {
    password: ['', [OneValidators.required]],
    confirmPassword: ['', [OneValidators.required]]
  },
  {
    validators: [this.#passwordMatchValidator()]
  }
);

#passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const controls = (group as typeof this.form).controls;
    const password = controls.password.value;
    const confirm = controls.confirmPassword.value;
    return password === confirm ? null : { passwordMismatch: true };
  };
}
```

### Pattern 4: Conditional Validators

```typescript
// Adding validators dynamically
this.form.controls.field.addValidators([OneValidators.required]);
this.form.controls.field.removeValidators([OneValidators.required]);
this.form.controls.field.updateValueAndValidity();
```

## HTML Form Binding Patterns

### formControlName

```html
<input matInput formControlName="username" />
<mat-select formControlName="role"></mat-select>
<mat-checkbox formControlName="active"></mat-checkbox>
```

### formGroupName (Nested)

```html
<div formGroupName="basicInfo">
  <input formControlName="name" />
  <input formControlName="email" />
</div>
```

### formArrayName

```html
<div formArrayName="users">
  @for (user of form.controls.users.controls; track $index) {
    <div [formGroupName]="$index">
      <input formControlName="name" />
    </div>
  }
</div>
```

### [formGroup] Binding

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  ...
</form>
```

## Extraction Regex Patterns

### TypeScript Patterns

```bash
# FormBuilder group definitions
grep -E '(this\.fb|this\.#fb|this\.\w+fb)\.group\(' {path}/**/*.ts

# FormControl definitions
grep -E 'new (FormControl|UntypedFormControl)\(' {path}/**/*.ts

# Validators usage
grep -oE 'Validators\.\w+(\([^)]*\))?' {path}/**/*.ts

# OneValidators usage
grep -oE 'OneValidators\.\w+(\([^)]*\))?' {path}/**/*.ts

# Custom validators (private methods)
grep -E '#\w+Validator\s*\(' {path}/**/*.ts

# Form control access patterns
grep -E '\.controls\.\w+' {path}/**/*.ts
grep -E "\.get\(['\"][^'\"]+['\"]\)" {path}/**/*.ts
```

### HTML Patterns

```bash
# All form bindings
grep -oE 'formControlName="[^"]+"' {path}/**/*.html
grep -oE 'formGroupName="[^"]+"' {path}/**/*.html
grep -oE 'formArrayName="[^"]+"' {path}/**/*.html
grep -oE '\[formGroup\]="[^"]+"' {path}/**/*.html
grep -oE '\[formControlName\]="[^"]+"' {path}/**/*.html
```

## Common Issues in Migration

### Issue 1: Missing Validators

```typescript
// Source (old)
name: ['', [Validators.required, Validators.maxLength(32)]]

// Target (new) - WRONG: missing maxLength
name: ['', [OneValidators.required]]

// Target (new) - CORRECT
name: ['', [OneValidators.required, OneValidators.maxLength(32)]]
```

### Issue 2: Wrong Form Access Pattern

```typescript
// Old - using .get()
const value = this.form.get('username')?.value;

// New - using .controls (type-safe)
const value = this.form.controls.username.value;
```

### Issue 3: Missing Cross-Field Validators

```typescript
// Source has group-level validator - don't miss it!
this.fb.group({...}, { validators: [this.matchValidator()] })
```

### Issue 4: Async Validators Not Migrated

```typescript
// Source
email: ['', [Validators.required], [this.emailExistsValidator()]]

// Target - WRONG: missing async validator
email: ['', [OneValidators.required]]

// Target - CORRECT
email: ['', [OneValidators.required], [this.#emailExistsValidator()]]
```

### Issue 5: Wrong Error Display Pattern

```html
<!-- WRONG: pattern/duplicate validators need custom error messages -->
<mat-error oneUiFormError="account"></mat-error>

<!-- CORRECT: Use @if/@else for pattern, duplicate, custom validators -->
@if (ctrl.hasError('pattern')) {
  <mat-error>{{ t('validators.invalid_format_not_space') }}</mat-error>
} @else if (ctrl.hasError('duplicate')) {
  <mat-error>{{ t('validators.duplicate_account') }}</mat-error>
} @else {
  <mat-error oneUiFormError="account"></mat-error>
}
```

## Form Label Patterns

### mxLabel Directive

Use `mxLabel` directive on `mat-label` to enable label features like tooltips and optional indicators.

**Import:**
```typescript
import { MxLabelDirective } from '@moxa/formoxa/mx-label';

@Component({
  imports: [MxLabelDirective]
})
```

### mxLabelOptional (Optional Field Indicator)

For fields without `required` validator, add `mxLabelOptional` to show "(Optional)" text.

```html
<!-- Field WITHOUT required validator → add mxLabelOptional -->
<mat-form-field>
  <mat-label mxLabel mxLabelOptional>{{ t('field.label') }}</mat-label>
  <input matInput formControlName="optionalField" />
</mat-form-field>
```

**Note:** Don't specify `[mxLabelOptionalText]` - use the default value.

### mxLabelTooltip (Field Tooltip)

Use `mxLabelTooltip` instead of `mat-icon` with `matTooltip` for field hints.

```html
<!-- ❌ WRONG - Don't use mat-icon with matTooltip -->
<div class="form-row">
  <mat-form-field>
    <mat-label>{{ t('field.label') }}</mat-label>
    <mat-select formControlName="field">...</mat-select>
  </mat-form-field>
  <mat-icon class="info-icon" [matTooltip]="t('field.hint')">info</mat-icon>
</div>

<!-- ✅ CORRECT - Use mxLabelTooltip -->
<mat-form-field>
  <mat-label mxLabel [mxLabelTooltip]="t('field.hint')">
    {{ t('field.label') }}
  </mat-label>
  <mat-select formControlName="field">...</mat-select>
</mat-form-field>
```

### Combined Usage

```html
<!-- Optional field with tooltip -->
<mat-form-field>
  <mat-label mxLabel mxLabelOptional [mxLabelTooltip]="t('field.hint')">
    {{ t('field.label') }}
  </mat-label>
  <input matInput formControlName="optionalField" />
</mat-form-field>
```

---

## Error Display Quick Reference

| Validator | Error Display |
| --------- | ------------- |
| `required`, `minLength`, `maxLength`, `range`, `rangeLength`, `email` | **MUST** use `<mat-error oneUiFormError="field">` |
| **All other validators** (pattern, duplicate, custom, etc.) | **MUST** use `@if/@else` with custom message |
