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

## Skill Decomposition

Rather than one massive skill, decompose into **focused, composable skills**:

### Skill 1: `workspace-discovery` (Existing - Enhance)

**Current State**: Discovers catalogs, models, schemas, statistics
**Enhancements Needed**:
- Add custom object/event detection
- Add page pattern analysis
- Output structured discovery report

### Skill 2: `saas-semantic-builder` (NEW - Main Skill)

```yaml
---
name: saas-semantic-builder
description: |
  Build a SaaS semantic layer on top of Bird data. Guides users through 
  discovering their data, mapping to SaaS concepts, identifying gaps, 
  and creating composable segments. Use when setting up a workspace for 
  SaaS use cases like lifecycle management, engagement tracking, or 
  churn prevention.
operations:
  - datahub.catalogs:listCatalogs
  - datahub.models:listModels
  - datahub.models:getModel
  - datahub.explorer:runQuery
  - data.audiences:listAudiences
  - data.audiences:getAudience
  - aitools.workflows:segmentBuilder
---
```

**Workflow Phases**:
1. Pre-Discovery (silent, uses `workspace-discovery`)
2. Business Context Validation (conversational)
3. Concept Mapping (match data to SaaS domains)
4. Gap Analysis (identify missing concepts)
5. Segment Generation (create building blocks)
6. Documentation (produce reports)

### Skill 3: `saas-segment-catalog` (NEW - Reference)

```yaml
---
name: saas-segment-catalog
description: |
  Reference catalog of standard SaaS segments. Defines lifecycle, engagement, 
  intent, and value segments with predicate templates. Use when building 
  audiences for SaaS campaigns or needing segment definitions.
---
```

**Purpose**: Pure reference skill — no workflow, just definitions that other skills use.

### Skill 4: `saas-gap-analyzer` (NEW - Focused)

```yaml
---
name: saas-gap-analyzer
description: |
  Analyze data gaps blocking SaaS capabilities. Given a use case like 
  "target churned enterprise customers", identifies exactly what data 
  is missing and how to fill it. Use when a segment can't be built 
  due to missing data.
---
```

---

## File Structure

```
plugins/datahub/
├── .claude-plugin/
│   └── plugin.json                          # Updated with new skills
│
├── skills/
│   ├── workspace-discovery/
│   │   ├── SKILL.md                         # Enhanced
│   │   └── references/
│   │       └── statistics-queries.md        # Existing
│   │
│   ├── saas-semantic-builder/               # NEW
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── phase-0-prediscovery.md
│   │       ├── phase-1-business-context.md
│   │       ├── phase-2-concept-mapping.md
│   │       ├── phase-3-gap-analysis.md
│   │       └── phase-4-segment-generation.md
│   │
│   ├── saas-segment-catalog/                # NEW
│   │   ├── SKILL.md
│   │   └── domains/
│   │       ├── lifecycle.md
│   │       ├── engagement.md
│   │       ├── intent.md
│   │       ├── value.md
│   │       ├── reachability.md
│   │       └── behavioral.md
│   │
│   └── saas-gap-analyzer/                   # NEW
│       ├── SKILL.md
│       └── references/
│           ├── common-gaps.md
│           └── resolution-playbooks.md
│
├── concepts/
│   ├── catalog-taxonomy.md                  # Existing
│   ├── field-statistics.md                  # Existing
│   ├── model-kinds.md                       # Existing
│   └── saas-semantic-layer.md               # NEW - Architecture overview
│
├── patterns/                                # NEW
│   ├── page-url-patterns.yaml               # Web behavior patterns
│   ├── custom-object-patterns.yaml          # Object semantic inference
│   └── custom-event-patterns.yaml           # Event semantic inference
│
├── task-guides/
│   ├── full-workspace-audit.md              # Existing
│   └── saas-onboarding-guide.md             # NEW
│
├── templates/                               # NEW - Output templates
│   ├── discovery-report.md
│   ├── gap-analysis-report.md
│   └── segment-catalog-output.md
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

## Next Steps

1. **Review this plan** - Any adjustments to structure or phasing?
2. **Start Phase 1** - Create foundation files
3. **Iterate** - Build skill by skill, test with real workspace

Ready to proceed?
