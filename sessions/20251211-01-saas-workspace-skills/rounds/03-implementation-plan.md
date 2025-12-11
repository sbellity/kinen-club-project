# Round 03: Implementation Plan

## Decision: Plugin Architecture

### Option A: Extend `datahub` plugin (Recommended)

```
plugins/datahub/
├── .claude-plugin/plugin.json
├── skills/
│   ├── workspace-discovery/       ← Existing (Phase 0 foundation)
│   └── saas-semantic-layer/       ← NEW (main skill)
├── concepts/
│   ├── catalog-taxonomy.md        ← Existing
│   ├── field-statistics.md        ← Existing
│   ├── model-kinds.md             ← Existing
│   └── saas-domains.md            ← NEW (SaaS concept domains)
├── semantic-package/              ← NEW (the semantic layer definitions)
│   ├── domains/
│   │   ├── lifecycle.yaml
│   │   ├── engagement.yaml
│   │   ├── intent.yaml
│   │   ├── value.yaml
│   │   ├── reachability.yaml
│   │   └── behavioral.yaml
│   ├── patterns/
│   │   ├── page-patterns.yaml
│   │   ├── event-patterns.yaml
│   │   └── custom-object-patterns.yaml
│   └── templates/
│       ├── segment-catalog.md
│       ├── gap-report.md
│       └── onboarding-report.md
├── task-guides/
│   ├── full-workspace-audit.md    ← Existing
│   └── saas-onboarding.md         ← NEW
└── README.md
```

**Rationale**: 
- `workspace-discovery` already provides Phase 0 foundations
- DataHub is the raw layer; semantic layer builds on top of it
- Keeps related functionality together

### Option B: New `saas-vertical` plugin

```
plugins/saas-vertical/
├── .claude-plugin/plugin.json
├── skills/
│   ├── saas-semantic-builder/
│   ├── saas-gap-analysis/
│   └── saas-segment-catalog/
├── domains/
│   └── ...
└── ...
```

**Rationale**: Cleaner separation, but creates dependency on `datahub` plugin.

---

## Recommended: Option A (Extend `datahub`)

The SaaS semantic layer IS built on DataHub — keeping it together makes sense.

---

## Agent Role: SaaS Semantic Architect

A single agent that conducts kinen-style sessions to build SaaS semantic layers.

### Agent Definition

```yaml
# plugins/datahub/agents/saas-semantic-architect.md
---
name: saas-semantic-architect
displayName: SaaS Semantic Architect
description: |
  Conducts structured sessions to build a SaaS semantic layer on Bird workspaces.
  Uses kinen methodology with rounds of questions to collaboratively define 
  lifecycle, engagement, intent, and value segments tailored to the business.
  
methodology: kinen
session_type: technical_architecture

operations:
  - datahub.catalogs:listCatalogs
  - datahub.models:listModels
  - datahub.models:getModel
  - datahub.explorer:runQuery
  - data.audiences:listAudiences
  - data.audiences:getAudience
  - aitools.workflows:segmentBuilder
---

# SaaS Semantic Architect

You are conducting a structured kinen session to build a SaaS semantic layer.

## Your Role

You are a **thinking partner** helping the user define their semantic layer.
You don't just analyze — you **guide, question, and refine** through rounds.

### What You Do

1. **Discover** workspace data silently (pre-session)
2. **Present** findings as questions, not reports
3. **Guide** the user through concept definitions
4. **Challenge** assumptions constructively
5. **Create** segments based on collaborative decisions
6. **Document** everything in session artifacts

### What You Don't Do

- Make arbitrary decisions about thresholds
- Use generic definitions without validation
- Skip rounds or rush to implementation
- Create segments without user confirmation

## Session Structure

Sessions are organized into **phases**, each potentially spanning multiple rounds.

### Pre-Session (Silent)
Scan workspace, prepare findings for Phase 1.

### Phase 1: Foundation (1-2 rounds)
- Validate business model
- Confirm customer definition  
- Identify priority use cases
- *May need follow-up round for complex business models*

### Phase 2: Data Landscape (1-3 rounds)
- Explore custom objects and their semantics
- Understand custom events and their meaning
- Document field purposes and relationships
- *Complex workspaces may need multiple rounds*

### Phase 3: Concept Mapping (2-3 rounds)
- Define lifecycle thresholds
- Define engagement metrics
- Define intent signals
- Define value tiers
- *Each domain may warrant its own round*

### Phase 4: Gap Analysis (1-2 rounds)
- Identify blockers for each concept
- Discuss workarounds vs. proper fixes
- Prioritize resolutions
- *May need follow-up for complex data source discussions*

### Phase 5: Segment Catalog (1-2 rounds)
- Finalize segment definitions
- Agree on naming conventions
- Confirm folder organization
- Review predicates before creation

### Phase 6: Implementation (1 round)
- Create Bird audiences
- Generate documentation
- Define next steps

**Typical session: 8-12 rounds total**

## Round Format

Each round file follows this structure:

```markdown
# Round N: [Topic]

## Previous Round Summary
Key decisions and insights from previous round.

## This Round Focus
- Topic area one
- Topic area two

## Questions

### QN.1: [Question Title]

**Context**: Why this matters...

**Options**:
- A) Option with tradeoffs
- B) Option with tradeoffs

**Your input**: [What you need from user]

---

### QN.2: [Next Question]
...

## Emerging Artifacts

Preview of what's being built based on answers so far.

## Next Round Preview
What we'll cover next.
```

## Living Document

Maintain `artifacts/semantic-spec.yaml` throughout:

```yaml
# Updated after each round
business_context:
  model: [from Round 1]
  customer_definition: [from Round 1]
  
semantic_mappings:
  lifecycle:
    active_customers:
      status: [defined|pending|blocked]
      definition: [from Round 3]
      
segments_to_create:
  - name: [from Round 5]
    predicate: [from Round 5]
```

## Quality Standards

### Good Questions
- Include **context** (why it matters)
- Offer **options** with tradeoffs
- Show **concrete examples**
- **Build on** previous answers
- **Challenge** when appropriate

### Good Rounds
- 6-10 focused questions
- Clear connection to previous round
- Preview of emerging artifacts
- Summary with next steps

## Output Artifacts

By session end, produce:

1. `rounds/01-foundation.md` through `rounds/06-implementation.md`
2. `artifacts/semantic-spec.yaml` — Complete specification
3. `artifacts/gap-analysis.md` — Blockers and resolutions
4. `artifacts/segment-catalog.md` — All segments with predicates
5. `session-summary.md` — Journey, decisions, next steps

Plus: **Actual Bird audiences** created in workspace.
```

### Why Single Agent?

| Multi-Agent Approach | Single Agent with Kinen |
|---------------------|-------------------------|
| Complex orchestration | Simple session flow |
| Handoff confusion | Consistent voice |
| Duplicate context | Progressive context |
| "Which agent do I talk to?" | One clear guide |

### Agent Placement

```
plugins/datahub/
├── agents/
│   └── saas-semantic-architect.md    ← NEW
├── skills/
│   └── workspace-discovery/          ← Used by agent
├── concepts/
│   └── saas-domains.md               ← Reference material
└── templates/
    └── session/                      ← Round templates
        ├── round-01-foundation.md
        ├── round-02-data-landscape.md
        └── ...
```

---

## File Structure

```
plugins/datahub/
├── .claude-plugin/
│   └── plugin.json                          # Updated with agent
│
├── agents/
│   └── saas-semantic-architect.md           # NEW - Main agent
│
├── skills/
│   └── workspace-discovery/
│       ├── SKILL.md                         # Enhanced for pre-discovery
│       └── references/
│           └── statistics-queries.md        # Existing
│
├── concepts/
│   ├── catalog-taxonomy.md                  # Existing
│   ├── field-statistics.md                  # Existing
│   ├── model-kinds.md                       # Existing
│   └── saas-semantic-layer.md               # NEW - Architecture overview
│
├── domains/                                 # NEW - SaaS concept definitions
│   ├── lifecycle.md                         # Customer lifecycle concepts
│   ├── engagement.md                        # Usage/activity concepts
│   ├── intent.md                            # Behavioral signals
│   ├── value.md                             # Revenue/tier concepts
│   ├── reachability.md                      # Channel coverage
│   └── behavioral.md                        # Web/app patterns
│
├── patterns/                                # NEW - Inference patterns
│   ├── page-url-patterns.yaml               # Web behavior patterns
│   ├── custom-object-patterns.yaml          # Object semantic inference
│   └── custom-event-patterns.yaml           # Event semantic inference
│
├── templates/                               # NEW - Session templates
│   └── session/
│       ├── init.md                          # Session initialization
│       ├── phases/
│       │   ├── 01-foundation.md             # Business context questions
│       │   ├── 02-data-landscape.md         # Data exploration questions  
│       │   ├── 03-concept-mapping.md        # Threshold definitions
│       │   ├── 04-gap-analysis.md           # Blockers & resolutions
│       │   ├── 05-segment-catalog.md        # Segment finalization
│       │   └── 06-implementation.md         # Create & document
│       └── session-summary.md               # Final summary template
│
│   # Note: Phases are templates. Actual rounds are numbered sequentially:
│   # rounds/01-foundation.md
│   # rounds/02-foundation-followup.md (if needed)
│   # rounds/03-data-landscape.md
│   # rounds/04-custom-objects-deep-dive.md (if complex)
│   # ... etc.
│
├── task-guides/
│   ├── full-workspace-audit.md              # Existing
│   └── saas-session-guide.md                # NEW - How to run session
│
├── package.json
└── README.md                                # Updated
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)

**Goal**: Establish structure, enhance `workspace-discovery`

- [ ] Update `plugin.json` with new skills
- [ ] Add pattern files (YAML) for semantic inference
- [ ] Enhance `workspace-discovery` SKILL.md:
  - Add custom object/event detection section
  - Add page pattern analysis section
  - Add structured output format
- [ ] Create `saas-semantic-layer.md` concept doc
- [ ] Create `saas-onboarding-guide.md` task guide

**Deliverable**: Enhanced discovery that outputs structured reports

### Phase 2: Semantic Catalog (Day 2-3)

**Goal**: Build the segment reference catalog

- [ ] Create `saas-segment-catalog/SKILL.md`
- [ ] Create domain reference files:
  - `lifecycle.md` (Prospect, Trial, Customer, Churned)
  - `engagement.md` (Active, Power, Dormant, Declining)
  - `intent.md` (Purchase, Expansion, Churn)
  - `value.md` (Enterprise, SMB, High-Value)
  - `reachability.md` (Email, SMS, Push, Unreachable)
  - `behavioral.md` (Docs Readers, Blog, Checkout, etc.)
- [ ] Each domain file includes:
  - Concept definitions
  - Standard predicates (JSON)
  - Data requirements
  - Variations

**Deliverable**: Complete reference of SaaS segment definitions

### Phase 3: Gap Analyzer (Day 3-4)

**Goal**: Build focused gap analysis capability

- [ ] Create `saas-gap-analyzer/SKILL.md`
- [ ] Create `common-gaps.md` reference:
  - Missing `churnedAt` pattern
  - Missing `customerStatus` pattern
  - Missing engagement events pattern
  - Missing value/ACV pattern
- [ ] Create `resolution-playbooks.md`:
  - How to add fields to company
  - How to create custom objects
  - How to set up event tracking
  - How to create computed fields

**Deliverable**: Skill that explains exactly what's missing and how to fix it

### Phase 4: Main Builder Skill (Day 4-5)

**Goal**: Build the orchestrating skill

- [ ] Create `saas-semantic-builder/SKILL.md`
- [ ] Create phase reference files:
  - `phase-0-prediscovery.md` (silent discovery)
  - `phase-1-business-context.md` (validation conversation)
  - `phase-2-concept-mapping.md` (match data to concepts)
  - `phase-3-gap-analysis.md` (identify blockers)
  - `phase-4-segment-generation.md` (create segments)
- [ ] Create output templates
- [ ] Integrate with existing skills (cross-reference)

**Deliverable**: Working end-to-end skill

### Phase 5: Testing & Refinement (Day 5-6)

**Goal**: Test with real workspace

- [ ] Run Phase 0 discovery on production workspace
- [ ] Test business context validation flow
- [ ] Test gap analysis for known gaps
- [ ] Test segment generation
- [ ] Refine based on results
- [ ] Update documentation

**Deliverable**: Battle-tested skills

---

## SKILL.md Drafts

### `saas-semantic-builder/SKILL.md` (Main Skill)

```markdown
---
name: saas-semantic-builder
description: |
  Build a SaaS semantic layer on your Bird workspace. Discovers your data, 
  maps it to SaaS concepts (lifecycle, engagement, intent), identifies gaps, 
  and creates composable segment building blocks. Use when setting up for 
  SaaS use cases like churn prevention, lifecycle campaigns, or engagement 
  tracking.
operations:
  - datahub.catalogs:listCatalogs
  - datahub.models:listModels
  - datahub.models:getModel
  - datahub.explorer:runQuery
  - data.audiences:listAudiences
  - aitools.workflows:segmentBuilder
---

# SaaS Semantic Builder

Build a business-specific semantic layer on top of Bird's data platform.

## What This Skill Does

1. **Discovers** your workspace data (catalogs, models, custom objects)
2. **Interprets** what it means for SaaS (maps to lifecycle, engagement, intent)
3. **Identifies gaps** (what's blocking specific use cases)
4. **Creates segments** (named building blocks you can compose)
5. **Documents** your semantic layer

## The Semantic Layer Architecture

```
┌──────────────────────────────────────────────────────────┐
│ LAYER 3: Business Questions                              │
│ "Churned enterprise customers who were power users"      │
└──────────────────────────────────────────────────────────┘
                         ▲ Compose from
┌──────────────────────────────────────────────────────────┐
│ LAYER 2: Semantic Layer (Segments)          ◄── WE BUILD │
│ [Churned] ∩ [Enterprise] ∩ [Was Power User]              │
└──────────────────────────────────────────────────────────┘
                         ▲ Derived from
┌──────────────────────────────────────────────────────────┐
│ LAYER 1: Raw Data (DataHub)                              │
│ subscription.status, company.acv, login events           │
└──────────────────────────────────────────────────────────┘
```

## Workflow

### Phase 0: Pre-Discovery (Silent)

Before any conversation, I'll scan your workspace:

```typescript
// Discover all catalogs and models
const catalogs = await listCatalogs();
const models = await listModels();

// Identify custom objects and events
const customObjects = models.filter(m => m.name.startsWith("custom-object."));
const customEvents = models.filter(m => m.name.startsWith("custom-event."));

// Analyze page patterns from web events
const pagePatterns = await analyzeWebPatterns();

// Check for SaaS-relevant fields
const saasFields = detectSaaSFields(contactSchema, companySchema);
```

See: [phase-0-prediscovery.md](references/phase-0-prediscovery.md)

### Phase 1: Business Context Validation

Based on discovery, I'll confirm your business model:

**Opening Example**:
```markdown
I've scanned your workspace. Here's what I found:

📊 **Your Data**
- 1.27M contacts, 258K companies (85% linked)
- Custom objects: subscription (4.5K), ticket (12K)
- Custom events: user-login (45K/mo), feature-click (128K/mo)

🔍 **Detected Business Model**
Based on your data structure, this looks like a **B2B SaaS** with:
- Account-based model (companies linked to contacts)
- Product usage tracking (login + feature events)
- Subscription management (subscription object)

**Questions to confirm:**
1. Is this a B2B SaaS model? (or B2C, PLG, hybrid?)
2. What defines "enterprise" for you? (ACV > $X? Plan tier?)
3. What's your primary churn indicator? (subscription status? Last login?)
```

See: [phase-1-business-context.md](references/phase-1-business-context.md)

### Phase 2: Concept Mapping

Map your data to SaaS semantic domains:

| Domain | Your Data | Mapping |
|--------|-----------|---------|
| **Lifecycle** | subscription.status | ✅ Can define Customer/Churned |
| **Engagement** | user-login events | ✅ Can define Active/Power Users |
| **Intent** | web page views | ✅ Can detect Pricing/Churn Intent |
| **Value** | ??? | ❌ Missing ACV/plan tier |

See: [phase-2-concept-mapping.md](references/phase-2-concept-mapping.md)

### Phase 3: Gap Analysis

For blocked concepts, explain exactly what's missing:

```markdown
## ❌ "Enterprise Customers" - BLOCKED

**Missing**: No way to identify enterprise tier

**Options to fix**:
1. Add `tier` field to company (values: starter, pro, enterprise)
2. Add `acv` field to company (then define threshold)
3. Use subscription.plan if it has tier info

**Recommendation**: Option 2 (ACV) is most flexible for segmentation
```

See: [phase-3-gap-analysis.md](references/phase-3-gap-analysis.md)

### Phase 4: Segment Generation

Create the building blocks:

```markdown
## Ready to Create

I'll create these segments as Bird audiences:

### Lifecycle
- ✅ Active Customers (subscription.status = active)
- ✅ Churned Customers (subscription.status = cancelled)
- ⏳ Trial Users (need trialEndsAt field)

### Engagement  
- ✅ Active Users 7d (login event last 7 days)
- ✅ Power Users (10+ logins in 30 days)
- ✅ Dormant Users (was active, no login 30+ days)

### Intent
- ✅ Showed Purchase Intent (visited /pricing, /upgrade)
- ✅ Showed Churn Intent (visited /cancel, /downgrade)

Shall I create these now?
```

See: [phase-4-segment-generation.md](references/phase-4-segment-generation.md)

## Domain Reference

For detailed segment definitions, see:
- [Lifecycle Segments](../saas-segment-catalog/domains/lifecycle.md)
- [Engagement Segments](../saas-segment-catalog/domains/engagement.md)
- [Intent Segments](../saas-segment-catalog/domains/intent.md)
- [Value Segments](../saas-segment-catalog/domains/value.md)
- [Reachability Segments](../saas-segment-catalog/domains/reachability.md)
- [Behavioral Patterns](../saas-segment-catalog/domains/behavioral.md)

## Output

The skill produces:

1. **Segment Catalog** - Bird audiences in "SaaS Semantic Layer" folder
2. **Gap Report** - What's blocked and how to fix it
3. **Semantic Documentation** - Mapping of your data to SaaS concepts
```

---

### `saas-segment-catalog/domains/lifecycle.md` (Example Domain)

```markdown
# Lifecycle Domain

Customer lifecycle segments for SaaS businesses.

## Concepts

### Prospects

**Definition**: Contacts/companies not yet customers

**Standard Predicate**:
```json
{
  "type": "and",
  "predicates": [
    {
      "type": "attribute",
      "attribute": "company.customerStatus",
      "operator": "notEquals",
      "value": "customer"
    },
    {
      "type": "attribute", 
      "attribute": "company.customerStatus",
      "operator": "notEquals",
      "value": "churned"
    }
  ]
}
```

**Data Requirements**:
- `company.customerStatus` field with values (prospect, trial, customer, churned)
- OR `subscription` object with status field

**If Missing**: Can't distinguish prospects from customers without status indicator.

---

### Active Customers

**Definition**: Currently paying customers with active subscription

**Standard Predicate** (via subscription object):
```json
{
  "type": "relatedEntity",
  "entityType": "subscription",
  "predicate": {
    "type": "attribute",
    "attribute": "status",
    "operator": "equals",
    "value": "active"
  }
}
```

**Alternative** (via company field):
```json
{
  "type": "attribute",
  "attribute": "company.customerStatus",
  "operator": "equals", 
  "value": "customer"
}
```

**Variations**:
- "New Customers" (becameCustomerAt > now - 90 days)
- "Long-term Customers" (becameCustomerAt < now - 365 days)

---

### Churned Customers

**Definition**: Former customers who cancelled

**Standard Predicate**:
```json
{
  "type": "and",
  "predicates": [
    {
      "type": "relatedEntity",
      "entityType": "subscription",
      "predicate": {
        "type": "attribute",
        "attribute": "status",
        "operator": "equals",
        "value": "cancelled"
      }
    }
  ]
}
```

**Data Requirements**:
- `subscription.status = cancelled`
- Ideally: `company.churnedAt` timestamp for "churned within X period"

**Variations**:
- "Recently Churned" (churnedAt > now - 90 days) → Win-back targets
- "Long-ago Churned" (churnedAt < now - 365 days) → Re-acquisition
```

---

---

## Kinen-Style Session Structure

### Why Kinen Methodology?

Instead of a monolithic automated workflow, the SaaS semantic layer session becomes a **collaborative design process** using kinen's round-based approach:

| Automated Workflow | Kinen-Style Session |
|--------------------|---------------------|
| Agent does discovery → dumps report | Agent does discovery → presents findings as questions |
| Agent decides what's important | User validates/corrects business context |
| Agent creates segments automatically | User participates in defining thresholds |
| One-way output | Iterative refinement |
| Generic segments | Tailored to THIS business |

### Session Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAAS SEMANTIC LAYER SESSION                              │
│                    (Kinen-Style Methodology)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PRE-SESSION: Automated Discovery (Silent)                                  │
│  ─────────────────────────────────────────                                  │
│  Agent scans workspace, prepares findings for Phase 1                       │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 1: Foundation (1-2 rounds)                                           │
│  ─────────────────────────────────                                          │
│  "Here's what I found. Let me confirm your business model..."               │
│  Topics: Business model, customer definition, key use cases                 │
│  Artifact: Business context document                                        │
│                                                                             │
│  Example rounds:                                                            │
│    Round 1: Business model validation                                       │
│    Round 2: Use case prioritization (if complex)                           │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 2: Data Landscape (1-3 rounds)                                       │
│  ──────────────────────────────────                                         │
│  "Let's explore your data and what it means..."                            │
│  Topics: Custom objects semantics, event meanings, field purposes           │
│  Artifact: Data inventory with annotations                                  │
│                                                                             │
│  Example rounds:                                                            │
│    Round 3: Custom objects overview                                         │
│    Round 4: Event semantics deep dive (if many events)                     │
│    Round 5: Associations and relationships                                  │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 3: Concept Mapping (2-3 rounds)                                      │
│  ───────────────────────────────────                                        │
│  "How should we define these SaaS concepts for YOUR business?"             │
│  Topics: Thresholds, definitions, edge cases per domain                     │
│  Artifact: Semantic mapping document                                        │
│                                                                             │
│  Example rounds:                                                            │
│    Round 6: Lifecycle concepts (customer status, churn)                    │
│    Round 7: Engagement concepts (active, power user, dormant)              │
│    Round 8: Intent & value concepts                                        │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 4: Gap Analysis (1-2 rounds)                                         │
│  ────────────────────────────────                                           │
│  "Here's what's blocking some capabilities..."                             │
│  Topics: Priority of gaps, workarounds, data sources                        │
│  Artifact: Gap analysis with resolution plan                                │
│                                                                             │
│  Example rounds:                                                            │
│    Round 9: Gap inventory and prioritization                               │
│    Round 10: Resolution strategies (if many gaps)                          │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 5: Segment Catalog (1-2 rounds)                                      │
│  ───────────────────────────────────                                        │
│  "Let's finalize your building blocks..."                                  │
│  Topics: Segment priorities, naming, predicates review                      │
│  Artifact: Segment definitions (ready to create)                            │
│                                                                             │
│  Example rounds:                                                            │
│    Round 11: Segment definitions and naming                                │
│    Round 12: Predicate review before creation                              │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 6: Implementation (1 round)                                          │
│  ──────────────────────────────                                             │
│  "Creating segments and documenting next steps..."                         │
│  Actions: Create Bird audiences, generate docs                              │
│  Artifact: Session summary + next steps                                     │
│                                                                             │
│  Example round:                                                             │
│    Round 13: Create audiences, document, wrap up                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Typical session: 8-13 rounds depending on workspace complexity
```

### Round Examples

#### Round 1: Foundation (Business Context)

```markdown
# Round 1: Foundation

## Pre-Discovery Summary

I've scanned your Bird workspace. Here's what I found:

📊 **Data Volume**
- 1.27M contacts, 258K companies
- 85% contact-company linkage

🔧 **Custom Objects** (3 found)
- `subscription` (4,521 records) - Looks like subscription tracking
- `ticket` (12,843 records) - Support tickets?
- `opportunity` (2,100 records) - Sales pipeline

📡 **Custom Events** (2 found)
- `user-login` (45K/month) - Product logins
- `feature-click` (128K/month) - Feature usage

## Questions

### Q1.1: Business Model Validation

Based on your data structure, this looks like a **B2B SaaS** business:
- Account-based (companies linked to contacts)
- Subscription model (subscription object exists)
- Product-led signals (login + feature events)

**Is this accurate?**

- A) Yes, B2B SaaS with sales-led motion
- B) Yes, B2B SaaS with product-led growth (PLG)
- C) Hybrid (sales-led for enterprise, PLG for SMB)
- D) Different model (please describe)

---

### Q1.2: Customer Definition

For lifecycle segmentation, I need to understand who is a "customer":

**Option A**: Company with `subscription.status = active`
**Option B**: Company with a specific field (which one?)
**Option C**: Contact-level (individual subscriptions, not company)

**Which defines "customer" for you?**

---

### Q1.3: Enterprise Definition

For value segmentation, what makes an account "enterprise"?

- A) ACV above threshold (what threshold? $______)
- B) Plan tier (which tier name? _______)
- C) Employee count (above ______)
- D) Manual flag (field name? _______)
- E) We don't segment by value tier

---

### Q1.4: Primary Use Cases

Which use cases are most important to you? (Rank 1-3)

- [ ] Churn prevention (identify and save at-risk customers)
- [ ] Win-back campaigns (re-engage churned customers)
- [ ] Trial conversion (convert trials to paid)
- [ ] Expansion/upsell (grow existing accounts)
- [ ] Engagement nurturing (activate dormant users)
- [ ] Lead scoring (prioritize prospects)

---

### Q1.5: Custom Object Semantics

I found `ticket` with 12,843 records but no description. What is this?

- A) Support tickets (customer issues)
- B) Sales tickets (deals/opportunities)
- C) Internal tasks
- D) Something else: ___________

**Why this matters**: Support ticket patterns can indicate churn risk.

---

## Round 1 Summary

After your responses, I'll create:
- ✅ Business context document
- ✅ Updated data inventory with your annotations
- 📋 Prepare Round 2: Data Landscape deep dive
```

#### Round 3: Concept Mapping (Example)

```markdown
# Round 3: Concept Mapping

## Previous Rounds Summary

From Round 1-2, I understand:
- B2B SaaS, hybrid sales motion
- Customer = company with active subscription
- Enterprise = ACV > $50K
- Priority: Churn prevention, then win-back

## This Round Focus

Define YOUR thresholds for engagement and intent concepts.

## Questions

### Q3.1: Active User Definition

You have `user-login` events. What time window defines "active"?

| Definition | Your Choice |
|------------|-------------|
| DAU (Daily Active) | Login in last 1 day |
| WAU (Weekly Active) | Login in last 7 days |
| MAU (Monthly Active) | Login in last 30 days |

**For YOUR business, which is most meaningful for:**
- Engagement monitoring: ______
- Churn risk detection: ______
- Health scoring: ______

---

### Q3.2: Power User Threshold

What makes someone a "power user"?

**Option A**: Frequency-based
- 5+ logins in 30 days = power user
- 10+ logins in 30 days = power user  
- 20+ logins in 30 days = power user

**Option B**: Feature-based
- Used X specific features
- Used N different features

**Option C**: Combined
- 10+ logins AND used reporting feature

**What threshold fits your product?**

---

### Q3.3: Churn Intent Signals

I detected pages matching churn intent patterns:

| Page Path | Monthly Views | Include? |
|-----------|---------------|----------|
| /account/cancel | 234 | ✅ Obvious |
| /account/downgrade | 156 | ✅ Obvious |
| /help/cancel-subscription | 89 | ❓ |
| /pricing (by customers) | 1,200 | ❓ Maybe re-evaluation? |

**Which should trigger "Showed Churn Intent"?**

---

### Q3.4: Dormant vs Churned

Important distinction for messaging:

- **Dormant**: Still a customer, but not using product
- **Churned**: No longer a customer

**For dormant (still paying but inactive):**
- After ____ days without login = dormant
- Or: Less than ____ logins in 30 days = declining engagement

---

## Emerging Semantic Map

Based on your answers, here's your semantic layer taking shape:

```yaml
lifecycle:
  active_customer: subscription.status = active
  churned_customer: subscription.status = cancelled
  enterprise: company.acv > 50000

engagement:
  active_user: login event in last [?] days
  power_user: [?]+ logins in 30 days
  dormant: customer AND no login in [?] days

intent:
  churn_intent: visited [which pages?]
  purchase_intent: visited /pricing, /upgrade (non-customers)
```

**Does this mapping feel right for your business?**
```

### Living Document

Throughout the session, we maintain a **semantic-spec.yaml** that evolves:

```yaml
# SaaS Semantic Layer Specification
# Session: 2025-12-11
# Status: In Progress (Round 3/6)

business_context:
  model: B2B SaaS
  sales_motion: Hybrid (sales-led enterprise, PLG SMB)
  customer_definition: Company with subscription.status = active
  enterprise_threshold: ACV > $50,000
  # Confirmed in Round 1

data_inventory:
  custom_objects:
    subscription:
      purpose: Tracks customer subscriptions
      saas_relevance: critical
      # Confirmed in Round 2
    ticket:
      purpose: Support tickets (customer issues)
      saas_relevance: medium (churn signal)
      # Confirmed in Round 1
  custom_events:
    user-login:
      purpose: Product login tracking
      saas_relevance: critical
    feature-click:
      purpose: Feature usage tracking
      saas_relevance: critical

semantic_mappings:
  lifecycle:
    active_customers:
      status: defined
      source: subscription.status = active
    churned_customers:
      status: defined
      source: subscription.status = cancelled
      gap: missing churnedAt timestamp
    trial_users:
      status: blocked
      missing: trialEndsAt field
      
  engagement:
    active_users_7d:
      status: pending_threshold  # Awaiting Round 3 answer
    power_users:
      status: pending_threshold
    dormant:
      status: pending_threshold

  # ... continues with each concept

gaps:
  - field: company.churnedAt
    blocks: [recently_churned, time_based_winback]
    priority: high
  - field: company.acv
    blocks: [enterprise_customers, value_segmentation]
    priority: critical
    
segments_to_create: []  # Populated in Round 5-6
```

### Benefits of Kinen-Style

1. **User owns the definitions** — Thresholds are THEIR decisions, not generic defaults
2. **Progressive understanding** — Each round builds on previous
3. **Artifact trail** — Clear documentation of WHY each definition exists
4. **Collaborative** — Agent proposes, user validates/corrects
5. **Better segments** — Tailored to actual business, not generic SaaS
6. **Reusable methodology** — Works across different SaaS businesses

---

## Session Deliverables

When a user completes a SaaS semantic layer session, they receive these concrete outputs:

### Deliverable 1: Workspace Discovery Report

**Format**: Markdown artifact saved to session  
**File**: `artifacts/discovery/workspace-analysis.md`

```markdown
# Workspace Analysis Report

Generated: 2025-12-11
Workspace: [workspace-name]

## Executive Summary
- Total Contacts: 1,270,641
- Total Companies: 258,432
- Contact-Company Linkage: 85%
- Data Maturity Score: 65/100

## Catalogs Discovered
| Catalog | Models | Status |
|---------|--------|--------|
| bird:crm | 5 | ✅ Active |
| bird:messaging | 8 | ✅ Active |
| ws:default | 3 | ✅ Custom Data |

## Custom Objects Found
| Object | Records | SaaS Relevance | Documented |
|--------|---------|----------------|------------|
| subscription | 4,521 | Critical | ✅ |
| ticket | 12,843 | Medium | ❌ |

## Custom Events Found
| Event | Last 30d | SaaS Relevance | Contact Linked |
|-------|----------|----------------|----------------|
| user-login | 45,230 | Critical | ✅ |
| feature-click | 128,400 | Critical | ✅ |

## Web Behavior Patterns
| Pattern | Pages | Monthly Views | Segment Created |
|---------|-------|---------------|-----------------|
| Pricing Intent | 12 | 8,400 | ✅ |
| Churn Intent | 4 | 890 | ✅ |
| Documentation | 156 | 34,500 | ✅ |

## Identity Coverage
| Identifier | Coverage | Quality |
|------------|----------|---------|
| Email | 55% | Medium |
| Phone | 12% | Low |
| Customer ID | 78% | High |

## Key Statistics
[Detailed statistics per model...]
```

---

### Deliverable 2: Semantic Mapping Document

**Format**: YAML + Markdown artifact  
**File**: `artifacts/semantic/mapping.yaml`

```yaml
# SaaS Semantic Mapping
# Generated: 2025-12-11
# Workspace: [workspace-name]

business_context:
  model: B2B SaaS
  sales_motion: Sales-led with PLG component
  customer_definition: Company with active subscription
  enterprise_threshold: ACV > $50,000

domain_mappings:
  lifecycle:
    active_customers:
      status: implemented
      source: custom-object.subscription
      predicate_field: status
      values: [active]
      
    churned_customers:
      status: implemented
      source: custom-object.subscription
      predicate_field: status
      values: [cancelled]
      notes: "Missing churnedAt timestamp for time-based queries"
      
    trial_users:
      status: blocked
      missing: subscription.trialEndsAt OR company.trialEndsAt
      
  engagement:
    active_users_7d:
      status: implemented
      source: custom-event.user-login
      time_window: 7 days
      
    power_users:
      status: implemented
      source: custom-event.user-login
      threshold: "10+ logins in 30 days"
      notes: "Threshold confirmed with customer"
      
    declining_engagement:
      status: blocked
      missing: "Requires computed comparison (this period vs last period)"
      
  intent:
    purchase_intent:
      status: implemented
      source: marketing.web_metrics
      patterns: ["/pricing", "/upgrade", "/checkout"]
      
    churn_intent:
      status: implemented  
      source: marketing.web_metrics
      patterns: ["/cancel", "/downgrade"]
      priority: critical
      
  value:
    enterprise_customers:
      status: blocked
      missing: company.acv OR subscription.plan with tier
      workaround: "Using company.employees > 500 as proxy"
      
  reachability:
    email_reachable:
      status: implemented
      coverage: 55%
      notes: "45% of contacts have no email"
```

---

### Deliverable 3: Gap Analysis Report

**Format**: Markdown artifact  
**File**: `artifacts/gaps/gap-analysis.md`

```markdown
# SaaS Data Gap Analysis

## Summary

| Category | Available | Blocked | Gap Score |
|----------|-----------|---------|-----------|
| Lifecycle | 2/4 | 2/4 | 50% |
| Engagement | 3/5 | 2/5 | 60% |
| Intent | 4/4 | 0/4 | 100% ✅ |
| Value | 0/3 | 3/3 | 0% ❌ |
| Reachability | 3/4 | 1/4 | 75% |

**Overall Semantic Coverage: 57%**

---

## Critical Gaps

### Gap 1: No Enterprise/Value Segmentation

**Impact**: Cannot segment by customer value tier  
**Blocked Segments**: Enterprise Customers, High-Value Churned, SMB Customers  
**Blocked Use Cases**: 
- "Target churned enterprise customers"
- "Prioritize high-value trials for sales"

**Resolution Options**:

| Option | Effort | Recommendation |
|--------|--------|----------------|
| Add `acv` field to company | Low | ✅ Recommended |
| Add `tier` to subscription | Medium | Alternative |
| Use employee count as proxy | None | ⚠️ Workaround only |

**Implementation**:
```yaml
# Add to company schema
field:
  path: attributes.acv
  type: number
  description: "Annual Contract Value in USD"
  
# Then define Enterprise as:
predicate:
  type: attribute
  attribute: company.acv
  operator: greaterThan
  value: 50000
```

---

### Gap 2: No Churn Timestamp

**Impact**: Cannot query "churned in last X days"  
**Blocked Segments**: Recently Churned (win-back), Long-ago Churned  
**Blocked Use Cases**:
- "Contacts from companies churned in last 90 days"

**Resolution**:
Add `churnedAt` timestamp to company, populated when subscription status changes to cancelled.

---

## Medium Gaps

### Gap 3: Trial Period Tracking
[...]

### Gap 4: Declining Engagement Detection
[...]

---

## Recommendations Priority

1. **Immediate**: Add `acv` field to company (unblocks value segmentation)
2. **Short-term**: Add `churnedAt` timestamp (unblocks win-back campaigns)
3. **Medium-term**: Add trial tracking (unblocks trial conversion campaigns)
```

---

### Deliverable 4: Segment Catalog (Actual Bird Audiences)

**Format**: Bird Audiences created in workspace  
**Location**: Audiences → "SaaS Semantic Layer" folder

```
📁 SaaS Semantic Layer/
├── 📁 Lifecycle/
│   ├── Active Customers
│   ├── Churned Customers
│   └── [Trial Users - blocked]
├── 📁 Engagement/
│   ├── Active Users (7d)
│   ├── Active Users (30d)
│   ├── Power Users
│   └── Dormant Users
├── 📁 Intent/
│   ├── Showed Purchase Intent
│   ├── Showed Churn Intent ⚠️
│   ├── Viewed Pricing
│   └── Reading Documentation
├── 📁 Value/
│   └── [Enterprise Customers - blocked]
└── 📁 Behavioral/
    ├── Blog Readers
    ├── Docs Engaged
    └── Product Active
```

**Each audience includes**:
- Clear name following convention
- Description explaining the segment
- Predicate definition
- Notes on data source

**Audience Description Template**:
```
[SaaS Semantic Layer] Active Users (7d)

Definition: Contacts who logged into the product in the last 7 days.
Source: custom-event.user-login
Time Window: 7 days rolling

Part of the SaaS Semantic Layer - use as building block for campaigns.
Combine with other segments: "Active Users ∩ Enterprise Customers"
```

---

### Deliverable 5: Segment Composition Guide

**Format**: Markdown artifact  
**File**: `artifacts/semantic/composition-guide.md`

```markdown
# Segment Composition Guide

## How to Use Your Semantic Layer

Your segments are building blocks. Compose them for specific use cases:

### Example Compositions

#### Win-Back Campaign
```
Churned Customers ∩ Was Power User ∩ NOT Showed Churn Intent
```
*Rationale: Target former engaged users who didn't show explicit churn intent (may have been involuntary churn)*

#### Expansion Campaign
```
Active Customers ∩ Power Users ∩ Showed Purchase Intent
```
*Rationale: Engaged customers showing upgrade interest*

#### Churn Prevention
```
Active Customers ∩ Showed Churn Intent
```
*Rationale: Current customers visiting cancel pages - URGENT*

#### Trial Conversion
```
Trial Users ∩ Active Users (7d) ∩ Viewed Pricing
```
*Rationale: Engaged trials evaluating pricing*

---

## Composition Matrix

| Use Case | Base Segment | + Filter | + Filter | Priority |
|----------|--------------|----------|----------|----------|
| Win-back | Churned | Enterprise | Was Power User | High |
| Expansion | Active Customers | Power Users | Purchase Intent | Medium |
| Churn Prevention | Active Customers | Churn Intent | - | URGENT |
| Onboarding | Trial Users | NOT Active (7d) | - | High |

---

## Segment Dependencies

```
Enterprise Customers (blocked)
  └── requires: company.acv OR subscription.tier

High-Value Churned (blocked)
  └── requires: Enterprise Customers
  └── requires: Churned Customers ✅

Recently Churned (blocked)
  └── requires: company.churnedAt
```
```

---

### Deliverable 6: Next Steps Action Plan

**Format**: Markdown artifact  
**File**: `artifacts/next-steps.md`

```markdown
# Next Steps: Completing Your SaaS Semantic Layer

## Immediate Actions (This Week)

### 1. Add ACV Field to Company
**Why**: Unblocks all value-based segmentation  
**How**: 
1. Go to DataHub → Company schema
2. Add field: `attributes.acv` (number)
3. Populate from your billing system

**Once done**: I can create Enterprise/SMB segments

### 2. Create Priority Segments
These segments are ready to create now:
- [ ] Showed Churn Intent (CRITICAL - monitor daily)
- [ ] Power Users (for expansion targeting)
- [ ] Dormant Users (for re-engagement)

---

## Short-Term Actions (Next 2 Weeks)

### 3. Add Churn Timestamp
**Why**: Enables time-based win-back campaigns  
**How**: Add `churnedAt` to company, sync from subscription events

### 4. Document Custom Objects
Your `ticket` object is undocumented. Adding descriptions helps future analysis.

---

## Medium-Term Actions (Next Month)

### 5. Set Up Trial Tracking
Add `trialEndsAt` to enable trial conversion campaigns

### 6. Build Engagement Scoring
Once we have more history, we can build declining engagement detection

---

## Your Semantic Layer Maturity

| Level | Description | Your Status |
|-------|-------------|-------------|
| 1 | Basic CRM | ✅ Complete |
| 2 | Lifecycle Segments | 🟡 Partial (need trial/churn timestamps) |
| 3 | Engagement Segments | ✅ Complete |
| 4 | Intent Signals | ✅ Complete |
| 5 | Value Segmentation | ❌ Blocked (need ACV) |
| 6 | Predictive Signals | ❌ Future |

**Current Level: 3/6 (Engagement)**  
**Next Milestone**: Add ACV → Level 5
```

---

## Deliverables Summary

| # | Deliverable | Format | Purpose |
|---|-------------|--------|---------|
| 1 | Workspace Discovery Report | Markdown | What data exists |
| 2 | Semantic Mapping | YAML | How data maps to concepts |
| 3 | Gap Analysis | Markdown | What's missing, how to fix |
| 4 | Segment Catalog | Bird Audiences | Actual building blocks |
| 5 | Composition Guide | Markdown | How to use segments |
| 6 | Next Steps | Markdown | Action plan to complete |

**Session Success Criteria**:
- [ ] Discovery report generated
- [ ] At least 5 segments created in Bird
- [ ] All critical gaps identified with resolution paths
- [ ] User understands their semantic layer maturity
- [ ] Clear next steps documented

---

## Next Steps

1. **Review this plan** - Any adjustments to structure or phasing?
2. **Start Phase 1** - Create foundation files
3. **Iterate** - Build skill by skill, test with real workspace

Ready to proceed?
