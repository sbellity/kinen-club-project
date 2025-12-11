# 04: Session Filesystem Structure

## Session Directory Layout

```
sessions/<session-id>/
├── CLAUDE.md                           # Session instructions
├── brief.md                            # Initial user request
├── metadata.json                       # Session metadata
│
├── rounds/                             # Kinen rounds (Q&A)
│   ├── 01-foundation.md
│   ├── 02-data-landscape.md
│   ├── 03-custom-objects.md
│   ├── 04-lifecycle-mapping.md
│   ├── 05-engagement-mapping.md
│   ├── 06-gap-analysis.md
│   ├── 07-segment-definitions.md
│   └── 08-implementation.md
│
├── artifacts/                          # Working documents
│   ├── discovery/
│   │   ├── pre-discovery.yaml          # Silent scan results
│   │   └── data-inventory.yaml         # Documented data model
│   ├── context/
│   │   └── business-context.yaml       # Validated business model
│   ├── mapping/
│   │   └── semantic-mapping.yaml       # Concept definitions
│   ├── analysis/
│   │   └── gap-analysis.md             # Blockers and resolutions
│   └── catalog/
│       ├── segment-catalog.yaml        # Segment definitions
│       └── composition-guide.md        # How to use segments
│
├── bundle/                             # DEPLOYABLE OUTPUTS
│   ├── manifest.yaml                   # What to deploy
│   ├── audiences/                      # Audience definitions
│   │   ├── lifecycle/
│   │   │   ├── active-customers.json
│   │   │   └── churned-customers.json
│   │   ├── engagement/
│   │   │   ├── active-users-7d.json
│   │   │   ├── power-users.json
│   │   │   └── dormant-users.json
│   │   └── intent/
│   │       ├── churn-intent.json
│   │       └── purchase-intent.json
│   ├── datahub/                        # DataHub resources
│   │   ├── models/
│   │   │   └── computed-fields.yaml    # New computed fields
│   │   ├── associations/
│   │   │   └── new-associations.yaml   # New model associations
│   │   └── views/
│   │       └── saas-views.yaml         # DataHub views
│   ├── knowledge-base/                 # Documentation articles
│   │   ├── manifest.yaml               # Articles to publish
│   │   └── articles/
│   │       ├── saas-semantic-layer-overview.md
│   │       ├── segment-composition-guide.md
│   │       ├── lifecycle-segments-reference.md
│   │       ├── engagement-segments-reference.md
│   │       └── data-model-documentation.md
│   └── recommendations/                # Manual actions needed
│       ├── schema-changes.md           # Fields to add manually
│       └── data-sources.md             # Connectors to set up
│
└── session-summary.md                  # Final summary
```

---

## Artifact Purposes

### Discovery Artifacts

| Artifact | Created | Purpose |
|----------|---------|---------|
| `pre-discovery.yaml` | Pre-session | Initial workspace scan |
| `data-inventory.yaml` | Phase 2 | Documented data model |

### Context Artifacts

| Artifact | Created | Purpose |
|----------|---------|---------|
| `business-context.yaml` | Phase 1 | Validated business model |

### Mapping Artifacts

| Artifact | Created | Purpose |
|----------|---------|---------|
| `semantic-mapping.yaml` | Phase 3 | Concept definitions with thresholds |

### Analysis Artifacts

| Artifact | Created | Purpose |
|----------|---------|---------|
| `gap-analysis.md` | Phase 4 | Blockers and resolution plan |

### Catalog Artifacts

| Artifact | Created | Purpose |
|----------|---------|---------|
| `segment-catalog.yaml` | Phase 5 | Final segment definitions |
| `composition-guide.md` | Phase 5 | How to use segments |

---

## Rounds Naming Convention

Rounds are numbered sequentially but named descriptively:

```
rounds/
├── 01-foundation.md
├── 02-use-case-prioritization.md       # If complex business model
├── 03-custom-objects.md
├── 04-event-semantics.md               # If many events
├── 05-lifecycle-concepts.md
├── 06-engagement-thresholds.md
├── 07-intent-and-value.md
├── 08-gap-analysis.md
├── 09-segment-definitions.md
├── 10-predicate-review.md              # Before creation
└── 11-implementation.md
```

---

## Artifact Schemas

### YAML Artifacts

All YAML artifacts follow this pattern:

```yaml
# Header with timestamp and context
created_at: 2025-12-11T15:00:00Z
updated_at: 2025-12-11T16:30:00Z
phase: 1
round: 2

# Content specific to artifact type
...
```

### Markdown Artifacts

All markdown artifacts include:

```markdown
# [Title]

Generated: YYYY-MM-DD
Session: [session-id]

## Content
...

---
*Part of SaaS Semantic Layer Session*
```
