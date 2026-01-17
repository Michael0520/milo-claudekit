---
paths: **/domain/**, **/features/**, **/ui/**, **/shell/**, **/application/**, **/infrastructure/**
---
# DDD Architecture Rules

## Layer Structure

```
domain/          → Business logic (NO UI dependencies)
application/     → Use cases, orchestration
infrastructure/  → External services, persistence
presentation/    → UI components
```

## Dependency Direction

Dependencies point **inward** toward domain:

```
presentation → application → domain ← infrastructure
```

## Layer Rules

### Domain (Core)
- Pure business logic
- No framework dependencies
- No UI imports
- Can import: other domain, util

### Application
- Orchestrates domain
- Handles use cases
- Can import: domain, util

### Infrastructure
- External APIs, database
- Framework specifics
- Can import: domain, application, util

### Presentation
- UI components
- Can import: application, domain types (not implementations)

## DDD in Angular (5-file pattern)

```
libs/mxsecurity/{feature}/
  domain/     → Store, API service, models
  features/   → Smart components
  ui/         → Dumb components (@Input/@Output)
  shell/      → Routing
```
