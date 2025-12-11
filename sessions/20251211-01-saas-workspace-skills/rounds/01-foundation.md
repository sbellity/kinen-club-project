# Round 01: Foundation

## Problem Statement

Bird customers setting up workspaces for SaaS verticals need systematic guidance to:
1. **Discover** their data landscape across DataHub catalogs
2. **Audit** data quality and understand field semantics
3. **Map** relationships between entities and events
4. **Understand** what queries are possible vs. gaps
5. **Model** SaaS-specific customer lifecycle concepts
6. **Build** composable segment fragments for cohort analysis

Current state: Customers must manually explore DataHub APIs and understand Malloy patterns without domain-specific guidance for SaaS use cases.

## Solution Overview

Create a **SaaS Workspace Intelligence** plugin with two skill families:

### Family 1: Data Intelligence Skills

| Skill | Purpose |
|-------|---------|
| `saas-data-discovery` | Discover catalogs, models, fields across DataHub |
| `saas-data-audit` | Audit field quality: usage, cardinality, nullity, semantics |
| `saas-relationship-mapper` | Map associations between models, identify gaps |
| `saas-query-analyzer` | Analyze what queries are possible/blocked by schema |

### Family 2: SaaS Domain Skills

| Skill | Purpose |
|-------|---------|
| `saas-customer-lifecycle` | Define customer vs lead vs churned (accounts + individuals) |
| `saas-engagement-tracker` | Track active users, usage patterns, engagement signals |
| `saas-churn-detector` | Detect churn risk signals and triggers |
| `saas-segment-fragments` | Build composable, reusable segment building blocks |
| `saas-reachability-analyzer` | Analyze communication preferences and reachability |

## Architecture

```
plugins/
└── saas-intelligence/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── package.json
    ├── README.md
    ├── agents/
    │   ├── data-analyst.md          # Data discovery and audit agent
    │   └── saas-strategist.md       # SaaS domain expert agent
    ├── concepts/
    │   ├── saas-customer-lifecycle.md
    │   ├── subscription-models.md
    │   ├── churn-signals.md
    │   └── segment-fragments.md
    ├── skills/
    │   ├── saas-data-discovery/
    │   │   └── SKILL.md
    │   ├── saas-data-audit/
    │   │   ├── SKILL.md
    │   │   └── references/
    │   │       └── quality-metrics.md
    │   ├── saas-relationship-mapper/
    │   │   └── SKILL.md
    │   ├── saas-query-analyzer/
    │   │   └── SKILL.md
    │   ├── saas-customer-lifecycle/
    │   │   ├── SKILL.md
    │   │   └── templates/
    │   │       ├── customer-definition.md
    │   │       └── lifecycle-segments.yaml
    │   ├── saas-engagement-tracker/
    │   │   └── SKILL.md
    │   ├── saas-churn-detector/
    │   │   ├── SKILL.md
    │   │   └── references/
    │   │       └── churn-indicators.md
    │   ├── saas-segment-fragments/
    │   │   ├── SKILL.md
    │   │   └── templates/
    │   │       └── fragment-library.yaml
    │   └── saas-reachability-analyzer/
    │       └── SKILL.md
    └── task-guides/
        ├── workspace-onboarding.md
        ├── customer-definition-workflow.md
        └── cohort-analysis.md
```

## Key Design Decisions

### 1. Skill Decomposition Strategy

**Question**: Monolithic "SaaS workspace setup" skill vs. decomposed skills?

**Decision**: **Decomposed skills** that can be orchestrated.

**Reasoning**:
- Each skill is testable independently
- Skills can be reused in different workflows
- Easier to maintain and evolve
- Matches existing plugin patterns (bird-platform, bird-marketing)

### 2. Data Discovery Approach

**Question**: How to systematically audit data quality?

**Decision**: Define structured audit metrics per field type:

| Data Type | Metrics |
|-----------|---------|
| String | cardinality, null_rate, sample_values, pattern_detection |
| Number | min, max, mean, null_rate, distribution |
| Boolean | true_rate, null_rate |
| Date | min, max, null_rate, recency |
| Enum-like | value_distribution, unexpected_values |

**Implementation**: Use Malloy queries to compute metrics, then synthesize into audit report.

### 3. Customer Lifecycle Modeling

**Question**: How to represent SaaS customer states?

**Decision**: Define canonical states with composable predicates:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTACT LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   LEAD ──────► TRIAL ──────► CUSTOMER ──────► CHURNED          │
│     │            │              │                │              │
│     │            │              │                │              │
│     └────────────┴──────────────┴────────────────┘              │
│                         │                                       │
│                    RE-ENGAGED                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                    ENGAGEMENT OVERLAY
┌─────────────────────────────────────────────────────────────────┐
│ ACTIVE ◄──► AT-RISK ◄──► DORMANT                               │
│   │                                                             │
│   ├── Power User                                                │
│   ├── Regular User                                              │
│   └── Light User                                                │
└─────────────────────────────────────────────────────────────────┘

                    REACHABILITY LAYER
┌─────────────────────────────────────────────────────────────────┐
│ EMAIL: reachable | unsubscribed | bounced | missing            │
│ SMS:   reachable | opted_out | invalid | missing               │
│ PUSH:  enabled | disabled | missing                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Segment Fragment Philosophy

**Question**: How to make segments composable?

**Decision**: Define **fragment taxonomy** with combinable building blocks:

| Fragment Type | Example | Purpose |
|---------------|---------|---------|
| **Lifecycle** | `is_customer`, `was_customer` | Base state filters |
| **Temporal** | `in_last_30_days`, `inactive_90_days` | Time-based filters |
| **Engagement** | `has_logged_in`, `used_feature_X` | Behavior filters |
| **Channel** | `reachable_email`, `reachable_sms` | Reachability filters |
| **Value** | `high_value`, `at_risk` | Scoring filters |

**Composition**: Fragments combine with AND/OR to form cohorts:
```
SEGMENT: At-Risk High-Value Customers
  = is_customer 
  AND high_value 
  AND (inactive_30_days OR declining_usage)
  AND reachable_email
```

### 5. Account vs. Individual Perspective

**Question**: How to handle B2B (company) vs. B2C (individual) customer tracking?

**Decision**: Support **dual perspective** with explicit mapping:

| Perspective | Primary Entity | Key Fields |
|-------------|----------------|------------|
| **Account** | `crm.company` | subscription_status, mrr, plan_tier |
| **Individual** | `crm.contact` | role, last_login, feature_usage |
| **Link** | contact.companyId → company | Association |

**SaaS Specifics**:
- A **company** is a customer (has subscription)
- **Contacts** at that company may be users, admins, billing contacts
- Track both: "company is churning" vs. "user is disengaged"

### 6. Sales Pipeline Data Model (NEW)

**Data Sources Discovered**:
- `activities.activity` with targetType = "lead" (232k activities) or "opportunity" (78)
- `crm.contact.attributes.lead_stage` for funnel position
- Meeting data in `calendars.calendar_event` + `calendars.calendar_event_attendee`

**Sales Funnel Model**:

```
LEAD FUNNEL (on contact.lead_stage)
┌─────────────────────────────────────────────────────────────────┐
│  new (733) ──► enriched (33) ──► marketing-qualified (139)     │
│                     │                       │                   │
│                     ▼                       ▼                   │
│            suspicious (113)        marketing-rejected (411)     │
│                                            │                    │
│                                            ▼                    │
│                                    [Sales Handoff]              │
└─────────────────────────────────────────────────────────────────┘

OPPORTUNITY PIPELINE (via activities.activity)
┌─────────────────────────────────────────────────────────────────┐
│  Activities on opportunities: 78 total                         │
│  - created, updated, ownerChanged                              │
│                                                                 │
│  [Models not directly exposed - work through activities]       │
└─────────────────────────────────────────────────────────────────┘

MEETING TOUCHPOINTS (via calendars.*)
┌─────────────────────────────────────────────────────────────────┐
│  calendar_event: summary, startTime, endTime, organizer        │
│  calendar_event_attendee: attendeeId, email, status            │
│                                                                 │
│  [Access restricted - needs workspace permissions]             │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Invoicing & Revenue (Gap Analysis)

**Current State**: No invoice or payment models found in DataHub.

**Catalogs Exist But Empty/Inaccessible**:
- `bird:finance`
- `bird:payments`
- `bird:subscription`

**Recommendation**: For SaaS customers to track revenue:
1. Create custom objects: `subscription`, `invoice`, `payment`
2. Key fields needed:
   - `subscription.plan_name`, `subscription.mrr`, `subscription.status`
   - `invoice.amount`, `invoice.paid_at`, `invoice.due_date`
   - `payment.amount`, `payment.method`, `payment.status`
3. Associate to company for account-level revenue

### 8. Communication History (Reachability)

**Available Data**:
- **Subscription status**: 6 channels (Email, SMS, WhatsApp, Push, AppInbox, RCS)
- **Reachability by purpose**: Marketing vs. Transactional per channel
- **Engagement history**: messaging_metrics with open/click/bounce/unsubscribe rates
- **Email validation**: `email_validation_result` field

**Reachability Matrix**:

```
                    ┌──────────────┬──────────────┐
                    │  Marketing   │ Transactional│
┌───────────────────┼──────────────┼──────────────┤
│ Email             │ subscribed + │ reachable +  │
│                   │ reachable +  │ valid        │
│                   │ valid        │              │
├───────────────────┼──────────────┼──────────────┤
│ SMS               │ subscribed + │ reachable +  │
│                   │ reachable    │ valid phone  │
├───────────────────┼──────────────┼──────────────┤
│ WhatsApp          │ subscribed + │ reachable    │
│                   │ reachable    │              │
├───────────────────┼──────────────┼──────────────┤
│ Push              │ subscribed + │ token exists │
│                   │ token        │              │
└───────────────────┴──────────────┴──────────────┘
```

## Skill Specifications

### Skill 1: saas-data-discovery

**Purpose**: Systematically discover all data assets in a workspace.

**Workflow**:
1. List all catalogs (`datahub.catalogs:listCatalogs`)
2. For each catalog, list models by kind (object, event, cube)
3. Build catalog map with model metadata
4. Identify custom objects/events (ws:default catalog)
5. Generate discovery report

**Output Artifact**: `workspace-discovery-report.md`

### Skill 2: saas-data-audit

**Purpose**: Audit field quality and document semantics.

**Workflow**:
1. For priority models (crm.contact, crm.company, custom objects)
2. Get schema via `getModel`
3. Run audit queries per field (cardinality, nullity, samples)
4. Infer field semantics from names/values
5. Generate audit report with recommendations

**Output Artifact**: `data-quality-audit.md`

### Skill 3: saas-relationship-mapper

**Purpose**: Map existing associations and identify gaps.

**Workflow**:
1. Extract associations from model schemas
2. Build relationship graph
3. Identify missing useful associations:
   - Contact ↔ Subscription events
   - Company ↔ Revenue events
   - Contact ↔ Feature usage events
4. Recommend new associations

**Output Artifact**: `relationship-map.md`

### Skill 4: saas-query-analyzer

**Purpose**: Determine what queries are possible vs. blocked.

**Workflow**:
1. Parse Malloy schema constraints
2. Identify queryable dimensions/measures per model
3. Identify missing fields blocking common SaaS queries:
   - "Active users in last 30 days" - needs login events
   - "MRR by cohort" - needs subscription + revenue data
   - "Feature adoption" - needs feature usage events
4. Generate capability matrix

**Output Artifact**: `query-capabilities.md`

### Skill 5: saas-customer-lifecycle

**Purpose**: Define customer lifecycle states based on available data.

**Workflow**:
1. Analyze available subscription/purchase signals
2. Define customer identification rules
3. Build predicates for each lifecycle state
4. Create segment fragments

**Output**: Predicate templates for lifecycle segments

### Skill 6: saas-engagement-tracker

**Purpose**: Define engagement metrics and activity tracking.

**Workflow**:
1. Discover login/activity events
2. Define engagement scoring model
3. Create engagement tier predicates
4. Build usage pattern queries

### Skill 7: saas-churn-detector

**Purpose**: Identify churn signals and at-risk indicators.

**Workflow**:
1. Identify available churn signal events
2. Define churn criteria (subscription events, inactivity)
3. Build risk scoring predicates
4. Create early warning segments

### Skill 8: saas-segment-fragments

**Purpose**: Build library of composable segment building blocks.

**Workflow**:
1. Generate standard fragment predicates
2. Document composition rules
3. Create example composite segments
4. Export reusable fragment library

### Skill 9: saas-reachability-analyzer

**Purpose**: Analyze communication channel reachability.

**Workflow**:
1. Check subscription status per channel
2. Analyze deliverability history
3. Identify reachable vs. unreachable populations
4. Create reachability predicates

### Skill 10: saas-lead-pipeline (NEW)

**Purpose**: Analyze sales lead funnel from CRM activities and contact stages.

**Data Sources**:
- `crm.contact.attributes.lead_stage`
- `activities.activity` where targetType = 'lead'

**Workflow**:
1. Query lead_stage distribution on contacts
2. Analyze lead activities by action type (created, updated, ownerChanged)
3. Calculate conversion rates between stages
4. Identify bottlenecks and stale leads
5. Generate pipeline report

**Output Artifact**: `lead-pipeline-analysis.md`

### Skill 11: saas-meeting-intelligence (NEW)

**Purpose**: Analyze sales meetings and customer touchpoints.

**Data Sources**:
- `calendars.calendar_event`
- `calendars.calendar_event_attendee`

**Workflow**:
1. Query calendar events (requires permissions)
2. Match attendees to contacts via email
3. Analyze meeting frequency by account
4. Identify accounts with declining engagement
5. Generate meeting activity report

**Note**: Currently blocked by 403 permissions - skill should gracefully handle missing access.

### Skill 12: saas-data-gaps (NEW)

**Purpose**: Identify missing data for full SaaS lifecycle tracking.

**Workflow**:
1. Check for expected SaaS objects (subscription, invoice, payment)
2. Check for expected fields (mrr, contract_dates, churn_date)
3. Check for expected events (login, feature_usage)
4. Generate gap analysis with recommendations
5. Provide templates for missing objects/events

**Output Artifact**: `data-gap-analysis.md` with setup recommendations

### Skill 13: saas-identification-workflow (NEW - PRIORITY)

**Purpose**: Convert anonymous contacts to identified profiles.

**Problem Statement**: 80% of contacts (1M+) are anonymous web visitors with no email, phone, or profile data. This blocks all downstream SaaS lifecycle analysis.

**Available Signals for Anonymous Contacts**:
- `initialSource`: unknown (83%), import (9.5%), connectors (5.3%)
- Web tracking via `web_metrics` (561k events on app.bird.com + bird.com)
- `createdAt` for recency

**Identification Strategies**:

1. **Progressive Profiling**
   - Identify high-engagement anonymous visitors (web_metrics)
   - Target with personalized capture forms
   - Build segments: "anonymous + high web activity"

2. **Source-Based Prioritization**
   - Prioritize `connectors` source (5.3%) - likely from integrations
   - Prioritize `payments` source (1%) - transactional context
   - Deprioritize `unknown` source (83%)

3. **Recency Windows**
   - Focus on recent anonymous (last 30d): high intent
   - Archive old anonymous (>90d): low conversion potential

**Workflow**:
1. Segment anonymous contacts by source and recency
2. Cross-reference with web_metrics for engagement signals
3. Generate prioritized identification target list
4. Create capture campaign segments
5. Track conversion: anonymous → identified

**Output Artifact**: `identification-priority-segments.md`

**Predicates**:
```json
{
  "type": "and",
  "predicates": [
    { "type": "field", "field": "isAnonymous", "operator": "equals", "value": true },
    { "type": "field", "field": "createdAt", "operator": "greaterThan", "value": "now - 30 days" }
  ]
}
```

### Skill 14: saas-workspace-readiness (NEW)

**Purpose**: Score workspace readiness for SaaS lifecycle tracking.

**Readiness Dimensions**:

| Dimension | Weight | Metrics |
|-----------|--------|---------|
| **Contact Identification** | 30% | % identified, email coverage |
| **Customer Data** | 25% | % companies with customer flag |
| **Lead Funnel** | 20% | % contacts with lead_stage |
| **Engagement Data** | 15% | Messaging volume, web tracking |
| **Channel Coverage** | 10% | Multi-channel setup |

**Scoring Algorithm**:
```
identification_score = (identified_contacts / total_contacts) * 100
customer_score = (customers / total_companies) * 100
funnel_score = (staged_contacts / identified_contacts) * 100
engagement_score = min(100, messaging_events / contacts * 10)
channel_score = active_channels / 5 * 100

readiness = (0.30 * identification_score) + 
            (0.25 * customer_score) + 
            (0.20 * funnel_score) + 
            (0.15 * engagement_score) + 
            (0.10 * channel_score)
```

**Current Workspace Score** (estimate):
- Identification: 20% (251k/1.27M)
- Customer: 0.17% (427/258k)
- Funnel: 0.6% (1,429/251k identified)
- Engagement: 85% (1M messaging events)
- Channel: 20% (1/5 channels active)

**Estimated Readiness: ~25%** - Significant data gaps for SaaS lifecycle

**Workflow**:
1. Calculate each dimension score
2. Generate overall readiness percentage
3. Identify top 3 gaps blocking SaaS use cases
4. Provide prioritized recommendations
5. Create action plan artifact

**Output Artifact**: `workspace-readiness-report.md`

## Production Workspace Discovery Findings

> Based on live exploration of Bird production workspace - December 11, 2025
> Full statistics: `artifacts/discovery/workspace-statistics.md`

### Volume Statistics

| Model | Total | Last 30d | Last 7d | Last 24h | Growth |
|-------|-------|----------|---------|----------|--------|
| `crm.contact` | **1,270,675** | 739k (58%) | 85k (6.7%) | 14k | ~14k/day |
| `crm.company` | **258,158** | 3.2k (1.2%) | 795 (0.3%) | 112 | ~100/day |
| `activities.activity` | **232,960** | 4.2k (1.8%) | 1.1k | 162 | ~160/day |
| `messaging_metrics` | **1,076,047** | 88k (8%) | 24k (2.3%) | 5.3k | ~5k/day |
| `web_metrics` | **561,366** | 561k (100%) | 127k (23%) | 22k | ~22k/day |

**Temporal Range**: All data is within 8 months (April 2025 → December 2025)

### Critical Data Quality Issues

#### Contact Quality (1.27M contacts)

| Field | Set % | Null % | Assessment |
|-------|-------|--------|------------|
| **isAnonymous=true** | 80.2% | - | ❌ 1M anonymous contacts |
| emailaddress | **18.1%** | 81.9% | ❌ Very sparse |
| phonenumber | 1.3% | 98.7% | ❌ Almost empty |
| company | 1.3% | 98.7% | ❌ Almost empty |
| country | 0.7% | 99.3% | ❌ Almost empty |
| lead_stage | **0.11%** | 99.9% | ❌ Only 1,429 contacts |
| industry | 0.3% | 99.7% | ❌ Almost empty |

**Key Insight**: 80% of contacts are anonymous web visitors. Only 251k (20%) are identified.

#### Company Quality (258k companies)

| Field | Set % | Null % | Assessment |
|-------|-------|--------|------------|
| industry | 1.7% | 98.3% | ❌ Almost empty |
| country | 2.5% | 97.5% | ❌ Almost empty |
| accountManager | 3.5% | 96.5% | ❌ Almost empty |
| customerId | 1.9% | 98.1% | ❌ Almost empty |
| connectivityCustomer | 0.17% | 99.8% | ⚠️ Only 427 marked |

#### Lead Stage Distribution (1,429 total / 0.11%)

| Stage | Count | % of Staged |
|-------|-------|-------------|
| new | 733 | 51% |
| marketing-rejected | 411 | 29% |
| marketing-qualified | 139 | 10% |
| suspicious | 113 | 8% |
| enriched | 33 | 2% |

**Key Insight**: Lead qualification is barely used. Only 0.11% of contacts have a stage.

#### Customer Identification (427 companies / 0.17%)

| Segment | Count | Notes |
|---------|-------|-------|
| connectivityCustomer=true | 427 | Primary customer flag |
| Category: connectivity-p1 | 289 | P1 priority tier |
| Category: VIP | 46 | VIP tier |
| Category: connectivity-prio | 24 | Priority tier |

**Key Insight**: Very small identified customer base. Most company data is unqualified.

### Activity Breakdown

| Target Type | Count | % |
|-------------|-------|---|
| **lead** | 232,882 | 99.97% |
| opportunity | 78 | 0.03% |

| Action | Count | % |
|--------|-------|---|
| created | 170,189 | 73.1% |
| ownerChanged | 48,526 | 20.8% |
| updated | 11,060 | 4.7% |
| conversationCreated | 3,062 | 1.3% |
| called | 121 | 0.05% |

### Messaging Channel Distribution

| Platform | Count | % |
|----------|-------|---|
| **Email** | 1,022,737 | 95.0% |
| Unknown | 53,289 | 5.0% |
| WhatsApp | 21 | 0.002% |

**Key Insight**: Email is the only active channel. SMS/WhatsApp/Push barely used.

### Contact Source Distribution

| Source | Count | % |
|--------|-------|---|
| unknown | 1,053,057 | 82.9% |
| import | 121,078 | 9.5% |
| connectors | 67,920 | 5.3% |
| api | 13,122 | 1.0% |
| payments | 12,648 | 1.0% |

### Implications for SaaS Skills

Based on this data reality, the skills must handle:

1. **Data Sparsity**: Most fields are >95% null. Skills can't assume data exists.
2. **Anonymous Majority**: 80% of contacts have no profile. Identification is the first challenge.
3. **Lead Stage Gap**: Only 0.11% have lead_stage. Need alternative funnel signals.
4. **Customer ID Gap**: Only 427 companies marked as customers. Customer lifecycle skills limited.
5. **Single Channel**: Email is 95% of messaging. Omnichannel analysis not meaningful.

### Revised Skill Design

#### Data Intelligence Skills

| Skill | Primary Value | Data Reality |
|-------|---------------|--------------|
| `workspace-discovery` | ✅ **Already built in plugins/datahub** | Works well |
| `saas-data-audit` | Quality scoring + gap identification | High value given sparsity |
| `saas-relationship-mapper` | Association analysis | Models exist but data sparse |
| `saas-query-analyzer` | Capability matrix | Limited by data quality |

#### SaaS Domain Skills (Adjusted for Reality)

| Skill | Data Sources | Realistic Output |
|-------|--------------|------------------|
| `saas-customer-lifecycle` | company.connectivityCustomer (427 records) | Basic customer identification only |
| `saas-lead-pipeline` | contact.lead_stage (1,429 records) | Very limited funnel analysis |
| `saas-engagement-tracker` | messaging_metrics (1M+ records) | **Best signal available** |
| `saas-churn-detector` | Email engagement decline patterns | Email-only churn signals |
| `saas-segment-fragments` | contact attributes | Must handle sparse data |
| `saas-reachability-analyzer` | subscription fields | Email-focused (95% of volume) |
| `saas-identification-workflow` | **NEW** - Priority skill | Convert anonymous → identified |

## Open Questions (Updated)

### Resolved

1. ~~**Lead/Opportunity Access**~~: Activities target `lead` (232k) and `opportunity` (78). Models not directly exposed but activity data is rich.

2. ~~**Calendar Permissions**~~: 403 error confirmed. Workspace-level access control issue, not API limitation.

### Critical Design Questions

1. **Anonymous Majority Problem**: 80% of contacts are anonymous. Should skills:
   - Focus only on the 20% identified contacts?
   - Include identification workflows as a prerequisite?
   - Report metrics separately for anonymous vs. identified?

2. **Data Sparsity Handling**: Most fields are >95% null. Should skills:
   - Fail gracefully with "insufficient data" warnings?
   - Provide setup recommendations when data missing?
   - Calculate coverage % and require minimum thresholds?

3. **Lead Stage Reality**: Only 0.11% have lead_stage. Should skills:
   - Use activity patterns as proxy for funnel position?
   - Focus on contact acquisition recency instead?
   - Recommend lead qualification workflow implementation?

4. **Customer Definition**: Only 427 companies marked as customers (0.17%). Should skills:
   - Work with this tiny dataset?
   - Recommend customer tagging workflow first?
   - Use engagement signals as customer proxy?

5. **Single-Channel Reality**: 95% of messaging is email, WhatsApp=21. Should skills:
   - Skip omnichannel complexity?
   - Focus purely on email engagement?
   - Still provide framework for future channels?

### Strategic Questions

6. **Skill Sequencing**: Given data gaps, should we enforce skill dependencies?
   - `identification-workflow` must run before `customer-lifecycle`
   - `data-audit` must run before domain skills
   - Surface "readiness score" per skill?

7. **Workspace Maturity Tiers**: Should skills adapt behavior based on data maturity?
   - **Tier 1** (Sparse): Focus on data setup recommendations
   - **Tier 2** (Basic): Basic segments with limited fields
   - **Tier 3** (Rich): Full SaaS lifecycle capabilities

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| **Discovery skill moved to `plugins/datahub`** | Generic capability, not SaaS-specific |
| **Add identification workflow skill** | 80% anonymous is the primary blocker |
| **Email-first engagement** | 95% of messaging is email |
| **Activity-based funnel** | Lead_stage only 0.11% populated |
| **Warn on sparse data** | Don't fail silently when fields are 95%+ null |

## Revised Next Steps

1. **Round 02**: `saas-identification-workflow` skill
   - Progressive profiling strategies
   - Anonymous → identified conversion
   - Form capture patterns
   
2. **Round 03**: `saas-engagement-tracker` skill (best data available)
   - Email engagement metrics
   - Web activity patterns
   - Engagement scoring from messaging_metrics
   
3. **Round 04**: `saas-segment-fragments` with sparse-data handling
   - Fragments that check data availability
   - Fallback patterns for missing fields
   
4. **Round 05**: `saas-customer-lifecycle` for identified subset
   - Work with 427 identified customers
   - Expand as more companies get tagged

## Session Artifacts

- [x] `artifacts/discovery/workspace-statistics.md` - Comprehensive statistics
- [x] `artifacts/discovery/workspace-data-model.md` - Model inventory
- [ ] `artifacts/design/identification-workflow.md` - Anonymous → Identified
- [ ] `artifacts/design/engagement-scoring.md` - Email-based engagement model
- [ ] `artifacts/design/sparse-data-patterns.md` - Handling missing data

## Related Work

The discovery methodology has been documented as a reusable skill:

```
plugins/datahub/
├── skills/workspace-discovery/SKILL.md
├── concepts/catalog-taxonomy.md
├── concepts/model-kinds.md
├── concepts/field-statistics.md
└── task-guides/full-workspace-audit.md
```

This datahub plugin can be used by any vertical, not just SaaS.
