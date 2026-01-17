# Page Layout

## What is this?

One-UI page layout components and CSS classes.

## When to use

When creating new pages.

## Import

```typescript
import { BreadcrumbComponent } from '@one-ui/shared/ui';
import { MxPageTitleComponent } from '@moxa/formoxa/mx-page-title';
```

---

## Basic Structure

```html
<div *transloco="let t" class="gl-page-content">
  <one-ui-breadcrumb />
  <mx-page-title [title]="t('features.xxx.page_title')" />
  <div class="content-wrapper">
    <!-- Page content -->
  </div>
</div>
```

---

## CSS Classes

| Class | Use |
|-------|-----|
| `gl-page-content` | Root container (provides padding) |
| `content-wrapper` | Content container (replaces mat-card) |

---

## Page Component Style

```scss
:host { display: block; }  // Do not add padding
```

⚠️ **Important**: Do not add padding to page component, `gl-page-content` already provides it.

---

## Full Example

```typescript
@Component({
  selector: 'one-ui-feature-page',
  imports: [TranslocoModule, BreadcrumbComponent, MxPageTitleComponent, FeatureTableComponent],
  template: `
    <div *transloco="let t" class="gl-page-content">
      <one-ui-breadcrumb />
      <mx-page-title [title]="t('features.xxx.page_title')" />
      <div class="content-wrapper">
        <one-ui-feature-table
          [tableData]="items()"
          [loading]="loading()"
          (add)="openCreateDialog()"
          (edit)="openEditDialog($event)"
        />
      </div>
    </div>
  `,
  styles: `:host { display: block; }`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturePageComponent {
  readonly store = inject(FeatureStore);
  readonly #dialog = inject(MatDialog);
  readonly #viewContainerRef = inject(ViewContainerRef);

  readonly items = this.store.items;
  readonly loading = this.store.loading;
}
```

---

## Common Mistakes

```html
<!-- ❌ WRONG: Using mat-card -->
<mat-card>
  <mat-card-content>...</mat-card-content>
</mat-card>

<!-- ✅ CORRECT: Using content-wrapper -->
<div class="content-wrapper">...</div>
```

```scss
// ❌ WRONG: Page component with padding
:host {
  display: block;
  padding: 16px;
}

// ✅ CORRECT: Only display: block
:host {
  display: block;
}
```

---

## Related Tools

- [common-table.md](./common-table.md) - Tables in pages
- [dialog.md](./dialog.md) - Opening dialogs
