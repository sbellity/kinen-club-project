# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the kinen project.

ADRs document significant architectural decisions using the format described at [adr.github.io](https://adr.github.io/).

## Decision Log

| # | Decision | Date | Status |
|---|----------|------|--------|
| [ADR-001](0001-files-as-source-of-truth.md) | Files as Source of Truth | Dec 6, 2025 | Accepted |
| [ADR-002](0002-proto-first-api.md) | Proto-First API Design | Dec 7, 2025 | Accepted |
| [ADR-003](0003-repository-pattern.md) | Repository Pattern | Dec 7, 2025 | Accepted |
| [ADR-004](0004-separate-storage-interfaces.md) | Separate Storage Interfaces | Dec 7, 2025 | Accepted |
| [ADR-005](0005-pdfcpu-cli.md) | pdfcpu via CLI | Dec 6, 2025 | Accepted |
| [ADR-006](0006-adapter-pattern.md) | Adapter Pattern for IndexWorker | Dec 7, 2025 | Accepted |
| [ADR-007](0007-on-demand-indexworker.md) | On-Demand IndexWorker | Dec 7, 2025 | Accepted |
| [ADR-008](0008-dual-backend.md) | Dual Backend Storage | Dec 7, 2025 | Accepted |
| [ADR-009](0009-beads-coordination.md) | beads Coordination Protocol | Dec 6, 2025 | Accepted |

## Creating New ADRs

Use the template:

```markdown
# ADR-NNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
What is the issue that we're seeing that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```
