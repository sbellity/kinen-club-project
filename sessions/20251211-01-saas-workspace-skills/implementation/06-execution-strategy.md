# 06: Execution Strategy

## Development Approach: Iterative Vertical Slices

Build end-to-end functionality in thin slices, not horizontal layers. Each iteration produces a working session that can be tested with real users.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ITERATIVE DEVELOPMENT STRATEGY                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ITERATION 1: Minimal Viable Session                                        │
│  Pre-Discovery → Round 1 (Foundation) → Business Context Artifact           │
│  TEST: Can we run a session, show a round, get user response?              │
│                                                                             │
│  ITERATION 2: Data Landscape                                                │
│  + Phase 2 rounds → Data Inventory Artifact                                 │
│  TEST: Do we detect custom objects/events correctly?                        │
│                                                                             │
│  ITERATION 3: Concept Mapping                                               │
│  + Phase 3 rounds → Semantic Mapping Artifact                               │
│  TEST: Are threshold questions useful? Can user adjust?                     │
│                                                                             │
│  ITERATION 4: Gap Analysis                                                  │
│  + Phase 4 rounds → Gap Analysis Artifact                                   │
│  TEST: Are gaps identified correctly? Resolutions actionable?               │
│                                                                             │
│  ITERATION 5: Segment Creation                                              │
│  + Phase 5-6 rounds → Bundle (Audiences, Views)                             │
│  TEST: Are audiences created correctly in Bird?                             │
│                                                                             │
│  ITERATION 6: Documentation & Polish                                        │
│  + Knowledge Base articles → Full deployable bundle                         │
│  TEST: Is the semantic layer self-documenting?                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Iteration 1: Minimal Viable Session

**Duration**: 1 day  
**Goal**: Prove the end-to-end flow works

### What We Build

```
plugins/datahub/
├── agents/
│   └── saas-semantic-architect.md    ← Minimal, Phase 1 only
└── templates/
    └── session/
        └── phases/
            └── 01-foundation.md      ← First round template
```

### Agent Scope (Phase 1 Only)

```markdown
# Pre-Discovery
1. List catalogs
2. List models per catalog
3. Detect custom objects (custom-object.*)
4. Detect custom events (custom-event.*)
5. Get basic counts

# Round 1: Foundation
- Present findings summary
- Ask: Business model (B2B/B2C/PLG)
- Ask: Customer definition
- Ask: Priority use cases

# Output
- Create: artifacts/context/business-context.yaml
```

### Test Criteria

- [ ] Session starts, pre-discovery runs silently
- [ ] Round 1 appears in Q&A tab
- [ ] Questions render correctly (markdown)
- [ ] User can type response and submit
- [ ] Agent receives response
- [ ] Business context artifact is created
- [ ] Session can continue (ready for Phase 2)

### What We DON'T Build Yet

- Phase 2-6 logic
- Domain reference files
- Pattern YAML files
- Bundle generation
- Knowledge base articles
- DataHub views

---

## Iteration 2: Data Landscape

**Duration**: 1 day  
**Goal**: Deep dive into custom data with semantic inference

### What We Add

```
plugins/datahub/
├── agents/
│   └── saas-semantic-architect.md    ← Extended with Phase 2
├── patterns/
│   ├── custom-object-patterns.yaml   ← NEW
│   └── custom-event-patterns.yaml    ← NEW
└── templates/
    └── session/
        └── phases/
            ├── 01-foundation.md
            └── 02-data-landscape.md   ← NEW
```

### Pattern Files

```yaml
# patterns/custom-object-patterns.yaml
patterns:
  subscription:
    name_patterns: ["subscription", "plan", "license"]
    field_patterns: ["status", "plan", "mrr", "startDate"]
    saas_relevance: critical
    
  ticket:
    name_patterns: ["ticket", "support", "case"]
    field_patterns: ["status", "priority", "assignee"]
    saas_relevance: medium
```

### Test Criteria

- [ ] Custom objects detected and listed
- [ ] Semantic types inferred reasonably
- [ ] User can confirm/correct inferences
- [ ] Undocumented objects flagged
- [ ] Data inventory artifact created

---

## Iteration 3: Concept Mapping

**Duration**: 1 day  
**Goal**: Collaboratively define SaaS concepts with user-validated thresholds

### What We Add

```
plugins/datahub/
├── agents/
│   └── saas-semantic-architect.md    ← Extended with Phase 3
├── domains/                           ← NEW
│   ├── lifecycle.md
│   ├── engagement.md
│   ├── intent.md
│   └── value.md
└── templates/
    └── session/
        └── phases/
            └── 03-concept-mapping.md  ← NEW
```

### Test Criteria

- [ ] Each domain covered in rounds
- [ ] Thresholds proposed based on actual data
- [ ] User can adjust thresholds
- [ ] Rationale captured for each definition
- [ ] Semantic mapping artifact complete

---

## Iteration 4: Gap Analysis

**Duration**: 1 day  
**Goal**: Identify what's blocking and how to fix it

### What We Add

```
plugins/datahub/
├── agents/
│   └── saas-semantic-architect.md    ← Extended with Phase 4
└── templates/
    └── session/
        └── phases/
            └── 04-gap-analysis.md     ← NEW
```

### Test Criteria

- [ ] All blocked concepts identified
- [ ] Root causes correctly identified
- [ ] Resolution options are actionable
- [ ] User can prioritize gaps
- [ ] Gap analysis artifact useful

---

## Iteration 5: Segment Creation

**Duration**: 1-2 days  
**Goal**: Create actual Bird audiences

### What We Add

```
plugins/datahub/
├── agents/
│   └── saas-semantic-architect.md    ← Extended with Phase 5-6
└── templates/
    └── session/
        └── phases/
            ├── 05-segment-catalog.md  ← NEW
            └── 06-implementation.md   ← NEW
```

### Bundle Generation

```
bundle/
├── manifest.yaml
├── audiences/
│   ├── lifecycle/
│   └── engagement/
└── datahub/
    └── views/
```

### Test Criteria

- [ ] Segment catalog shows all segments
- [ ] User can review before creation
- [ ] Audiences created in Bird workspace
- [ ] Folder structure correct
- [ ] Bundle manifest accurate

---

## Iteration 6: Documentation & Polish

**Duration**: 1 day  
**Goal**: Self-documenting semantic layer

### What We Add

```
bundle/
└── knowledge-base/
    ├── manifest.yaml
    └── articles/
        ├── saas-semantic-layer-overview.md
        ├── segment-composition-guide.md
        └── ...
```

### Test Criteria

- [ ] Articles generated from session data
- [ ] Composition guide has real examples
- [ ] Data model docs match actual schema
- [ ] Articles published to Bird KB
- [ ] Users can find and understand docs

---

## Development Workflow Per Iteration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: DESIGN (30 min)                                                    │
│  - Review what this iteration adds                                          │
│  - Write/update agent instructions                                          │
│  - Define artifact schema                                                   │
│  - Write round template                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP 2: IMPLEMENT (1-2 hours)                                              │
│  - Add files to plugins/datahub/                                           │
│  - Update plugin.json if needed                                            │
│  - Test syntax/loading                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP 3: TEST ON REAL WORKSPACE (1 hour)                                    │
│  - Start session via llmchain UI                                           │
│  - Go through rounds as a user would                                       │
│  - Verify artifacts created correctly                                       │
│  - Check for errors in logs                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP 4: REFINE (30 min - 1 hour)                                           │
│  - Fix issues found in testing                                             │
│  - Improve question wording                                                │
│  - Adjust based on actual data                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP 5: COMMIT & DOCUMENT (15 min)                                         │
│  - Commit working iteration                                                │
│  - Note any learnings                                                      │
│  - Update this plan if needed                                              │
│  - Move to next iteration                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Timeline Summary

| Iteration | Focus | Duration | Deliverable |
|-----------|-------|----------|-------------|
| 1 | Minimal Viable Session | 1 day | Phase 1 working E2E |
| 2 | Data Landscape | 1 day | Custom object/event discovery |
| 3 | Concept Mapping | 1 day | Threshold definitions |
| 4 | Gap Analysis | 1 day | Blocker identification |
| 5 | Segment Creation | 1-2 days | Bird audiences created |
| 6 | Documentation | 1 day | KB articles published |

**Total**: ~6-7 days to full implementation

---

## Success Criteria (End of All Iterations)

- [ ] Complete session runs in ~30-60 minutes
- [ ] 12+ segments created as Bird audiences
- [ ] 5 KB articles published
- [ ] Gap analysis actionable
- [ ] Session artifacts comprehensive
- [ ] Bundle deployable without manual work
- [ ] User understands their semantic layer
