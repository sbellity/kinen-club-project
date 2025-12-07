# ADR-008: Dual Backend Storage for A/B Comparison

## Status
**Accepted** (Dec 7, 2025)

## Context
We have two potential search backends:
1. **SQLite + FTS5**: Existing, working, fast keyword search
2. **LanceDB**: Vector search, hybrid capabilities

Need to compare search quality before fully committing to LanceDB.

## Decision
**Implement `DualStorage` wrapper** that writes to both backends and reads from primary, with optional comparison mode.

## Rationale
- **Safe migration**: No data loss during transition
- **Quality comparison**: Can run same queries against both
- **Rollback**: Switch primary without data migration
- **Transparency**: Appears as single storage to callers

## Implementation
```go
// internal/storage/dual/storage.go
type DualStorage struct {
    primary   storage.Storage
    secondary storage.Storage
    compare   bool // If true, compare results from both
}

func (d *DualStorage) Insert(ctx context.Context, doc Document) error {
    // Write to both
    if err := d.primary.Insert(ctx, doc); err != nil {
        return err
    }
    if err := d.secondary.Insert(ctx, doc); err != nil {
        log.Warn("secondary insert failed", "error", err)
    }
    return nil
}

func (d *DualStorage) Search(ctx context.Context, query SearchQuery) ([]Result, error) {
    results := d.primary.Search(ctx, query)
    
    if d.compare {
        secondary := d.secondary.Search(ctx, query)
        log.Info("search comparison", "primary", len(results), "secondary", len(secondary))
        // Could merge with RRF here
    }
    
    return results, nil
}
```

## Consequences

### Positive
- Risk-free backend comparison
- Easy rollback if LanceDB underperforms
- Can gradually shift traffic

### Negative
- 2x write cost
- Comparison mode has overhead
- More complex than single backend

## Related Decisions
- [ADR-001: Files as Source of Truth](0001-files-as-source-of-truth.md)
- [ADR-004: Separate Storage Interfaces](0004-separate-storage-interfaces.md)


