# Round 01: Foundation - Mapping BirdOS Architecture Review

## Context & Mission

We're at a pivotal moment. AI coding agents are becoming capable enough to tackle large-scale refactoring and development. The question is no longer "can we rebuild?" but "what should we rebuild, and to what specification?"

**The goal**: Extract requirements from years of product refinement in Nest, formulate them with excruciating detail, and create a solid foundation for the next phase of development.

**The approach**: First principles thinking + reverse engineering + critical analysis.

---

## What We Have

### 1. The Vision Document (BIRD_INTELLIGENCE.md)

A comprehensive vision for an AI-powered business operating system:

| Layer | Components |
|-------|------------|
| **User Interface** | Chat Interface, Artifacts, Command Menu |
| **AI Agent Layer** | Router, Classifier, Department Agents (Marketing, Sales, Finance, HR, Support) |
| **Intelligence Layer** | Identity, Flows, Segments, Analytics, Routing |
| **Platform Layer** | OpenFGA (Authorization), Ledger, Integrations, Observability |
| **Infrastructure** | Cells, Multi-Region, PostgreSQL + Redis + Kafka + StarRocks |

### 2. The Original Architecture Diagram (BirdOS_architecture.png)

Three-tier architecture:

**Application Services (Green/Yellow boxes)**
- **Collaboration**: Tasks, Teams, Gamification, Calendar, Activity Streams, Interactions
- **Communication**: Inbox, Channels, Notifications, Campaigns/Broadcasts, Conversations
- **Application Domain**: Segments/Queries, Schemas, System of Record, Automation/Workflows, Semantic Events
- **Administration**: Dashboards, Connectors, Workspace Configuration

**Core Services (Blue/Yellow boxes)**
- **Data Plane**: Query Engine, ETLs, Catalog, Tables, Files
- **Runtime**: Quotas, Scheduler, Channels (delivery), Integrations, DataFlows, Workflow Engine
- **Control Plane**: Workspace Resources, IAM, Directories & Tags
- **Ops Plane**: Health Checks, Audit Logs, Journals/Changelogs, Metrics

**Infrastructure (Blue boxes)**
- Region, Cells (Cellules), Billing/Charging

### 3. The Production Codebase (Nest)

~30+ services covering:

| Service | Domain |
|---------|--------|
| `accounting` | Double-entry ledger, charge metrics |
| `accounts` | Identity, authentication, authorization, roles |
| `accounts-at-edge` | Edge authentication (Lambda@Edge) |
| `bots` | Bot/agent system, Python ML components |
| `business` | Core business entities and logic |
| `campaigns` | Marketing campaigns |
| `channels` | Multi-channel delivery (SMS, voice, email, etc.) |
| `collaboration` | Tasks, teams, agents, feeds, SLAs, queues |
| `conferences` | Video/audio conferencing |
| `connectors` | External integrations (100+ connectors) |
| `connector-templates` | Integration templates |
| `contacts` | Contact management, CDP |
| `conversations` | Messaging/conversations |
| `data-pipeline` | Data ingestion and processing |
| `engagements` | Customer engagement tracking |
| `entitylake` | Data lake abstraction |
| `flows` | Workflow engine |
| `insights` | Analytics, reporting, SQL queries |
| `litequeue` | Lightweight queue |
| `llmchain` | AI/LLM integration |
| `migrations` | Data migrations |
| `notifications` | Notification delivery |
| `numbers` | Phone number management |
| `payments` | Payment processing |
| `reporting` | Reports generation |
| `scheduler` | Task scheduling |
| `search` | Search functionality |
| `sms` | SMS handling |
| `touchpoints` | Customer touchpoints |
| `voice`, `voice-infra` | Voice infrastructure |

Plus the `commonlib` package with shared libraries, protobufs, and schemas.

---

## The Gap Analysis Challenge

### What We Need to Reconcile

1. **Vision vs Reality**: Does the current codebase actually implement the vision?
2. **Original Design vs Evolution**: Has the system evolved away from the original architecture?
3. **Component Boundaries**: Are the service boundaries optimal or historically accidental?
4. **Requirements Capture**: What implicit requirements live in the code that aren't documented?

### What We're NOT Doing

- ~~Assuming LLMChain replaces production~~ (per existing review guidelines)
- ~~Theoretical performance concerns~~ (actual production behavior matters)
- ~~Over-engineering~~ (don't fix what isn't broken)
- ~~Starting from scratch without reason~~ (rebuild only with compelling evidence)

---

## Proposed Methodology

### Phase 1: Architecture Mapping (This Session)

Create a comprehensive map that reconciles:
- Original architecture diagram
- Vision document layers
- Current production services

**Deliverable**: Unified architecture map with clear component ownership

### Phase 2: Component Deep Dives (Breakout Sessions)

For each major component/subsystem:

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT ANALYSIS TEMPLATE                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. WHAT IT IS                                                  │
│     - Current implementation (which services?)                  │
│     - Role in the architecture                                  │
│     - Key interfaces/contracts                                  │
│                                                                 │
│  2. FUNCTIONAL REQUIREMENTS                                     │
│     - Core capabilities (what it must do)                       │
│     - Edge cases and constraints                                │
│     - Business rules embedded in code                           │
│                                                                 │
│  3. OPERATIONAL REQUIREMENTS                                    │
│     - Availability targets                                      │
│     - Latency expectations                                      │
│     - Error handling and recovery                               │
│     - Monitoring and alerting                                   │
│                                                                 │
│  4. SCALING REQUIREMENTS                                        │
│     - Current scale (actual numbers)                            │
│     - Known bottlenecks                                         │
│     - Multi-tenant considerations                               │
│     - Cell architecture compatibility                           │
│                                                                 │
│  5. DEPENDENCIES & INTERFACES                                   │
│     - Upstream dependencies                                     │
│     - Downstream consumers                                      │
│     - Data flows in/out                                         │
│                                                                 │
│  6. CRITICAL ASSESSMENT                                         │
│     - What works well (preserve)                                │
│     - What's problematic (fix)                                  │
│     - What's missing (add)                                      │
│     - What's unnecessary (remove)                               │
│                                                                 │
│  7. RECOMMENDATIONS                                             │
│     - Keep as-is / Refactor / Rebuild / Remove                  │
│     - Priority and effort estimate                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3: Cross-Cutting Concerns

Analyze patterns that span multiple components:
- Authentication & Authorization (OpenFGA)
- Event sourcing and CDC
- Multi-tenancy and cell architecture
- Observability and tracing
- API design and contracts

### Phase 4: Synthesis & Roadmap

Consolidate findings into:
- Prioritized list of architectural changes
- Dependencies between changes
- Effort estimates and sequencing

---

## Architecture Map: First Pass

### Mapping Original Diagram to Current Services

| Original Component | Layer | Current Service(s) | Notes |
|-------------------|-------|-------------------|-------|
| **Collaboration** | App Services | `collaboration`, `bots` | Tasks, teams, agents |
| Tasks | App Services | `collaboration` | Part of root_items |
| Teams | App Services | `collaboration` | Team routing |
| Calendar | App Services | ? | Need to investigate |
| Activity Streams | App Services | `collaboration` (feeds) | Feed items |
| **Communication** | App Services | `channels`, `conversations`, `notifications` | |
| Inbox | App Services | `collaboration` (inbox) | Agent inbox |
| Channels | App Services | `channels` | Multi-channel delivery |
| Campaigns/Broadcasts | App Services | `campaigns`, `touchpoints` | |
| Conversations | App Services | `conversations` | Messaging |
| **Application Domain** | App Services | `contacts`, `engagements`, `business` | |
| Segments/Queries | App Services | `insights`, `contacts` | |
| Schemas | App Services | `business` | Custom schemas |
| System of Record | App Services | `contacts`, `business` | CDP |
| Automation/Workflows | App Services | `flows` | Flow engine |
| **Administration** | App Services | `accounts`, web apps | |
| Dashboards | App Services | `insights`, web apps | |
| Connectors | App Services | `connectors`, `connector-templates` | |
| **Data Plane** | Core Services | `insights`, `entitylake`, `data-pipeline` | |
| Query Engine | Core Services | `insights` | SQL analytics |
| ETLs | Core Services | `data-pipeline` | |
| Catalog | Core Services | `entitylake` | Schema registry |
| Tables/Files | Core Services | `entitylake` | Data lake |
| **Runtime** | Core Services | `channels`, `scheduler`, `flows`, `connectors` | |
| Scheduler | Core Services | `scheduler`, `litequeue` | |
| Workflow Engine | Core Services | `flows` | Journey engine |
| **Control Plane** | Core Services | `accounts` | |
| IAM | Core Services | `accounts` | |
| **Ops Plane** | Core Services | Various | Distributed |
| **Infrastructure** | Infra | `accounting` (billing), AWS infra | |

---

## Proposed Component Groupings for Deep Dives

### Group A: Identity & Access (Foundation)
- `accounts` - Identity, authentication, roles
- `accounts-at-edge` - Edge auth
- OpenFGA integration

### Group B: Communication Infrastructure
- `channels` - Multi-channel delivery
- `notifications` - Notification engine
- `sms`, `voice`, `voice-infra` - Telephony

### Group C: Customer Data Platform
- `contacts` - Contact management
- `engagements` - Engagement tracking
- `conversations` - Messaging
- `business` - Business entities

### Group D: Workflow & Automation
- `flows` - Flow engine
- `scheduler` - Task scheduling
- `campaigns` - Campaign orchestration
- `touchpoints` - Journey touchpoints

### Group E: Integrations
- `connectors` - External integrations
- `connector-templates` - Templates
- Data capture / webhooks

### Group F: Analytics & Data
- `insights` - Analytics engine
- `data-pipeline` - ETL
- `entitylake` - Data lake
- `reporting` - Reports

### Group G: Collaboration
- `collaboration` - Tasks, teams, queues
- `bots` - Agent system
- `conferences` - Conferencing

### Group H: Financial Operations
- `accounting` - Ledger, charging
- `payments` - Payment processing

---

## Questions to Resolve

1. **What happened to Gamification?** (in original diagram, not visible in services)
2. **Where is the AI Agent Router?** (vision doc shows AI router, is it in `bots` or `llmchain`?)
3. **How complete is OpenFGA integration?** (vision mentions Zanzibar-style auth)
4. **What's the state of cell architecture?** (vision mentions cells, is it implemented?)
5. **Where are Artifacts?** (vision highlights artifacts, where's the code?)
6. **What's the Quotas system?** (in original diagram, which service owns it?)

---

## Next Steps

1. **Validate this mapping** with team members who know the codebase
2. **Prioritize component groups** for deep dives (likely A → D → E first)
3. **Set up breakout session template** for consistent analysis
4. **Begin Group A deep dive** - Identity & Access as foundation

---

## Session Artifacts

- [ ] Architecture map (this document)
- [ ] Component ownership matrix
- [ ] Deep dive schedule
- [ ] Questions backlog

---

*Round 1 complete. Ready for discussion and refinement.*

