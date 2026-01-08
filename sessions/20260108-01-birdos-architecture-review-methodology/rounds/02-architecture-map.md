# Round 02: Complete Architecture Map & Execution Plan

## Unified Architecture View

This document reconciles three sources:
1. **Original BirdOS Architecture Diagram** (the layered design)
2. **BIRD_INTELLIGENCE.md** (the vision)
3. **Production Nest Codebase** (what actually exists)

---

## Layer 1: Infrastructure

### Original Design
```
┌────────────────────────────────────────────────────────────────┐
│  Infra: Region │ Cellules │ Billing/Charging                  │
└────────────────────────────────────────────────────────────────┘
```

### Current Implementation

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Region** | AWS infrastructure | ✅ Deployed | Multi-region (US, EU, APAC) |
| **Cellules (Cells)** | `apps/llmchain/worker-go/cell/` | 🚧 POC | Not in production Nest |
| **Billing/Charging** | `apps/accounting` | ✅ Production | Has architectural issues (see analysis) |

### Key Findings

**Cells**: The vision describes cell-based isolation for multi-tenancy. Production Nest does NOT have cell architecture yet. The `worker-go` POC has cell primitives (`router.go`, `provisioner.go`, `sharded_router.go`) but these are not production.

**Billing**: The `accounting` service has fundamental TOCTOU issues and cross-system transaction problems documented in `review/nest/accounting-charging.md`. A TigerBeetle-based POC (`accounting-next`) addresses these but is incomplete.

---

## Layer 2: Core Services

### Data Plane

```
┌────────────────────────────────────────────────────────────────┐
│  Data Plane: Query Engine │ ETLs │ Catalog │ Tables │ Files   │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Query Engine** | `apps/insights` | ✅ Production | SQL analytics, StarRocks backend |
| **ETLs** | `apps/connectors/dataflows` | ✅ Production | Sophisticated plugin architecture |
| **Catalog** | `apps/entitylake` | ✅ Production | Schema registry |
| **Tables** | `apps/entitylake` | ✅ Production | Data lake abstraction |
| **Files** | S3 + `apps/entitylake` | ✅ Production | File storage |

**Assessment**: Data plane is mature. The DataFlows engine in `connectors` is sophisticated with 15+ sources, 15+ destinations, and robust plugin architecture.

### Runtime

```
┌────────────────────────────────────────────────────────────────┐
│  Runtime: Quotas │ Scheduler │ Channels │ Integrations │       │
│          DataFlows │ Workflow Engine                           │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Quotas** | `apps/accounting` (limits) | ✅ Production | Part of charging system |
| **Scheduler** | `apps/scheduler`, `apps/flows` | ✅ Production | Job scheduling, cron |
| **Channels (Delivery)** | `apps/channels` | ✅ Production | Multi-channel messaging |
| **Integrations** | `apps/connectors` | ✅ Production | 100+ connectors |
| **DataFlows** | `apps/connectors/dataflows` | ✅ Production | ETL engine |
| **Workflow Engine** | `apps/flows` | ✅ Production | ASL-inspired, 40+ step types |

**Assessment**: Runtime layer is mature and battle-tested. Flow engine has some architectural concerns (DynamoDB limits, synchronous execution) but handles millions of executions.

### Control Plane

```
┌────────────────────────────────────────────────────────────────┐
│  Control Plane: Workspace Resources │ IAM │ Directories & Tags │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Workspace Resources** | `apps/accounts`, `apps/business` | ✅ Production | Multi-tenant workspaces |
| **IAM** | `apps/accounts` | ✅ Production | Roles, permissions, policies |
| **Directories & Tags** | `apps/collaboration` (tags) | ✅ Production | Tag management |

**Assessment**: Mature IAM system. OpenFGA integration for Zanzibar-style permissions exists in POC (`worker-go/authz/openfga.go`) but production uses traditional RBAC.

### Ops Plane

```
┌────────────────────────────────────────────────────────────────┐
│  Ops Plane: Health Checks │ Audit Logs │ Journals │ Metrics    │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Health Checks** | Distributed | ✅ Production | Per-service health endpoints |
| **Audit Logs** | Embedded in services | ⚠️ Partial | No centralized audit service |
| **Journals/Changelogs** | SNS events | ⚠️ Partial | Event-based, not structured journal |
| **Metrics** | Datadog/CloudWatch | ✅ Production | Standard observability |

**Assessment**: Observability exists but is fragmented. No centralized audit trail or changelog system.

---

## Layer 3: Application Services

### Collaboration

```
┌────────────────────────────────────────────────────────────────┐
│  Collaboration: Tasks │ Teams │ Gamification │ Calendar │      │
│                Activity Streams │ Interactions                 │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Tasks** | `apps/collaboration` | ✅ Production | Root items, task management |
| **Teams** | `apps/collaboration` | ✅ Production | Team routing |
| **Gamification** | ❌ Not found | 🔲 Missing | Not implemented |
| **Calendar** | ❌ Not visible | 🔲 Unknown | May be in separate service |
| **Activity Streams** | `apps/collaboration` (feeds) | ✅ Production | Feed items |
| **Interactions** | `apps/collaboration` | ✅ Production | Comments, reviews, votes |

**Assessment**: Collaboration is well-implemented. Gamification from original design was never built.

### Communication

```
┌────────────────────────────────────────────────────────────────┐
│  Communication: Inbox │ Channels │ Notifications │              │
│                Campaigns/Broadcasts │ Conversations            │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Inbox** | `apps/collaboration` | ✅ Production | Agent inbox |
| **Channels** | `apps/channels` | ✅ Production | SMS, email, push, WhatsApp, etc. |
| **Notifications** | `apps/notifications` | ✅ Production | Notification delivery |
| **Campaigns/Broadcasts** | `apps/campaigns`, `apps/touchpoints` | ✅ Production | Marketing automation |
| **Conversations** | `apps/conversations` | ✅ Production | Messaging platform |

**Assessment**: Communication stack is comprehensive and production-hardened. Multi-channel delivery is a core strength.

### Application Domain

```
┌────────────────────────────────────────────────────────────────┐
│  Application Domain: Segments/Queries │ Schemas │ SoR │        │
│                       Automation/Workflows │ Semantic Events   │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Segments/Queries** | `apps/insights`, `apps/contacts` | ✅ Production | Real-time segmentation |
| **Schemas** | `apps/business` | ✅ Production | Custom object schemas |
| **System of Record** | `apps/contacts`, `apps/business` | ✅ Production | CDP |
| **Automation/Workflows** | `apps/flows` | ✅ Production | Journey builder |
| **Semantic Events** | `apps/connectors` (mrn events) | ✅ Production | MRN-based event naming |

**Assessment**: Strong foundation. The semantic event system with MRN naming is well-designed.

### Administration & Machinery

```
┌────────────────────────────────────────────────────────────────┐
│  Admin: Dashboards │ Connectors │ Workspace Configuration      │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **Dashboards** | Web apps + `apps/insights` | ✅ Production | Multiple dashboard UIs |
| **Connectors** | `apps/connectors` | ✅ Production | Template-based, marketplace-ready |
| **Workspace Config** | `apps/accounts`, `apps/business` | ✅ Production | Workspace settings |

---

## AI Layer (Vision Document Addition)

The BIRD_INTELLIGENCE vision introduces an AI layer not in the original diagram:

```
┌────────────────────────────────────────────────────────────────┐
│  AI Agent Layer: Router │ Classifier │ Department Agents       │
└────────────────────────────────────────────────────────────────┘
```

| Component | Production Service | Status | Notes |
|-----------|-------------------|--------|-------|
| **AI Router** | `apps/llmchain` | 🚧 POC | In llmchain codebase |
| **Classifier** | `apps/bots` + `apps/llmchain` | 🚧 Partial | Intent classification exists |
| **Department Agents** | `apps/llmchain` | 🚧 POC | Agent definitions |
| **Artifacts** | `apps/llmchain` (web) | 🚧 POC | Document/artifact generation |
| **Memory** | `packages/memory` (llmchain) | 🚧 POC | Session context |

**Assessment**: AI capabilities are nascent. The `llmchain` codebase has agent definitions and tool integrations, but it's not yet production-integrated.

---

## Gap Analysis Summary

### What's Missing from Original Design

| Component | Original Design | Status | Priority |
|-----------|----------------|--------|----------|
| **Gamification** | In diagram | Not built | Low |
| **Cell Architecture** | In diagram | POC only | High |
| **Centralized Audit** | Implied | Fragmented | Medium |
| **Structured Journals** | In diagram | Not built | Medium |

### What's Added Beyond Original Design

| Component | Source | Status | Notes |
|-----------|--------|--------|-------|
| **AI Agent System** | Vision doc | POC | Core differentiator |
| **Artifacts** | Vision doc | POC | Document generation |
| **OpenFGA** | Vision doc | POC | Zanzibar-style auth |
| **TigerBeetle** | accounting-next | POC | Financial ledger |

### What Has Architectural Issues

| Component | Issue | Severity | Documented |
|-----------|-------|----------|------------|
| **Accounting** | TOCTOU, cross-system atomicity | High | Yes |
| **Flows** | DynamoDB limits, sync execution | Medium | Yes |
| **Connectors** | Event publishing best-effort | Medium | Yes |
| **Events** | No transactional outbox | High | Partial |

---

## Execution Plan

### Phase 1: Requirements Extraction (Weeks 1-4)

Conduct deep-dive sessions for each component group. Each session produces:
- Functional requirements specification
- Operational requirements specification
- Scaling requirements specification
- Critical assessment (keep/fix/rebuild)

**Session Schedule:**

| Week | Group | Components | Owner |
|------|-------|-----------|-------|
| 1 | **A: Identity & Access** | `accounts`, `accounts-at-edge`, OpenFGA | TBD |
| 1 | **B: Communication** | `channels`, `notifications`, voice | TBD |
| 2 | **C: Customer Data** | `contacts`, `engagements`, `conversations` | TBD |
| 2 | **D: Workflow** | `flows`, `scheduler`, `campaigns` | TBD |
| 3 | **E: Integrations** | `connectors`, templates, webhooks | TBD |
| 3 | **F: Analytics** | `insights`, `entitylake`, `data-pipeline` | TBD |
| 4 | **G: Collaboration** | `collaboration`, `bots`, `conferences` | TBD |
| 4 | **H: Financial** | `accounting`, `payments` | TBD |

### Phase 2: Cross-Cutting Analysis (Week 5)

Analyze patterns that span components:
- Event sourcing and consistency
- Multi-tenancy patterns
- Cell architecture requirements
- API design standards
- Observability patterns

### Phase 3: Prioritization & Roadmap (Week 6)

Consolidate findings into:
1. **Critical fixes** - Production issues that need immediate attention
2. **Strategic rebuilds** - Components that warrant rebuilding from scratch
3. **Evolution path** - Incremental improvements to existing systems
4. **New capabilities** - Additions from vision (AI, cells, etc.)

---

## Component Deep Dive Template

For each session, use this template:

```markdown
# Component: [Name]

## 1. Current Implementation

### Services
- List of services involved
- Key entry points
- Data stores

### Architecture Diagram
[ASCII diagram or reference to existing doc]

### Scale Metrics
- Current throughput
- Data volumes
- Latency profiles

## 2. Functional Requirements

### Core Capabilities
1. [Capability 1]
   - Specification
   - Business rules
   - Edge cases

### Contracts & Interfaces
- API contracts
- Event schemas
- Data models

## 3. Operational Requirements

### Availability
- SLA targets
- Failover behavior
- Recovery procedures

### Performance
- Latency requirements
- Throughput requirements
- Resource constraints

### Monitoring
- Key metrics
- Alerting thresholds
- Dashboards

## 4. Scaling Requirements

### Current Scale
- Actual numbers from production
- Known bottlenecks
- Hot paths

### Multi-Tenancy
- Isolation requirements
- Noisy neighbor protections
- Fair scheduling

### Cell Compatibility
- Can this run in a cell?
- State locality requirements
- Cross-cell communication needs

## 5. Dependencies

### Upstream
- Services this depends on
- Data sources
- External APIs

### Downstream
- Services that depend on this
- Consumers
- Event subscribers

## 6. Assessment

### Strengths (Preserve)
- What works well
- Battle-tested patterns
- Customer dependencies

### Issues (Fix)
- Known problems
- Technical debt
- Performance bottlenecks

### Gaps (Add)
- Missing capabilities
- Vision requirements not implemented

### Unnecessary (Remove)
- Dead code
- Unused features
- Obsolete patterns

## 7. Recommendation

### Verdict
[ ] Keep as-is
[ ] Incremental refactor
[ ] Major refactor
[ ] Rebuild from scratch
[ ] Remove/deprecate

### Rationale
[One paragraph explanation]

### Effort Estimate
- Low (< 1 sprint)
- Medium (1-3 sprints)
- High (> 3 sprints)
```

---

## Next Steps

1. **Validate this map** with stakeholders
2. **Assign owners** to deep-dive sessions
3. **Set up session cadence** (suggest: 2 sessions per week)
4. **Create tracking board** for progress

---

*Round 2 complete. Ready to begin Phase 1 deep dives.*

