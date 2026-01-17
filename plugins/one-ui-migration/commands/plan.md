# /one-ui-migration:plan

Plan a One-UI migration with integrated tool references.

## Usage

```
/one-ui-migration:plan {feature-name}
```

## Process

### Phase 1: Legacy Analysis

1. Read the Legacy component files for `{feature-name}`
2. Identify what the Legacy uses:
   - Forms? Tables? Dialogs?
   - State management pattern?
   - Which MX components?

3. Map to required tools:

| Legacy has... | Required tool |
|---------------|---------------|
| Forms | `form-builder.md`, `one-validators.md` |
| Tables | `common-table.md`, `transloco.md` |
| Dialogs | `dialog.md` |
| State | `signal-store.md` |
| Status | `mx-components.md` |
| Page | `page-layout.md` |

### Phase 2: Design with Tool References

Use `superpowers:brainstorming` workflow, but include:

```markdown
## Tool Analysis

Required tools for this migration:
1. `rules/tools/{tool1}.md` - {why needed}
2. `rules/tools/{tool2}.md` - {why needed}
...
```

### Phase 3: Write Plan with Checklists

Use `superpowers:writing-plans` workflow, ensuring each task has:

```markdown
### Task N: {description}

**Tool References**:
- `rules/tools/{tool}.md`

**Verification**:
- [ ] {checklist item from tool file}
```

### Phase 4: Validate

After execution, run:
```
check migration for libs/mxsecurity/{feature-name}
```

## Reference

See `skills/migration-planning/SKILL.md` for:
- Complete tool checklists
- Task template
- Detailed workflow
