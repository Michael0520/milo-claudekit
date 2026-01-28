# Table Migration - Auto-Generate Columns

## Overview

`CommonTableComponent` auto-generates header and cell templates for columns that do **not** have `noAutoGenerate: true`:

```html
<!-- auto-generated header -->
{{ column.header ? t(column.header) : '' }}

<!-- auto-generated cell -->
<span class="tooltip-wrapper" [matTooltip]="tooltip" [matTooltipDisabled]="tooltipDisabled">
  {{ row[column.key] | noData }}
</span>
```

- `header` accepts an **i18n key**, translated by the template's `t()`
- Cell displays `row[key]` directly — value must be **display-ready** (string or number)
- Tooltip controlled via column config's `rowTooltip` / `rowTooltipDisable`

---

## When to Auto-Generate

| Cell Content | Auto-Generate | Approach |
|---|:---:|---|
| Plain text `{{ row.xxx }}` | ✅ | Remove `noAutoGenerate`, set `header` i18n key |
| `{{ row.xxx \| noData }}` | ✅ | Same — auto-generate includes `noData` pipe |
| `{{ row.xxx \| date:'yyyy-MM-dd HH:mm:ss' }}` | ✅ | Pre-format in `viewData` computed |
| Ellipsis + tooltip (long text) | ✅ | Use `truncate` + `rowTooltip` / `rowTooltipDisable` |
| Composite header (multiple i18n keys) | ✅ | Pre-translate with `translate()` + `langChanged()` |
| Angular component (`<mx-status>`, `<mat-icon>`) | ❌ | Keep `noAutoGenerate: true` |
| `<button>` | ❌ | Keep `noAutoGenerate: true` |
| `<mat-checkbox>` | ❌ | Keep `noAutoGenerate: true` |

> **Core rule:** Cell shows text only → auto-generate. Cell needs Angular component → keep custom template.

---

## Migration Steps

### Step 1: Classify Columns

Check each `noAutoGenerate: true` column's HTML cell content and decide whether it can be converted using the table above.

---

### Step 2: Pre-format Date Columns

Create a `viewData` computed to format dates as strings:

```typescript
import { formatDate } from '@angular/common';

readonly viewData = computed(() =>
  this.data().map((row) => ({
    ...row,
    createdAt: row.createdAt
      ? formatDate(row.createdAt, 'yyyy-MM-dd HH:mm:ss', this.#transloco.getActiveLang())
      : ''
  }))
);
```

Bind HTML to `[data]="viewData()"`.

> Once dates are pre-formatted as strings, any custom `filter` function for date columns can be removed — the default text search matches correctly.

---

### Step 3: Long Text Columns (Truncate + Tooltip)

For columns with content that may overflow (e.g. activation codes), use `width`, `truncate`, `rowTooltip`:

```typescript
{
  key: 'activationCode',
  header: 'pages.system.license.activationCode',
  width: '300px',
  truncate: true,
  rowTooltip: (row: unknown) => (row as RowType).activationCode ?? '',
  rowTooltipDisable: (row: unknown) => !(row as RowType).activationCode
}
```

| Property | Effect |
|---|---|
| `width` | Sets `<th>` `minWidth`; with `truncate`, also sets `<th>` and `<td>` `maxWidth` |
| `truncate` | Adds `gl-ellipsis-text` class (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`) |
| `rowTooltip` | Shows full content on hover |
| `rowTooltipDisable` | Disables tooltip when no data |

> `TableColumn<R = unknown>` callback parameter is `unknown` — cast is required.

---

### Step 4: Composite Headers

Pre-translate with `translate()` and use `langChanged()` to update on language switch:

```typescript
import { langChanged } from '@one-ui/shared/ui/translation';

readonly #langChanged = langChanged();

readonly columns = computed<TableColumn[]>(() => {
  this.#langChanged();
  return [
    {
      key: 'duration',
      header: `${this.#transloco.translate('key.duration')} (${this.#transloco.translate('key.days')})`
    }
  ];
});
```

> `t(column.header)` returns the raw string when no matching key is found, so pre-translated strings display correctly.

---

### Step 5: Remove Custom Template Blocks

Delete `<ng-container matColumnDef="xxx">` blocks for columns converted to auto-generate.

If **all** columns are auto-generated, remove the entire `<ng-template #tableColumnsTemplate>`.

---

### Step 6: Clean Up Imports

| Import | Remove When |
|---|---|
| `DatePipe` | Dates handled by `formatDate()` in TS |
| `MatTableModule` / `MatSortModule` | No custom `matColumnDef` remains |
| `MxTooltipDirective` | Tooltip handled by `rowTooltip` |
| `NoDataPipe` | Auto-generate includes `noData` pipe |

---

### Step 7: Verify

```bash
npx nx build <app> --configuration=development --skip-nx-cache
npx nx run-many -t lint -p <lib> --skip-nx-cache
```

---

## Reference Examples

**mx-ros account-page** — Data-driven complete example:
- `libs/mx-ros/account-page/domain/src/lib/account-page.helper.ts` — Data transforms (date, enum → display string)
- `libs/mx-ros/account-page/ui/src/lib/account-table/account-table.component.ts` — Column config (only `enable` uses `noAutoGenerate` for `<mx-status>`)

**mxsecurity license tables** — Date + tooltip + composite header:
- `libs/mxsecurity/license/ui/src/lib/license-history-table/` — Date pre-format + tooltip + composite header
- `libs/mxsecurity/license/ui/src/lib/device-license-table/` — 6 columns auto-generate, 4 columns kept (component/icon)
