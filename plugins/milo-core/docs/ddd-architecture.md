# DDD Architecture Guide

## Layer Structure

```
src/
├── domain/           # Pure business logic (NO dependencies)
├── application/      # Use cases and workflows
├── infrastructure/   # External adapters
└── presentation/     # UI components
```

## Dependency Rules

```
presentation → application → domain ← infrastructure
                    ↓
              (all point to domain)
```

- **Domain**: NO external dependencies, pure business logic
- **Application**: Depends only on domain
- **Infrastructure**: Implements domain interfaces
- **Presentation**: Depends on application only

## Domain Layer (5-File Pattern for Angular/MXSecurity)

```
libs/mxsecurity/{feature}/domain/src/
├── {feature}.api.ts      # HTTP calls to backend
├── {feature}.def.ts      # Type definitions, interfaces, enums
├── {feature}.model.ts    # Data models (max 300 lines)
├── {feature}.store.ts    # ONE SignalStore per feature
└── {feature}.helper.ts   # Pure utility functions
```

## Module Boundary Rules

- `domain/` can only import from: util, other domain
- `features/` can import from: domain, ui, util
- `ui/` can only import types from domain (no stores)
- `shell/` can import from: features, domain

## Key Principles

1. **One Store per Feature**: Never create multiple stores for same feature
2. **300-Line Limit**: Split models if exceeding 300 lines
3. **No Cross-Feature Imports**: Features cannot import from other features
4. **Config-Driven**: Extract business rules to configuration files
