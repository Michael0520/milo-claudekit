---
name: legacy-scope-analyzer
description: Analyze legacy scope and generate migration plan. Trigger: migrate legacy scope for {path}
tools: Read, Grep, Glob, Bash
model: sonnet
---

# Legacy Scope Analyzer Agent

Analyze Angular legacy codebase and produce a **migration-ready specification** with implementation plan.

## Trigger

`migrate legacy scope for {path}`

## Output

A single document with:
1. **Spec** - What exists in legacy code
2. **Plan** - How to implement in new architecture

---

## Phase 1: Analyze Legacy Code

### 1.1 Structure Analysis

```bash
# Routes
rg -n 'path:|loadChildren|Routes' --type ts {path}

# Components
rg -l '@Component' --type ts {path}

# Modules
rg -l '@NgModule' --type ts {path}
```

### 1.2 API Calls

```bash
rg -n 'this\.http\.(get|post|put|delete|patch)' --type ts {path}
rg -n 'ApiService|HttpClient' --type ts {path}
```

### 1.3 i18n Keys

```bash
# Templates
rg -o "'\w+(\.\w+)+'" --type html {path}
rg -n '\| *translate' --type html {path}

# TypeScript
rg -n 'translate|TranslocoService|instant' --type ts {path}
```

### 1.4 Forms

```bash
rg -n 'FormGroup|FormControl|FormBuilder|Validators' --type ts {path}
```

### 1.5 UI Components

```bash
rg -n 'MatDialog|DialogRef|openDialog' --type ts {path}
rg -n 'selector:' --type ts {path}
```

### 1.6 State Management

```bash
rg -n 'Store|@ngrx|BehaviorSubject|ReplaySubject' --type ts {path}
```

---

## Phase 2: Generate Output Document

```markdown
# Migration: {scope-name}

## Spec Summary

| Category | Count |
|----------|-------|
| Components | X |
| API Endpoints | X |
| i18n Keys | X |
| Forms | X |

---

## 1. Feature Specs (BDD)

### Feature: {Name}

**Scenario: {description}**
- Given {precondition}
- When {action}
- Then {result}

---

## 2. API Endpoints

| Method | Endpoint | Used In |
|--------|----------|---------|
| GET | /api/xxx | Component |

---

## 3. i18n Keys

| Key | Used In |
|-----|---------|
| SCOPE.KEY | component |

---

## 4. Forms

### {FormName}

| Field | Type | Validators |
|-------|------|------------|
| name | text | required |

---

## 5. Components

| Legacy Component | Type |
|------------------|------|
| XxxComponent | Page |
| YyyDialogComponent | Dialog |

---

## 6. Migration Plan

### New File Structure

```
libs/{scope}/
├── domain/
│   ├── models/{scope}.model.ts
│   └── ports/{scope}.port.ts
├── data/
│   └── {scope}.repository.ts
├── features/
│   └── {feature}/
│       ├── {feature}.store.ts
│       └── {feature}.component.ts
└── ui/
    └── components/
```

### Implementation Order

1. **Domain Layer**
   - [ ] Create models from API response types
   - [ ] Define port interface

2. **Data Layer**
   - [ ] Implement repository with endpoints:
     - GET /api/xxx
     - POST /api/xxx

3. **Feature Layer**
   - [ ] Create SignalStore with:
     - State: {list state properties}
     - Computed: {list computed}
     - Methods: {list methods}
   - [ ] Implement components:
     - [ ] {Component1} - {purpose}
     - [ ] {Component2} - {purpose}

4. **UI Layer**
   - [ ] Create presentational components

5. **i18n**
   - [ ] Map all keys to new translation files

### Parity Checklist

- [ ] All API endpoints implemented
- [ ] All i18n keys mapped
- [ ] All form validators match
- [ ] All BDD scenarios pass
```

---

## Guidelines

1. **Be concise** - Focus on actionable items
2. **Prioritize** - Order implementation by dependencies
3. **Checklist format** - Easy to track progress
4. **DDD structure** - Follow one-ui-migration patterns
