# Angular Code Quality Rules

General Angular best practices. Referenced by `angular-code-review` agent.

---

## 1. Type Organization

Centralize types in `model.ts`, not scattered in components.

```typescript
// ❌ BAD: dialog.component.ts
interface DialogData { mode: 'create' | 'edit'; }

// ✅ GOOD: domain/feature.model.ts
export interface DialogData { mode: 'create' | 'edit'; }
export type ViewMode = 'list' | 'grid';
```

**Detect**: `rg -n '^interface |^type ' --glob '!**/model.ts' --glob '!*.spec.ts'`

---

## 2. No Getter - Use computed()

```typescript
// ❌ BAD: hidden reactivity, no caching
get isFirstStep(): boolean {
  return this.stepper().selectedIndex === 0;
}

// ✅ GOOD: explicit, cached, trackable
readonly isFirstStep = computed(() => this.stepper().selectedIndex === 0);
```

**Detect**: `rg -n '^\s+get \w+\(\)' --glob '!*.spec.ts'`

---

## 3. Dialog Simplification

Use `mat-dialog-close` directive for simple cancel/submit.

```html
<!-- ❌ BAD: unnecessary method -->
<button (click)="cancel()">Cancel</button>

<!-- ✅ GOOD: directive -->
<button mat-dialog-close>Cancel</button>
<button [mat-dialog-close]="form.getRawValue()">Submit</button>
```

**When to use MatDialogRef**: Close after API call, conditional close, prevent close.

**Detect**: `rg -n '\(click\)="cancel\(\)"' --type html`

---

## 4. Remove Dead Code

```typescript
// ❌ BAD: empty callbacks
observable$.subscribe({
  next: () => {},  // remove
  error: () => {}  // remove
});

// ✅ GOOD: remove entirely
observable$.subscribe();
```

**Detect**: `rg -n 'next:\s*\(\)\s*=>\s*\{\}'`

---

## 5. Avoid Over-Engineering

```typescript
// ❌ BAD: multiple layers for simple fetch
readonly data$ = this.service.getData$();
readonly data = toSignal(this.data$);
readonly processed = computed(() => this.data()?.map(...));

// ✅ GOOD: simple method
loadData() {
  this.service.getData$().subscribe(data => this.process(data));
}
```

**Rule**: If one method solves it, don't create abstraction layers.

---

## 6. Type Safety

```typescript
// ❌ BAD
const data: any = response;

// ✅ GOOD
const data: UserResponse = response;

// ✅ For unknown: use unknown, not any
function handleError(error: unknown) { ... }
```

**Best practices**:
- No `any` (use `unknown` if truly unknown)
- Prefer `type` over `enum`
- Use `readonly #` for private injected services

**Detect**: `rg -n ': any\b|as any\b' --glob '!*.spec.ts'`

---

## 7. OnPush Change Detection

```typescript
// ❌ BAD: default CD
@Component({ selector: 'app-x', template: `...` })

// ✅ GOOD: OnPush
@Component({
  selector: 'app-x',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**Detect**: `rg -l '@Component' | xargs rg -L 'OnPush'`

---

## 8. No NgModule

Angular 20 uses standalone by default. No need to write `standalone: true`.

```typescript
// ❌ BAD: NgModule (legacy pattern)
@NgModule({ declarations: [X], imports: [...] })

// ✅ GOOD: Just use @Component (standalone is default)
@Component({
  selector: 'app-x',
  imports: [CommonModule, MatButtonModule],
  ...
})
```

**Detect**: `rg -n '@NgModule' --glob '!*.spec.ts'`

---

## Checklist

```
[ ] Types in model.ts (not in components)
[ ] No getter (use computed)
[ ] Dialog cancel uses mat-dialog-close
[ ] No empty callbacks
[ ] No over-engineering
[ ] No any types
[ ] OnPush on all components
[ ] No NgModule
```
