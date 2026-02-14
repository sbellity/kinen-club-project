# Meridian v2: Pure Bitvec Machine — Technical Specification

**Status**: Draft (Round 4)
**Last Updated**: 2026-02-14
**Invariants**: [docs/architecture/invariants.md](../../../meridian/docs/architecture/invariants.md)

---

## 1. Design Thesis

The columnar engine stores 10-20x more state than segment evaluation requires. The bitvec IS the truth. Everything else is scaffolding to re-derive bitvec bits from stored values — scaffolding that can be eliminated if we evaluate eagerly and offload raw data to storage.

**Priority is the engine.** That's where the differentiation is. Runtime infrastructure (WALs, storage, query engines) are solved problems — they follow naturally once the engine contract is right.

## 2. Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                     │
│                                                                      │
│  DataFusion (default, pure Rust):                                    │
│    - Cold clause init: predicate pushdown over Parquet snapshots     │
│    - Events aggregation: temporal clause init                        │
│                                                                      │
│  DuckDB (feature flag, opt-in):                                      │
│    - Batteries-included ingestion (filesystem/s3/iceberg/http)       │
│    - SQL-based data transformation                                   │
│                                                                      │
│  Storage: open format on object storage (S3, single zone)            │
│    - Parquet or Iceberg (or DuckLake — lighter than Iceberg)         │
│    - SQLite for retraction store + control plane                     │
│    - SlateDB / SQLite for entity point queries                       │
│                                                                      │
│  EventStore trait (pluggable):                                       │
│    - DuckDB over local Parquet (default)                             │
│    - Iceberg connector (for users with existing data lakes)          │
│                                                                      │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                       RUNTIME                                        │
│                                                                      │
│  Ingest path:                                                        │
│    1. hash(entity_id) → u128                                         │
│    2. u128 → u32 slot (HashMap<u128, u32>)                           │
│    3. key_str → PropertyKeyId                                        │
│    4. value → CompactValue                                           │
│    5. engine.eval_property(slot, key_id, cv)                         │
│    6. Ingest WAL: append(property_delta)                             │
│    7. if temporal + relative window:                                 │
│         retraction_store.write(marker)  // marker first, then count  │
│         hot_counters[entity][spec] += 1                              │
│                                                                      │
│  Derived-property pipeline (generalized pattern):                    │
│    - PreAggregator: event count → synthetic property → engine        │
│    - DistanceTracker: value + clause → distance → engine (RFC-005)   │
│    - TrajectoryAggregator: boundary crossings → velocity → engine    │
│    All: derive from input+clause, feed back as synthetic properties  │
│    (Details deferred to follow-up kinen session)                     │
│                                                                      │
│  Background:                                                         │
│    - Periodic segment eval trigger                                   │
│    - Retraction sweep (configurable per engine / granularity class)  │
│    - Ingest WAL compaction → Parquet snapshots (EntityStore)         │
│    - Cold clause init via EntityStore trait (backed by DataFusion)   │
│    - Segment/clause lifecycle tracking + observability               │
│                                                                      │
│  Output WAL (RFC-006) — separate stream:                             │
│    - Membership diffs                                                │
│    - Engine state for checkpointing                                  │
│                                                                      │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                       ENGINE (pure, synchronous)                     │
│                                                                      │
│  eval_property(slot, key_id, value) → ChangedClauses                 │
│    for clause in clauses_for(key):                                   │
│      if test(value) != bitvec[clause][slot]: flip bit                │
│                                                                      │
│  compute_segments() → MembershipChanges  (periodic)                  │
│    for dirty segment: CNF eval over bitvecs                          │
│                                                                      │
│  init_clause_bitvec(id, matching_entities: &[u32])                   │
│                                                                      │
│  State: bitvecs + Roaring + hot counters                             │
│  Zero I/O. Zero strings. Zero column storage.                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.1 Two WAL Streams (confirmed separate)

| Stream | Purpose | Write pattern | Read pattern |
|--------|---------|---------------|--------------|
| **Ingest WAL** | Property deltas | High-frequency (every event) | WAL compaction (sequential), entity reconstruction |
| **Output WAL** (RFC-006) | Membership diffs, checkpoint state | Periodic (every segment eval tick) | Downstream consumers, crash recovery |

These are separate streams with different write paths and query patterns. No reason to unify.

### 2.2 Retraction Store

**Chosen: SQLite with indexed table** (also serves control plane needs).

```sql
CREATE TABLE retractions (
    expire_at_ms INTEGER NOT NULL,
    entity_slot  INTEGER NOT NULL,
    spec_id      INTEGER NOT NULL,
    delta        INTEGER NOT NULL
);
CREATE INDEX idx_expire ON retractions(expire_at_ms);

-- Sweep: atomic read + delete
DELETE FROM retractions WHERE expire_at_ms <= ? RETURNING *;
```

Behind a trait for future flexibility (S3-backed, SlateDB, etc.).
Designed for billions of events/day at cluster scale, single-node efficiency first.

### 2.3 Query Engine Strategy

| Role | Default (fast builds) | Opt-in (feature flag) |
|------|----------------------|----------------------|
| Cold clause init (R1) | **DataFusion** — pure Rust, Arrow-native, Parquet pushdown | DuckDB |
| Data ingestion (R2) | Current sources (websocket, kafka, filesystem) | **DuckDB** — SQL over anything |
| Events aggregation (R3) | **DataFusion** — SQL, window functions | DuckDB |
| Point queries (R4) | **SlateDB / SQLite** | — |

DataFusion is the default because it's pure Rust, compiles with the project (no FFI), and keeps builds fast. DuckDB behind `--features duckdb` for batteries-included scenarios.

## 3. Decisions

| Decision | Choice | Source |
|----------|--------|--------|
| Column storage | **Eliminated** | R1 Q1.1 |
| Entity IDs in engine | **u32 slots only** | R1 Q1.2 |
| Entity ID resolution | **u128 deterministic hash** (`HashMap<u128, u32>`) | R2 Q2.2 |
| EntityStore contract | Returns **u32 slots directly**, stores entityID↔u128 mapping | R2 Q2.1 |
| Clause evaluation | **Eager** inline at ingestion | R1 Q1.4 |
| Segment evaluation | **Lazy/periodic** batch CNF | R1 Q1.4 |
| Temporal (AllTime) | **Monotonic counter** (8 bytes, never retracts) | R1 Q1.3 |
| Temporal (Absolute) | **Monotonic counter** (fixed window, finalizes) | R1 Q1.3 |
| Temporal (Relative) | **Hot counter + cold sweep** (SQLite retraction store) | R1 Q1.3 + R4 Q4.2 |
| Sweep interval | **Configurable** per engine or granularity class (minute/hour/day) | R2 Q2.3 |
| Two WAL streams | **Confirmed separate** — Ingest WAL (ingest product) vs Output WAL (engine product) | R3 Q3.2 |
| Cold clause init | **EntityStore trait → DataFusion over Parquet** (DuckDB opt-in) | R2 Q2.1 + R4 Q4.1 |
| Cold init staleness | **Stale-then-catch-up** with segment/clause lifecycle observability | R2 Q2.1 |
| Distance tracking | **Lives in runtime** alongside pre-aggregation, not in engine | R2 Q2.4 |
| Derived-property pattern | **Generalized**: PreAgg, Distance, Trajectory are instances of same pattern | R2 Q2.4 + Q2.6 |
| Events storage | **EventStore trait** — pluggable (DuckDB/Parquet default, Iceberg optional) | R3 Q3.6 |
| Storage format | **Open format on object storage** (S3 single-zone). Parquet/Iceberg/DuckLake. | R3 Q3.6 |
| Query engine default | **DataFusion** (pure Rust, fast builds). DuckDB behind feature flag. | R4 Q4.1 |
| Retraction store | **SQLite** with time-indexed table, behind trait | R4 Q4.2 |
| Engine I/O | **Zero** — runtime owns all I/O | All rounds |
| RFC-005 | **v2 must not preclude it**. Trajectory as warm-path generalization of pre-aggregate. | R2 Q2.6 |
| Tenant model | **Single-tenant engine**. RFC-003 SlotManager wraps multiple v2 instances. | R3 Q3.6 |
| SegmentLifecycleTracker | **All three**: API endpoint + Watchtower panel + structured logs | R3 Q3.4 |

## 4. Memory Budget

### Per-Entity Cost (902K entities, 30 segments, 5 temporal specs)

| Component | v1 | v2 | Reduction |
|-----------|-----|-----|-----------|
| Entity registry | ~64 bytes (strings ×3) | ~28 bytes (u128→u32 HashMap) | 56% |
| Column codes + dicts | ~250 bytes | 0 | 100% |
| Clause bitvec bits | ~0.5 bytes | ~0.5 bytes | — |
| Temporal state | ~620 bytes peak | ~40 bytes (hot counters) | 94% |
| Roaring membership | ~4 bytes | ~4 bytes | — |
| **Total per entity** | **~939 bytes** | **~73 bytes** | **92%** |
| **Total for 902K** | **~808 MB** | **~65 MB** | **92%** |
| **Peak during ingestion** | **~1020 MB** | **~65 MB** | **94%** |

### Per-Tenant Cost (RFC-003: 100K entities, 200 clauses, 1000 segments)

| Component | Size |
|-----------|------|
| u128→u32 HashMap | 2.8 MB |
| Clause bitvecs | 2.5 MB |
| Roaring membership | ~0.5 MB |
| Hot temporal counters | 0.8 MB |
| **Total per tenant** | **~6.6 MB** |
| **For 10K tenants** | **~66 GB** |

With RFC-003 equivalence classes: ~3 MB/tenant → ~30 GB for 10K tenants.

Target: push as far as possible — no ceiling.

## 5. What Gets Deleted

| Component | Current LOC | v2 Status |
|-----------|-------------|-----------|
| `ColumnStore` + `DictColumn` + `ColumnCodes` | 622 | Deleted |
| `ChangeBuffer` | ~200 | Deleted |
| `EntityRegistry` strings (to_id, to_string) | ~129 | Moved to runtime as u128 HashMap |
| `ClauseCache.previous` bitvecs | ~200 | Deleted (RFC-004 M1-P1) |
| `ClauseCache.satisfying_codes` | ~300 | Deleted (not needed for eager eval) |
| `ClauseCache.distance_per_code` | ~200 | Deleted (distance tracking moves to runtime) |
| `PreAggregator.retractions` BTreeMap | ~400 | Moved to SQLite retraction store |
| Batch clause recompute in `eval.rs` | ~300 | Deleted |
| **Total removed** | **~2885 LOC (~63%)** | — |

## 6. What Gets Added (Runtime)

| Component | Role |
|-----------|------|
| `EntityHashRegistry` | `HashMap<u128, u32>` — entity identity resolution |
| `DerivedPropertyPipeline` | Generalized pattern: PreAgg, Distance, Trajectory (details TBD) |
| `IngestWal` | Property deltas (separate from Output WAL) |
| `RetractionSweeper` + SQLite store | Periodic sweep of expired retraction markers |
| `EntityStore` trait + DataFusion impl | Cold clause init, entity point queries |
| `EventStore` trait (pluggable) | Aggregate queries for temporal clause init |
| `SegmentLifecycleTracker` | Observability: clause init state, staleness, catch-up progress |

## 7. Implementation — POC First

**Approach:** Build POC (Phase 0+1+2), measure with GH Archive benchmark, validate with DST. Iterate closely.

### POC Scope (Phase 0+1+2)

| Phase | What | Risk |
|-------|------|------|
| **0** | Eliminate `previous` bitvecs + skip non-predicate columns | None |
| **1** | u128 entity identity in runtime | Low |
| **2** | Eager clause eval with dual-write validation | **High** |

**POC Benchmark Protocol:**
Run GH Archive (14M events, 902K entities, 30 segments) + Criterion benches.

| Metric | v1 baseline | v2 POC target |
|--------|------------|---------------|
| Steady-state RSS | 461 MB | < 100 MB |
| Peak RSS | 1020 MB | < 150 MB |
| Throughput | ~66K events/sec | ≥ 66K (no regression) |
| Correctness | reference model match | dual-write match |

**Success = memory below target + no throughput regression + bitvec correctness.**

### POC Results (Phase 0-2, 2026-02-14)

| Metric | v1 baseline | Phase 0-2 actual | Notes |
|--------|------------|-------------------|-------|
| Steady-state RSS | 461 MB | ~995 MB | Expected: additive (new + old paths), no deletions yet |
| Peak RSS | 1020 MB | ~1219 MB | Same reason |
| Throughput | ~66K events/sec | **~82K events/sec** | +24%, from skip-non-predicate optimization |
| Correctness | — | unit tests pass (191) | Dual-write validated in unit tests only |

**Key learning:** Phase 0-2 proved the eager eval mechanics work in isolation but did not validate at scale. Phase 2.5 wired eager eval into the runtime controller and validated at full GH Archive scale: 8.87M entries across 263 ticks, 902K entities, zero mismatches. Memory targets require Phase 3-7 deletions.

### Full Phases (post-POC)

| Phase | What | Layer | Risk | Impact | Status |
|-------|------|-------|------|--------|--------|
| 0 | Quick wins (previous bitvec, non-predicate columns) | Engine | None | -160 MB | **Done** (0f8aae8) |
| 1 | u128 entity identity | Engine + Runtime | Low | -40 MB | **Done** (a08dec2) |
| 2 | Eager clause eval (dual-write validation) | Engine | **High** | -220 MB | **Done** (5bd668e) |
| **2.5** | **Wire eval_property into runtime controller, dual-write at GH Archive scale** | **Runtime** | **High** | **Validates thesis** | **Done** (2a40ba2) |
| 3a | Remove batch recompute, eager-only clause eval | Engine | Low | Simpler tick(), code deletion | **Next** |
| 3b | Retraction store (SQLite behind trait) | Runtime | Medium | -523 MB peak | |
| 3c | Inline clause eval (no column lookup) + delete ColumnStore | Engine | Medium | -226 MB steady | Needs 3a |
| 3d | Ingest WAL for property deltas | Runtime | Medium | Crash recovery | |
| 4 | EntityStore + DataFusion cold path | Runtime + Data | Medium | Cold clause init | |
| 5 | Derived-property pipeline | Runtime | Low | RFC-005 prep | |
| 6 | DuckDB data backbone (feature flag) | Data | **High** | Replace adapters | |
| 7 | Output WAL + cleanup | All | Low | Code -63% | |

**Phase 2.5 result:** 8.87M eager eval entries validated across 263 ticks, 902K entities, 31 Parquet files — zero mismatches. Eager `eval_entity_clauses` is proven equivalent to batch recompute at full GH Archive scale.

**Phase 3 breakdown rationale:** The original Phase 3 bundled four distinct changes. Splitting them enables incremental validation:
- **3a** (low risk): Delete the batch recompute path from `tick()` — Phase 2.5 proved equivalence, so the old path is dead weight. This simplifies tick() to just CNF segment evaluation over bitvecs.
- **3b** (medium risk): Replace the in-memory `PreAggregator.retractions` BTreeMap with SQLite. This is the single biggest memory win (-523 MB peak at 902K entities). Behind a `RetractionStore` trait.
- **3c** (medium risk): Change `eval_property` to test incoming values directly against clause predicates instead of writing to ColumnStore first. Then delete ColumnStore (-226 MB steady). Requires 3a because the batch path currently reads from ColumnStore.
- **3d** (medium risk): Add an Ingest WAL for property deltas. Needed for crash recovery once ColumnStore is gone — without stored values, the WAL is the only way to replay and reconstruct bitvec state.

## 8. DST Strategy

- **Dual-write validation**: Phase 2 runs both v1 `tick()` and v2 `eval_property()`, compare bitvecs. Identical = correct.
- **Temporal sweep**: DST runs with `sweep_interval=0` for exact correctness. Separate integration tests for staleness bounds.
- **Cold clause init**: new DST scenario — register segment after entities exist, verify catch-up via eager eval.
- **Per-operation comparison** (not per-tick): reference model checks after each `eval_property()` call.
- **Crash recovery**: verify u128→u32 mapping restored correctly from checkpoint (INV-3).
- **Retraction completeness**: verify all temporal counters return to zero after all events expire (INV-5).

## 9. System Invariants

Defined in [docs/architecture/invariants.md](../../../meridian/docs/architecture/invariants.md):

| ID | Statement | Staleness Tolerance |
|----|-----------|-------------------|
| INV-1 | Bitvec ↔ truth consistency | None (exact) |
| INV-2 | Temporal counter ↔ event history | Bounded by sweep interval (by design) |
| INV-3 | Entity slot stability | None (exact) |
| INV-4 | Ingest WAL → entity store consistency | Bounded by compaction frequency |
| INV-5 | Retraction store completeness | None (exact) |
| INV-6 | Derived-property determinism | None (exact) |
| INV-7 | Segment membership = CNF(bitvecs) | Bounded by eval interval (by design) |

## 10. Open / Deferred

- **Derived-property pipeline details**: follow-up kinen session (trait design, 2-pass mechanics, engine state access)
- **System invariants deep dive**: follow-up kinen session (two-WAL interaction, marker-first ordering confirmation)
- **Storage format evaluation**: Parquet vs Iceberg vs DuckLake — needs hands-on comparison
- **DataFusion vs DuckDB for cold path**: validate in POC

---

*This document will be updated after each round with decisions and refined numbers.*
