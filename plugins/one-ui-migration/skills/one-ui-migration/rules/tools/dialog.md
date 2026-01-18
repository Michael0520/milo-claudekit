# MatDialog

## What is this?

Angular Material dialog component, used with One-UI dialog configs.

## When to use

Create/edit form dialogs, confirmation dialogs.

## Import

```typescript
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { mediumDialogConfig, smallDialogConfig } from '@one-ui/shared/domain';
```

---

## Opening a Dialog (CRITICAL)

**Must pass `viewContainerRef`**, otherwise Store injection in Dialog will fail:

```typescript
readonly #dialog = inject(MatDialog);
readonly #viewContainerRef = inject(ViewContainerRef);  // Required

openDialog() {
  this.#dialog.open(FeatureDialogComponent, {
    ...mediumDialogConfig,
    viewContainerRef: this.#viewContainerRef,  // Required
    data: { mode: 'create' }
  });
}
```

---

## Dialog Sizes

```typescript
import { smallDialogConfig, mediumDialogConfig, largeDialogConfig, extraLargeDialogConfig } from '@one-ui/shared/domain';
```

| Config | Width | Use Case |
|--------|-------|----------|
| `smallDialogConfig` | 400px | Confirmation dialog |
| `mediumDialogConfig` | 560px | Standard form |
| `largeDialogConfig` | 720px | Complex form |
| `extraLargeDialogConfig` | 960px | Large data table |

---

## ConfirmDialogComponent (Delete Confirmation)

Use for delete confirmations and other destructive actions.

```typescript
import { ConfirmDialogComponent } from '@one-ui/shared/ui';
import { CONFIRM_DIALOG_CONFIG } from '@one-ui/shared/domain';
```

### Opening Confirm Dialog

```typescript
readonly #dialog = inject(MatDialog);
readonly #viewContainerRef = inject(ViewContainerRef);

onDelete(ids: string[]): void {
  const dialogRef = this.#dialog.open(ConfirmDialogComponent, {
    ...CONFIRM_DIALOG_CONFIG,
    viewContainerRef: this.#viewContainerRef,
    data: {
      title: this.#transloco.translate('general.dialog.delete_title'),
      message: this.#transloco.translate('general.dialog.delete_message', { count: ids.length }),
      confirmText: this.#transloco.translate('general.button.delete'),
      cancelText: this.#transloco.translate('general.button.cancel')
    }
  });

  dialogRef.afterClosed().subscribe((confirmed) => {
    if (confirmed) {
      this.#store.deleteItems({ ids });
    }
  });
}
```

### ConfirmDialog Data Interface

```typescript
interface ConfirmDialogData {
  title: string;       // Dialog title
  message: string;     // Confirmation message
  confirmText: string; // Confirm button text
  cancelText: string;  // Cancel button text
}
```

### Complete Delete Flow

```
Table (select items)
    ↓
Page Component (onDelete)
    ↓
ConfirmDialogComponent (user confirms)
    ↓
Store.deleteItems (API call)
    ↓
Store.loadItems (refresh table)
```

```typescript
// In Store
deleteItems: mutationMethod<{ ids: string[] }, void>({
  store,
  observe: ({ ids }) => api.delete$(ids),
  next: () => {
    // Refresh list after delete
    store.loadItems();
  }
})
```

---

## Dialog Component Template

```typescript
@Component({
  selector: 'one-ui-feature-dialog',
  imports: [MatDialogModule, MatButtonModule, ReactiveFormsModule, ...],
  templateUrl: './feature-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureDialogComponent {
  readonly #dialogRef = inject(MatDialogRef<FeatureDialogComponent>);
  readonly #store = inject(FeatureStore);
  readonly #fb = inject(NonNullableFormBuilder);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  readonly loading = this.#store.loading;

  form = this.#fb.group({
    name: [this.data.item?.name ?? '', [OneValidators.required]]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.#store.createItem({
      input: this.form.getRawValue(),
      next: () => this.#dialogRef.close({ success: true })  // Close only on success
    });
  }
}
```

---

## Dialog HTML Template

```html
<h2 *transloco="let t" mat-dialog-title>
  {{ isEditMode ? t('features.xxx.edit_title') : t('features.xxx.create_title') }}
</h2>

<mat-dialog-content *transloco="let t">
  <form [formGroup]="form" class="dialog-form">
    <!-- Form fields -->
  </form>
</mat-dialog-content>

<div *transloco="let t" mat-dialog-actions align="end">
  <button mat-button color="primary" [disabled]="loading()" mat-dialog-close>
    {{ t('general.button.cancel') }}
  </button>
  <button mat-flat-button color="primary"
    [disabled]="form.invalid || loading()"
    [mxButtonIsLoading]="loading()"
    (click)="onSubmit()">
    {{ t('general.button.submit') }}
  </button>
</div>
```

---

## Common Mistakes

### 1. Wrong Dialog Close Timing

```typescript
// ❌ WRONG: Closes even on API failure
onSubmit(): void {
  this.#store.updateItem(formData);
  this.#dialogRef.close();  // Closes immediately
}

// ✅ CORRECT: Close only on success
onSubmit(): void {
  this.#store.updateItem({
    input: this.form.getRawValue(),
    next: () => this.#dialogRef.close()  // Close only on success
  });
}
```

### 2. Loading Button Still Clickable

```html
<!-- ❌ WRONG: Can still click during loading -->
<button [mxButtonIsLoading]="loading()" [disabled]="form.invalid">

<!-- ✅ CORRECT: Add loading() to disabled -->
<button [mxButtonIsLoading]="loading()" [disabled]="form.invalid || loading()">
```

### 3. Missing viewContainerRef

```typescript
// ❌ WRONG: Store injection will fail
this.#dialog.open(FeatureDialogComponent, {
  ...mediumDialogConfig,
  data: { mode: 'create' }
});

// ✅ CORRECT: Pass viewContainerRef
this.#dialog.open(FeatureDialogComponent, {
  ...mediumDialogConfig,
  viewContainerRef: this.#viewContainerRef,
  data: { mode: 'create' }
});
```

### 4. Cancel Button Usage

```html
<!-- ❌ WRONG: Manual method -->
<button mat-button (click)="cancel()">Cancel</button>

<!-- ✅ CORRECT: Use directive -->
<button mat-button mat-dialog-close>Cancel</button>
```

---

## Related Tools

- [form-builder.md](./form-builder.md) - Dialog forms
- [one-validators.md](./one-validators.md) - Form validation
- [mx-components.md](./mx-components.md) - mxButtonIsLoading
