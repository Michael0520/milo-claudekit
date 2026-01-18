# MX Components

## What is this?

Moxa Formoxa UI components and directives for forms, status display, buttons, etc.

## When to use

Creating forms, displaying status, loading buttons, etc.

---

## Mat-Icon (CRITICAL)

**Must use `svgIcon` attribute, NOT text content.**

```typescript
import { MatIconModule } from '@angular/material/icon';
```

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `<mat-icon>refresh</mat-icon>` | `<mat-icon svgIcon="icon:refresh"></mat-icon>` |
| `<mat-icon>edit</mat-icon>` | `<mat-icon svgIcon="icon:edit"></mat-icon>` |
| `<mat-icon>delete</mat-icon>` | `<mat-icon svgIcon="icon:delete"></mat-icon>` |

### Common Icons

| Icon | svgIcon Value | Use Case |
|------|---------------|----------|
| Refresh | `icon:refresh` | Table refresh button |
| Edit | `icon:edit` | Edit row |
| Delete | `icon:delete` | Delete action |
| Add | `icon:add` | Create new |
| Search | `icon:search` | Search field |
| Info | `icon:info` | Information tooltip |
| Warning | `icon:warning` | Warning status |
| Error | `icon:error` | Error status |
| Check | `icon:task_alt` | Success/enabled status |
| Hide | `icon:hide_source` | Disabled status |
| Visibility | `icon:visibility` | Show password |
| Visibility Off | `icon:visibility_off` | Hide password |

```html
<!-- ❌ Wrong: Text icon -->
<button mat-button>
  <mat-icon>refresh</mat-icon>
  Refresh
</button>

<!-- ✅ Correct: svgIcon -->
<button mat-button (click)="refresh.emit()">
  <mat-icon svgIcon="icon:refresh"></mat-icon>
  {{ t('general.tooltip.refresh') }}
</button>
```

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

## MxPasswordVisibility

Password field visibility toggle component.

```typescript
import { MxPasswordVisibilityComponent } from '@moxa/formoxa/mx-password-visibility';
```

```html
<mat-form-field>
  <mat-label mxLabel>{{ t('general.common.password') }}</mat-label>
  <input matInput [type]="passwordVisible ? 'text' : 'password'" formControlName="password" />
  <mx-password-visibility matSuffix [(visible)]="passwordVisible" />
  <mat-error oneUiFormError="password"></mat-error>
</mat-form-field>
```

```typescript
// In component
passwordVisible = false;
```

---

## mxAutoTooltip

Auto-detects text overflow and shows tooltip only when text is truncated.

```typescript
import { MxAutoTooltipDirective } from '@moxa/formoxa/mx-auto-tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
```

**Must use with `gl-ellipsis-text` class:**

```html
<td mat-cell *matCellDef="let row">
  <span class="gl-ellipsis-text" mxAutoTooltip [matTooltip]="row.description">
    {{ row.description }}
  </span>
</td>
```

```scss
// Set column width constraints
.mat-column-description {
  min-width: 300px;
  max-width: 300px;
}
```

| Class/Directive | Purpose |
|-----------------|---------|
| `gl-ellipsis-text` | CSS class for text truncation with ellipsis |
| `mxAutoTooltip` | Only shows tooltip when text overflows |
| `[matTooltip]` | The full text to display in tooltip |

---

## Form Row Layout

Use `.form-row` class to group multiple fields on the same row.

```html
<!-- ❌ Wrong: Fields on separate rows when Legacy has them on same row -->
<mat-form-field>
  <mat-label>{{ t('organization_name') }}</mat-label>
  <input matInput formControlName="organizationName" />
</mat-form-field>
<mat-form-field>
  <mat-label>{{ t('organizational_unit') }}</mat-label>
  <input matInput formControlName="organizationalUnit" />
</mat-form-field>

<!-- ✅ Correct: Keep same row grouping as Legacy -->
<div class="form-row">
  <mat-form-field>
    <mat-label>{{ t('organization_name') }}</mat-label>
    <input matInput formControlName="organizationName" />
  </mat-form-field>
  <mat-form-field>
    <mat-label>{{ t('organizational_unit') }}</mat-label>
    <input matInput formControlName="organizationalUnit" />
  </mat-form-field>
</div>
```

⚠️ **Migration Rule**: Analyze Legacy source for `fxLayout="row"` patterns and replicate with `.form-row` class.

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
