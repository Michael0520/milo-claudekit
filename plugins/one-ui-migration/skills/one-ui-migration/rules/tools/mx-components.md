# MX Components

## What is this?

Moxa Formoxa UI components and directives for forms, status display, buttons, etc.

## When to use

Creating forms, displaying status, loading buttons, etc.

---

## MxStatus

Displays enabled/disabled and other statuses.

```typescript
import { MxStatusComponent } from '@moxa/formoxa/mx-status';
```

```html
@if (row.enabled) {
  <mx-status statusType="success" statusIcon="icon:task_alt" [statusText]="t('general.common.enable')" />
} @else {
  <mx-status statusType="neutral" statusIcon="icon:hide_source" [statusText]="t('general.common.disable')" />
}
```

| statusType | statusIcon | Use Case |
|------------|------------|----------|
| `success` | `icon:task_alt` | Enabled, connected, complete |
| `neutral` | `icon:hide_source` | Disabled, disconnected |
| `warning` | `icon:warning` | Warning |
| `error` | `icon:error` | Error |

---

## mxLabel

Form field label with tooltip and optional indicator support.

```typescript
import { MxLabelDirective } from '@moxa/formoxa/mx-label';
```

```html
<!-- Standard field with tooltip -->
<mat-form-field>
  <mat-label mxLabel [mxLabelTooltip]="t('field.hint')">{{ t('field.label') }}</mat-label>
  <input matInput formControlName="fieldName" />
</mat-form-field>

<!-- Optional field -->
<mat-form-field>
  <mat-label mxLabel mxLabelOptional [mxLabelOptionalText]="t('general.common.optional')">
    {{ t('field.label') }}
  </mat-label>
  <input matInput formControlName="optionalField" />
</mat-form-field>
```

| Directive | Use |
|-----------|-----|
| `mxLabel` | Base directive (required) |
| `mxLabelOptional` | Shows "Optional" |
| `[mxLabelOptionalText]` | Custom optional text |
| `[mxLabelTooltip]` | Info tooltip |

---

## mxButtonIsLoading

Button loading state (shows spinner).

```typescript
import { MxLoadingButtonDirective } from '@moxa/formoxa/mx-button';
```

```html
<button mat-flat-button color="primary"
  [mxButtonIsLoading]="loading()"
  [disabled]="form.invalid || loading()"
  (click)="onSubmit()">
  {{ t('general.button.submit') }}
</button>
```

⚠️ **Note**: `[mxButtonIsLoading]` only shows spinner, **does NOT auto-disable**! You must manually add `loading()` to `[disabled]`.

---

## oneUiFormError

Automatically displays form validation error messages.

```typescript
import { OneUiFormErrorDirective } from '@one-ui/shared/ui/form';
```

```html
<mat-form-field>
  <mat-label>{{ t('field.label') }}</mat-label>
  <input matInput formControlName="fieldName" />
  <mat-error oneUiFormError="fieldName"></mat-error>
</mat-form-field>
```

---

## oneUiFormHint

Automatically displays range hints (reads from range validator).

```html
<mat-form-field>
  <mat-label>{{ t('field.port') }}</mat-label>
  <input matInput type="number" formControlName="port" />
  <mat-hint oneUiFormHint="port"></mat-hint>  <!-- Shows "1 ~ 65535" -->
  <mat-error oneUiFormError="port"></mat-error>
</mat-form-field>
```

---

## MxFileUploader

File upload component.

```typescript
import { MxFileUploaderComponent } from '@moxa/formoxa/mx-file-uploader';
```

```html
<mat-form-field>
  <mat-label>{{ t('general.common.select_file') }}</mat-label>
  <mx-file-uploader
    formControlName="fileSelection"
    (onUpload)="onLocalFileSelected($event)"
  ></mx-file-uploader>
  <mat-error oneUiFormError="fileSelection"></mat-error>
</mat-form-field>
```

---

## MxTabGroup

Tab component directive.

```typescript
import { MxTabGroupDirective } from '@moxa/formoxa/mx-tabs';
```

```html
<mat-tab-group mxTabGroup animationDuration="0ms" [mat-stretch-tabs]="false">
  <mat-tab [label]="t('tab.general')">...</mat-tab>
  <mat-tab [label]="t('tab.advanced')">...</mat-tab>
</mat-tab-group>
```

---

## Common Import List

```typescript
// Forms
import { ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// MX Components
import { MxLabelDirective } from '@moxa/formoxa/mx-label';
import { MxLoadingButtonDirective } from '@moxa/formoxa/mx-button';
import { MxStatusComponent } from '@moxa/formoxa/mx-status';
import { OneUiFormErrorDirective } from '@one-ui/shared/ui/form';
import { OneValidators } from '@one-ui/shared/domain';
```

---

## Related Tools

- [form-builder.md](./form-builder.md) - Form creation
- [one-validators.md](./one-validators.md) - Form validation
- [dialog.md](./dialog.md) - Forms in dialogs
