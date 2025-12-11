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

## Production Workspace Discovery Findings

> Based on live exploration of Bird production workspace - December 11, 2025

### Available Data Sources

| Source | Model | Records | SaaS Relevance |
|--------|-------|---------|----------------|
| **CRM Contacts** | `crm.contact` | 1.27M | Core individual data with lead_stage, subscriptions, reachability |
| **CRM Companies** | `crm.company` | 258k | Account data with customer flags, tiers, ownership |
| **Activities** | `activities.activity` | 233k | Lead (232k) and opportunity (78) actions tracked |
| **Messaging Metrics** | `marketing.messaging_metrics` | Aggregated | Email engagement for churn signals |
| **Web Metrics** | `marketing.web_metrics` | Aggregated | Product usage proxy |
| **Calendar Events** | `calendars.calendar_event` | - | Meeting tracking (restricted access) |
| **Attendees** | `calendars.calendar_event_attendee` | - | Meeting participation |

### Key SaaS-Relevant Fields Discovered

**On Contact**:
- `lead_stage`: new, marketing-qualified, marketing-rejected, suspicious, enriched
- `account_id`, `external_account_id`, `accountIds`: Account linking
- `product_of_interest`: Product interest tracking
- `ads_lead_score`: Lead scoring
- `subscribedEmail/Sms/WhatsApp/Push/Rcs`: Channel preferences
- `reachableIdentifiersFor*`: Per-channel reachability (marketing vs transactional)

**On Company**:
- `connectivityCustomer`: Boolean customer flag (427 true)
- `Category_Support`: Customer tier (VIP: 46, connectivity-prio: 24, connectivity-p1: 289)
- `accountManager`, `connectivity_am`: Ownership
- `customerId`: External customer ID

### Data Gaps Identified

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| Lead/Opportunity models not exposed | Can't query pipeline directly | Work through activities.activity |
| No subscription object | Can't track MRR/plans | Recommend creating custom object |
| No invoice data | Can't track revenue | Need integration |
| No login events | Can't detect active users | Need product events |
| Calendar access restricted | Can't analyze meetings | Need permissions |

### Revised Skill Design Based on Discovery

#### Data Intelligence Skills (Updated)

| Skill | Data Sources | Output |
|-------|--------------|--------|
| `saas-data-discovery` | All catalogs | Catalog inventory with SaaS classification |
| `saas-data-audit` | Priority models | Quality metrics + gap analysis |
| `saas-relationship-mapper` | Model associations | Relationship graph + missing links |
| `saas-query-analyzer` | Model schemas | Capability matrix |

#### SaaS Domain Skills (Updated based on available data)

| Skill | Data Sources | What's Possible Now |
|-------|--------------|---------------------|
| `saas-customer-lifecycle` | company.connectivityCustomer, company.Category_Support | Basic customer identification |
| `saas-lead-pipeline` | contact.lead_stage, activities (lead) | Lead funnel analysis |
| `saas-engagement-tracker` | messaging_metrics, web_metrics | Channel engagement (not product usage) |
| `saas-churn-detector` | messaging_metrics (declining engagement) | Email-based signals only |
| `saas-segment-fragments` | contact attributes | Composable predicates |
| `saas-reachability-analyzer` | contact.subscribed*, contact.reachableIdentifiersFor* | Full channel coverage |
| `saas-meeting-analyzer` | calendars.* (if accessible) | Sales meeting tracking |

## Open Questions

1. **Lead/Opportunity Access**: Activities reference lead and opportunity types but models aren't directly queryable. Should we build derived views from activity data?

2. **Customer Definition**: With only `connectivityCustomer` boolean, how do we handle:
   - Trial customers
   - Former customers (churned)
   - Different product lines

3. **Product Usage**: No login/feature events available. Should skills recommend event schema?

4. **Calendar Permissions**: Calendar queries return 403. Is this a workspace config or API limitation?

5. **Multi-tenant**: Should skills adapt to workspaces with different data maturity levels?

## Next Steps

1. **Round 02**: Detail `saas-data-discovery` skill implementation
2. **Round 03**: Detail `saas-customer-lifecycle` skill with predicate patterns
3. **Round 04**: Detail `saas-segment-fragments` composability design
4. **Round 05**: Integration and orchestration workflow

## Session Artifacts

- [ ] `artifacts/architecture/plugin-structure.md`
- [ ] `artifacts/design/skill-specs.md`
- [ ] `artifacts/design/lifecycle-model.md`
- [ ] `artifacts/design/fragment-taxonomy.md`
