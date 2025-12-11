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
Each phase produces specific **deliverables** that feed into subsequent phases.

---

### Pre-Session (Silent)

**Purpose**: Automated workspace scan before first user interaction

**Agent Actions**:
- Scan all catalogs and models
- Detect custom objects and events
- Analyze web page patterns
- Gather volume statistics
- Identify SaaS-relevant fields

**Deliverable**: `artifacts/discovery/pre-discovery.yaml`

```yaml
# Pre-Discovery Report (internal, not shown to user directly)
scan_timestamp: 2025-12-11T14:30:00Z
workspace_id: ws_xxx

data_summary:
  contacts: 1270641
  companies: 258432
  contact_company_linkage: 85%

catalogs_found:
  - bird:crm
  - bird:messaging
  - ws:default

custom_objects:
  - name: subscription
    records: 4521
    inferred_type: subscription
    confidence: high
    has_documentation: true
  - name: ticket
    records: 12843
    inferred_type: support_ticket
    confidence: medium
    has_documentation: false

custom_events:
  - name: user-login
    monthly_volume: 45230
    has_contact_link: true
    inferred_type: login
  - name: feature-click
    monthly_volume: 128400
    has_contact_link: true
    inferred_type: feature_usage

web_patterns_detected:
  purchase_intent: ["/pricing", "/upgrade", "/checkout"]
  churn_intent: ["/cancel", "/downgrade"]
  documentation: ["/docs/*", "/help/*"]

saas_fields_found:
  on_contact: []
  on_company: ["connectivityCustomer"]

detected_business_model:
  type: B2B SaaS
  confidence: high
  signals:
    - company_contact_linkage > 80%
    - subscription_object_exists
    - login_events_tracked
```

---

### Phase 1: Foundation (1-2 rounds)

**Purpose**: Validate business context and establish session goals

**Topics**:
- Business model validation (B2B/B2C/PLG/hybrid)
- Customer definition (what makes someone a "customer")
- Enterprise/value tier definition
- Priority use cases (churn, win-back, expansion, etc.)

**Deliverable**: `artifacts/business-context.yaml`

```yaml
# Business Context (updated after Phase 1)
confirmed_at: 2025-12-11T15:00:00Z

business_model:
  type: B2B SaaS
  sales_motion: hybrid  # sales-led enterprise, PLG SMB
  validated: true

customer_definition:
  entity: company  # not contact
  source: subscription.status
  active_value: "active"
  notes: "A company is a customer if they have an active subscription"

enterprise_definition:
  method: acv_threshold  # or plan_tier, employee_count, manual
  threshold: 50000
  field: company.acv  # MISSING - flagged for gap analysis
  fallback: "company.employees > 500"

priority_use_cases:
  - id: churn_prevention
    priority: 1
    description: "Identify and save at-risk customers"
  - id: winback
    priority: 2
    description: "Re-engage churned customers"
  - id: expansion
    priority: 3
    description: "Upsell engaged customers"

custom_object_semantics:
  subscription: "Customer subscription records - tracks plan, status, MRR"
  ticket: "Support tickets - customer issues and requests"
```

---

### Phase 2: Data Landscape (1-3 rounds)

**Purpose**: Document all relevant data with business meaning

**Topics**:
- Custom object deep dive (fields, purposes, relationships)
- Custom event semantics (what triggers them, what they mean)
- Key field documentation
- Association mapping

**Deliverable**: `artifacts/data-inventory.yaml`

```yaml
# Data Inventory (updated after Phase 2)
documented_at: 2025-12-11T15:30:00Z

custom_objects:
  subscription:
    description: "Customer subscription records"
    record_count: 4521
    key_fields:
      - path: status
        type: string
        values: [active, cancelled, paused, trial]
        purpose: "Current subscription state"
      - path: plan
        type: string
        values: [starter, pro, enterprise]
        purpose: "Subscription tier"
      - path: mrr
        type: number
        purpose: "Monthly recurring revenue"
        coverage: 98%
      - path: startDate
        type: timestamp
        purpose: "When subscription began"
    associations:
      - to: crm.company
        via: companyId
        cardinality: many-to-one
    saas_relevance: critical
    
  ticket:
    description: "Support tickets for customer issues"
    record_count: 12843
    key_fields:
      - path: status
        values: [open, in_progress, resolved, closed]
      - path: priority
        values: [low, medium, high, urgent]
      - path: createdAt
        type: timestamp
    associations:
      - to: crm.contact
        via: contactId
    saas_relevance: medium
    notes: "High ticket volume may indicate churn risk"

custom_events:
  user-login:
    description: "Product login events"
    monthly_volume: 45230
    fields:
      - userId (links to contact)
      - timestamp
      - device
    saas_relevance: critical
    enables: [active_users, power_users, dormant_detection]
    
  feature-click:
    description: "Feature usage tracking"
    monthly_volume: 128400
    fields:
      - userId
      - featureName
      - timestamp
    saas_relevance: critical
    enables: [feature_adoption, engagement_scoring]

web_patterns:
  documented:
    - pattern: "/pricing/*"
      behavior: purchase_intent
      monthly_views: 8400
    - pattern: "/cancel"
      behavior: churn_intent
      monthly_views: 234
      priority: critical
  needs_classification:
    - pattern: "/workspace/*"
      pages: 234
      question: "Is this product usage or marketing site?"

associations_map:
  contact_to_company: defined (85% coverage)
  subscription_to_company: defined
  ticket_to_contact: defined
  login_to_contact: implicit (via userId)
```

---

### Phase 3: Concept Mapping (2-3 rounds)

**Purpose**: Define SaaS concepts with user-validated thresholds

**Topics**:
- Lifecycle concepts (active, churned, trial)
- Engagement concepts (active user, power user, dormant)
- Intent signals (purchase, churn, expansion)
- Value segmentation (enterprise, SMB)

**Deliverable**: `artifacts/semantic-mapping.yaml`

```yaml
# Semantic Mapping (updated after Phase 3)
defined_at: 2025-12-11T16:00:00Z

domains:
  lifecycle:
    active_customers:
      status: defined
      definition: "Company with subscription.status = active"
      predicate:
        type: relatedEntity
        entityType: subscription
        predicate:
          type: attribute
          attribute: status
          operator: equals
          value: active
          
    churned_customers:
      status: defined
      definition: "Company with subscription.status = cancelled"
      predicate:
        type: relatedEntity
        entityType: subscription
        predicate:
          type: attribute
          attribute: status
          operator: equals
          value: cancelled
      limitation: "Cannot filter by churn date (missing churnedAt)"
      
    trial_users:
      status: blocked
      missing: "subscription.trialEndsAt OR company.trialEndsAt"
      
  engagement:
    active_users_7d:
      status: defined
      definition: "Contact with user-login event in last 7 days"
      threshold: 7 days
      threshold_rationale: "User confirmed weekly active is meaningful"
      predicate:
        type: event
        eventType: custom-event.user-login
        timeWindow: { value: 7, unit: days }
        
    active_users_30d:
      status: defined
      definition: "Contact with user-login event in last 30 days"
      threshold: 30 days
      
    power_users:
      status: defined
      definition: "Contact with 10+ logins in last 30 days"
      threshold: 10 logins
      threshold_rationale: "User confirmed based on their product usage patterns"
      predicate:
        type: event
        eventType: custom-event.user-login
        aggregation: { function: count, operator: gte, value: 10 }
        timeWindow: { value: 30, unit: days }
        
    dormant_users:
      status: defined
      definition: "Customer contact with no login in 30+ days"
      threshold: 30 days
      predicate:
        type: and
        predicates:
          - { type: relatedEntity, entityType: subscription, ... }  # Is customer
          - { type: not, predicate: { type: event, eventType: user-login, timeWindow: 30d } }
          
  intent:
    purchase_intent:
      status: defined
      definition: "Visited pricing, upgrade, or checkout pages in last 14 days"
      pages: ["/pricing", "/upgrade", "/checkout", "/subscribe"]
      time_window: 14 days
      
    churn_intent:
      status: defined
      definition: "Visited cancel or downgrade pages in last 30 days"
      pages: ["/cancel", "/downgrade", "/close-account"]
      time_window: 30 days
      priority: critical
      
  value:
    enterprise_customers:
      status: blocked
      definition: "Company with ACV > $50,000"
      missing: "company.acv field"
      workaround: "Using company.employees > 500 as proxy"
      workaround_quality: low
```

---

### Phase 4: Gap Analysis (1-2 rounds)

**Purpose**: Identify blockers and plan resolutions

**Topics**:
- List all blocked concepts
- Discuss workarounds vs. proper fixes
- Map data sources for missing fields
- Prioritize resolution actions

**Deliverable**: `artifacts/gap-analysis.md`

```markdown
# Gap Analysis Report

Generated: 2025-12-11T16:30:00Z

## Summary

| Domain | Defined | Blocked | Coverage |
|--------|---------|---------|----------|
| Lifecycle | 2 | 1 | 67% |
| Engagement | 4 | 0 | 100% ✅ |
| Intent | 2 | 0 | 100% ✅ |
| Value | 0 | 2 | 0% ❌ |
| Reachability | 3 | 1 | 75% |

**Overall Semantic Coverage: 68%**

---

## Critical Gaps

### Gap 1: No Value Segmentation (Priority: HIGH)

**Blocked Concepts**: Enterprise Customers, SMB Customers, High-Value Churned
**Impact**: Cannot prioritize by customer value

**Root Cause**: Missing `acv` field on company

**Resolution Options**:
| Option | Effort | Data Source | Recommendation |
|--------|--------|-------------|----------------|
| Add company.acv | Low | Billing system | ✅ Recommended |
| Use subscription.plan tier | Medium | Already exists | Alternative |
| Use employee count proxy | None | Exists | ⚠️ Low quality |

**Resolution Plan**:
1. Export ACV from billing system (Stripe/Chargebee/etc.)
2. Add `acv` field to company schema
3. Set up sync or one-time import
4. Define threshold: ACV > $50,000 = Enterprise

---

### Gap 2: No Churn Timestamp (Priority: MEDIUM)

**Blocked Concepts**: Recently Churned, Churned in Period
**Impact**: Cannot do time-based win-back campaigns

**Root Cause**: Missing `churnedAt` timestamp

**Resolution Options**:
| Option | Effort | Recommendation |
|--------|--------|----------------|
| Add company.churnedAt | Medium | ✅ Recommended |
| Derive from subscription events | High | Complex |

---

## Gaps by Priority

| Priority | Gap | Blocked Segments | Resolution Effort |
|----------|-----|------------------|-------------------|
| HIGH | No ACV field | 3 segments | Low |
| MEDIUM | No churnedAt | 2 segments | Medium |
| LOW | No trial tracking | 1 segment | Medium |
```

---

### Phase 5: Segment Catalog (1-2 rounds)

**Purpose**: Finalize segment definitions before creation

**Topics**:
- Review all segment definitions
- Confirm naming conventions
- Agree on folder structure
- Final predicate review

**Deliverable**: `artifacts/segment-catalog.yaml`

```yaml
# Segment Catalog (ready for creation)
finalized_at: 2025-12-11T17:00:00Z

folder_structure:
  root: "SaaS Semantic Layer"
  subfolders:
    - Lifecycle
    - Engagement
    - Intent
    - Value
    - Behavioral

naming_convention: "[Domain] Segment Name"

segments_to_create:
  - name: "[Lifecycle] Active Customers"
    folder: Lifecycle
    description: |
      Companies with active subscriptions.
      Part of SaaS Semantic Layer - use as building block.
    predicate:
      type: relatedEntity
      entityType: subscription
      predicate:
        type: attribute
        attribute: status
        operator: equals
        value: active
    priority: 1
    
  - name: "[Lifecycle] Churned Customers"
    folder: Lifecycle
    description: |
      Companies with cancelled subscriptions.
      Part of SaaS Semantic Layer - combine with engagement segments for win-back.
    predicate: { ... }
    priority: 2
    
  - name: "[Engagement] Active Users (7d)"
    folder: Engagement
    description: |
      Contacts who logged in within last 7 days.
      Use for engagement monitoring and health scoring.
    predicate:
      type: event
      eventType: custom-event.user-login
      timeWindow: { value: 7, unit: days }
    priority: 3
    
  - name: "[Engagement] Power Users"
    folder: Engagement
    description: |
      Contacts with 10+ logins in last 30 days.
      High engagement - expansion and advocacy targets.
    predicate: { ... }
    priority: 4
    
  - name: "[Intent] Showed Churn Intent ⚠️"
    folder: Intent
    description: |
      CRITICAL: Contacts who visited cancel/downgrade pages.
      Monitor daily - immediate retention intervention needed.
    predicate: { ... }
    priority: 1  # Create first
    
  # ... all other segments

segments_blocked:
  - name: "[Value] Enterprise Customers"
    blocked_by: "Gap 1: No ACV field"
    create_when: "After ACV field is added"
    
  - name: "[Lifecycle] Recently Churned (90d)"
    blocked_by: "Gap 2: No churnedAt timestamp"
    create_when: "After churnedAt field is added"

total_segments:
  ready: 12
  blocked: 4
```

---

### Phase 6: Implementation (1 round)

**Purpose**: Create audiences and finalize documentation

**Actions**:
- Create Bird audiences from segment catalog
- Verify each audience was created successfully
- Generate final documentation
- Define next steps

**Deliverables**:

#### 1. Created Audiences (in Bird)

```
📁 SaaS Semantic Layer/
├── 📁 Lifecycle/
│   ├── ✅ [Lifecycle] Active Customers
│   └── ✅ [Lifecycle] Churned Customers
├── 📁 Engagement/
│   ├── ✅ [Engagement] Active Users (7d)
│   ├── ✅ [Engagement] Active Users (30d)
│   ├── ✅ [Engagement] Power Users
│   └── ✅ [Engagement] Dormant Users
├── 📁 Intent/
│   ├── ✅ [Intent] Showed Churn Intent ⚠️
│   ├── ✅ [Intent] Showed Purchase Intent
│   └── ✅ [Intent] Viewing Pricing
└── 📁 Behavioral/
    ├── ✅ [Behavioral] Documentation Readers
    └── ✅ [Behavioral] Blog Readers
```

#### 2. Session Summary: `session-summary.md`

```markdown
# SaaS Semantic Layer Session Summary

Session: 2025-12-11
Rounds Completed: 11
Duration: ~2 hours

## What We Built

Created **12 audience segments** as composable building blocks:
- 2 Lifecycle segments
- 4 Engagement segments  
- 3 Intent segments
- 3 Behavioral segments

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Customer = company with active subscription | Matches business model |
| Power user = 10+ logins/30d | Based on product usage patterns |
| Enterprise = ACV > $50K | Standard threshold for sales team |

## Semantic Coverage

| Domain | Coverage |
|--------|----------|
| Lifecycle | 67% (1 blocked) |
| Engagement | 100% ✅ |
| Intent | 100% ✅ |
| Value | 0% (needs ACV) |

## Composition Examples

| Use Case | Composition |
|----------|-------------|
| Churn Prevention | Active Customers ∩ Showed Churn Intent |
| Win-back | Churned Customers ∩ Was Power User |
| Expansion | Active Customers ∩ Power Users ∩ Purchase Intent |

## Next Steps

### Immediate (This Week)
1. ⚠️ Monitor "Showed Churn Intent" segment daily
2. Add ACV field to company (unblocks value segments)

### Short-term (2 Weeks)
3. Add churnedAt timestamp (unblocks time-based win-back)
4. Create first campaign using semantic layer

### Medium-term (1 Month)
5. Add trial tracking
6. Build engagement scoring model
```

#### 3. Composition Guide: `artifacts/composition-guide.md`

*(As defined in deliverables section)*

---

---

## Session Filesystem Structure

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

## Deployable Bundle Structure

The `bundle/` directory contains everything that can be deployed to the workspace.

### Bundle Manifest

```yaml
# bundle/manifest.yaml
version: "1.0"
session_id: "saas-semantic-layer-2025-12-11"
workspace_id: "ws_xxx"
generated_at: "2025-12-11T17:00:00Z"

deployment:
  audiences:
    total: 12
    by_folder:
      "SaaS Semantic Layer/Lifecycle": 2
      "SaaS Semantic Layer/Engagement": 4
      "SaaS Semantic Layer/Intent": 3
      "SaaS Semantic Layer/Behavioral": 3
      
  datahub:
    computed_fields: 2
    associations: 1
    views: 3
    
  manual_actions_required: 2

status:
  ready_to_deploy:
    - audiences (12)
    - datahub views (3)
  requires_manual_setup:
    - company.acv field
    - company.churnedAt field
```

### Audience Definitions

```json
// bundle/audiences/engagement/power-users.json
{
  "name": "[Engagement] Power Users",
  "folder": "SaaS Semantic Layer/Engagement",
  "description": "Contacts with 10+ logins in last 30 days.\nHigh engagement - expansion and advocacy targets.\n\nPart of SaaS Semantic Layer. Compose with other segments.",
  "entityType": "contact",
  "predicate": {
    "type": "event",
    "eventType": "custom-event.user-login",
    "aggregation": {
      "function": "count",
      "operator": "gte",
      "value": 10
    },
    "timeWindow": {
      "value": 30,
      "unit": "days"
    }
  },
  "metadata": {
    "semantic_layer": true,
    "domain": "engagement",
    "threshold_rationale": "Confirmed by user based on product usage patterns",
    "created_by_session": "saas-semantic-layer-2025-12-11"
  }
}
```

### DataHub Resources

#### Computed Fields

```yaml
# bundle/datahub/models/computed-fields.yaml
# New computed fields to add to existing models

computed_fields:
  - model: crm.company
    fields:
      - name: customerStatus
        type: string
        computation: |
          CASE 
            WHEN EXISTS(subscription WHERE status = 'active') THEN 'customer'
            WHEN EXISTS(subscription WHERE status = 'cancelled') THEN 'churned'
            WHEN EXISTS(subscription WHERE status = 'trial') THEN 'trial'
            ELSE 'prospect'
          END
        description: "Derived customer lifecycle status"
        
      - name: daysSinceLastLogin
        type: number
        computation: "DATEDIFF(NOW(), MAX(user_login.timestamp))"
        description: "Days since any contact at this company logged in"
        requires: "Association: company → contact → user-login events"

status: pending_manual_review
note: "Computed fields require DataHub admin to implement"
```

#### New Associations

```yaml
# bundle/datahub/associations/new-associations.yaml
# Recommended new associations between models

associations:
  - name: subscription_to_company
    from: custom-object.subscription
    to: crm.company
    via: companyId
    cardinality: many-to-one
    status: exists  # Already defined
    
  - name: login_events_to_contact
    from: custom-event.user-login
    to: crm.contact
    via: userId
    cardinality: many-to-one
    status: recommended
    rationale: "Enables engagement tracking per contact"
    
  - name: ticket_to_company
    from: custom-object.ticket
    to: crm.company
    via: contact.companyId  # Through contact
    cardinality: many-to-one
    status: recommended
    rationale: "Enables company-level support analysis"
```

#### DataHub Views

```yaml
# bundle/datahub/views/saas-views.yaml
# Pre-built views for common SaaS queries

views:
  - name: company_health_summary
    description: "Company health metrics for SaaS analysis"
    base_model: crm.company
    query: |
      select:
        name,
        attributes.customerStatus,
        subscription.plan,
        subscription.mrr,
        contact_count is contacts.count(),
        active_users_7d is contacts.count() { 
          where: EXISTS(user_login WHERE timestamp > now - 7 day) 
        },
        last_login is MAX(contacts.user_login.timestamp),
        open_tickets is tickets.count() { where: status = 'open' }
      where: subscription.status = 'active'
      order_by: mrr desc
    use_case: "Customer health dashboard"
    
  - name: engagement_trends
    description: "Weekly engagement trends by company"
    base_model: crm.company
    query: |
      group_by: 
        week is WEEK(user_login.timestamp)
      aggregate:
        companies_active is count(distinct companyId),
        total_logins is count(),
        avg_logins_per_company is count() / count(distinct companyId)
      order_by: week desc
      limit: 12
    use_case: "Engagement trend analysis"
    
  - name: churn_risk_signals
    description: "Companies showing churn risk signals"
    base_model: crm.company
    query: |
      select:
        name,
        subscription.mrr,
        days_since_login is DATEDIFF(NOW(), MAX(contacts.user_login.timestamp)),
        churn_page_visits is contacts.web_metrics.count() {
          where: pagePath ~ 'cancel|downgrade'
        },
        open_tickets is tickets.count() { where: status = 'open' }
      where: 
        subscription.status = 'active'
        AND (days_since_login > 14 OR churn_page_visits > 0 OR open_tickets > 2)
      order_by: mrr desc
    use_case: "Proactive churn prevention"
```

### Knowledge Base Articles

```yaml
# bundle/knowledge-base/manifest.yaml
# Documentation articles to publish to workspace knowledge base

articles:
  - id: saas-semantic-layer-overview
    folder: "SaaS Semantic Layer"
    title: "SaaS Semantic Layer Overview"
    status: active
    tags: [semantic-layer, saas, segments, guide]
    
  - id: segment-composition-guide
    folder: "SaaS Semantic Layer"
    title: "How to Compose Segments"
    status: active
    tags: [segments, composition, campaigns]
    
  - id: lifecycle-segments-reference
    folder: "SaaS Semantic Layer/Reference"
    title: "Lifecycle Segments Reference"
    status: active
    tags: [lifecycle, customer-status, churn]
    
  - id: engagement-segments-reference
    folder: "SaaS Semantic Layer/Reference"
    title: "Engagement Segments Reference"
    status: active
    tags: [engagement, active-users, power-users]
    
  - id: data-model-documentation
    folder: "SaaS Semantic Layer/Reference"
    title: "Data Model Documentation"
    status: active
    tags: [data-model, custom-objects, events]
```

#### Overview Article

```markdown
// bundle/knowledge-base/articles/saas-semantic-layer-overview.md

# SaaS Semantic Layer Overview

This workspace has a **SaaS Semantic Layer** — a set of pre-built audience 
segments that encode SaaS business concepts. Use these as building blocks 
for campaigns instead of creating complex queries from scratch.

## What's Included

| Domain | Segments | Purpose |
|--------|----------|---------|
| **Lifecycle** | Active Customers, Churned Customers | Who are your customers? |
| **Engagement** | Active Users, Power Users, Dormant | How engaged are they? |
| **Intent** | Purchase Intent, Churn Intent | What are they thinking? |
| **Behavioral** | Docs Readers, Blog Readers | What content do they consume? |

## How to Use

### Simple: Use Segments Directly

Each segment is ready to use as a campaign audience:
- **Win-back campaign** → Use "Churned Customers" segment
- **Engagement nurture** → Use "Dormant Users" segment

### Advanced: Compose Segments

Combine segments using AND/OR for precise targeting:

| Use Case | Composition |
|----------|-------------|
| Churn Prevention | `Active Customers` AND `Showed Churn Intent` |
| High-Value Win-back | `Churned Customers` AND `Was Power User` |
| Expansion | `Active Customers` AND `Power Users` AND `Purchase Intent` |

## Segment Locations

All segments are in: **Audiences → SaaS Semantic Layer/**

```
SaaS Semantic Layer/
├── Lifecycle/
├── Engagement/
├── Intent/
└── Behavioral/
```

## Questions?

- See: [Segment Composition Guide](#)
- See: [Data Model Documentation](#)
- Contact: [your-team]

---
*Generated by SaaS Semantic Layer Session on 2025-12-11*
```

#### Composition Guide Article

```markdown
// bundle/knowledge-base/articles/segment-composition-guide.md

# How to Compose Segments

The SaaS Semantic Layer provides **building blocks** — simple segments 
that you combine into powerful, targeted audiences.

## Composition Basics

### AND (Intersection)
Both conditions must be true.

```
Active Customers AND Showed Churn Intent
= Customers who visited cancel/downgrade pages
```

### OR (Union)
Either condition is true.

```
Active Users (7d) OR Showed Purchase Intent
= Anyone engaged recently OR showing buying signals
```

### NOT (Exclusion)
Exclude a group.

```
Churned Customers AND NOT (Showed Churn Intent)
= Churned customers who didn't visit cancel page
  (possible involuntary churn — payment failed?)
```

## Recipe Book

### 🔥 Churn Prevention

**Goal**: Save at-risk customers before they leave

```
Active Customers 
AND Showed Churn Intent
```

**Action**: Immediate outreach, offer help or discount

---

### 🎯 High-Value Win-Back

**Goal**: Re-engage churned customers worth pursuing

```
Churned Customers
AND Was Power User (before churn)
AND NOT (Recently Contacted)
```

**Action**: Personalized win-back with "we miss you" message

---

### 📈 Expansion Targets

**Goal**: Upsell engaged customers

```
Active Customers
AND Power Users
AND Showed Purchase Intent
```

**Action**: Sales outreach or upgrade campaign

---

### 😴 Re-Engagement

**Goal**: Wake up dormant users

```
Active Customers (subscription active)
AND Dormant Users (no login 30+ days)
```

**Action**: "Haven't seen you in a while" email

---

### 🆕 Trial Conversion

**Goal**: Convert trials to paid

```
Trial Users
AND Active Users (7d)
AND Viewed Pricing
```

**Action**: Conversion nudge with social proof

---

## Tips

1. **Start simple** — One segment often works
2. **Add constraints gradually** — Don't over-filter
3. **Check sizes** — Ensure audience is large enough
4. **Test compositions** — Preview before sending

## Available Segments

| Segment | Domain | Description |
|---------|--------|-------------|
| Active Customers | Lifecycle | Companies with active subscription |
| Churned Customers | Lifecycle | Companies that cancelled |
| Active Users (7d) | Engagement | Logged in last 7 days |
| Active Users (30d) | Engagement | Logged in last 30 days |
| Power Users | Engagement | 10+ logins in 30 days |
| Dormant Users | Engagement | Customer, no login 30+ days |
| Showed Churn Intent | Intent | Visited cancel/downgrade pages |
| Showed Purchase Intent | Intent | Visited pricing/upgrade pages |
| Documentation Readers | Behavioral | Engaged with docs/help |
| Blog Readers | Behavioral | Reading blog content |

---
*Part of SaaS Semantic Layer*
```

#### Data Model Documentation Article

```markdown
// bundle/knowledge-base/articles/data-model-documentation.md

# Data Model Documentation

This document describes the data model underlying the SaaS Semantic Layer.
Use this reference when building custom queries or understanding segment logic.

## Core Models

### Contacts (`crm.contact`)

Individual people in your database.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `attributes.emailaddress` | string | Primary email |
| `attributes.phonenumber` | string | Phone number |
| `createdAt` | timestamp | When contact was created |
| `companyRefs` | array | Linked companies |

**Coverage**: 1,270,641 contacts (55% have email)

---

### Companies (`crm.company`)

Organizations/accounts.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `attributes.name` | string | Company name |
| `attributes.employees` | number | Employee count |
| `createdAt` | timestamp | When added |

**Coverage**: 258,432 companies (85% linked to contacts)

---

### Subscriptions (`custom-object.subscription`)

Customer subscription records.

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | string | active, cancelled, paused, trial | Current state |
| `plan` | string | starter, pro, enterprise | Subscription tier |
| `mrr` | number | — | Monthly recurring revenue |
| `startDate` | timestamp | — | When subscription began |
| `companyId` | string | — | Links to company |

**How it's used**:
- `Active Customers` = status = 'active'
- `Churned Customers` = status = 'cancelled'

---

## Events

### Login Events (`custom-event.user-login`)

Product login tracking.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Links to contact |
| `timestamp` | timestamp | When login occurred |
| `device` | string | Device type |

**Volume**: ~45,000/month

**How it's used**:
- `Active Users (7d)` = login in last 7 days
- `Power Users` = 10+ logins in 30 days

---

### Feature Usage (`custom-event.feature-click`)

Feature interaction tracking.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Links to contact |
| `featureName` | string | Which feature |
| `timestamp` | timestamp | When clicked |

**Volume**: ~128,000/month

---

### Web Events (`marketing.web_metrics`)

Website behavior.

| Field | Type | Description |
|-------|------|-------------|
| `pagePath` | string | URL path visited |
| `pageTitle` | string | Page title |
| `visitorId` | string | Visitor identifier |
| `timestamp` | timestamp | When viewed |

**How it's used**:
- `Showed Churn Intent` = pagePath contains 'cancel' or 'downgrade'
- `Showed Purchase Intent` = pagePath contains 'pricing' or 'upgrade'

---

## Relationships

```
crm.contact ──────► crm.company (via companyRefs)
     │
     └──────► custom-event.user-login (via userId)
     │
     └──────► custom-event.feature-click (via userId)

custom-object.subscription ──────► crm.company (via companyId)
```

---

## Segment Logic Reference

### Lifecycle Segments

| Segment | Logic |
|---------|-------|
| Active Customers | `subscription.status = 'active'` |
| Churned Customers | `subscription.status = 'cancelled'` |

### Engagement Segments

| Segment | Logic |
|---------|-------|
| Active Users (7d) | `user-login event in last 7 days` |
| Active Users (30d) | `user-login event in last 30 days` |
| Power Users | `count(user-login) >= 10 in last 30 days` |
| Dormant Users | `Active Customer AND no user-login in 30 days` |

### Intent Segments

| Segment | Logic |
|---------|-------|
| Showed Churn Intent | `web_metrics.pagePath ~ 'cancel\|downgrade' in last 30 days` |
| Showed Purchase Intent | `web_metrics.pagePath ~ 'pricing\|upgrade' in last 14 days` |

---
*Part of SaaS Semantic Layer — Updated 2025-12-11*
```

---

### Manual Actions Required

```markdown
# bundle/recommendations/schema-changes.md

# Schema Changes Required

These changes must be made manually in DataHub before 
some segments can be created.

## Priority 1: Add ACV Field

**Model**: crm.company
**Field**: `attributes.acv`
**Type**: number
**Description**: Annual Contract Value in USD

**Data Source Options**:
1. Stripe: Export from subscription metadata
2. Chargebee: Use contract_value field
3. Salesforce: Sync from Opportunity.Amount

**Unblocks**:
- [Value] Enterprise Customers
- [Value] SMB Customers  
- [Value] High-Value Churned

---

## Priority 2: Add Churn Timestamp

**Model**: crm.company
**Field**: `attributes.churnedAt`
**Type**: timestamp
**Description**: When the company churned (subscription cancelled)

**Population Strategy**:
- Set when subscription.status changes to 'cancelled'
- Backfill from subscription.updatedAt where status = cancelled

**Unblocks**:
- [Lifecycle] Recently Churned (90d)
- Time-based win-back campaigns
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SESSION COMPLETE                                                           │
│        │                                                                    │
│        ▼                                                                    │
│  ┌─────────────────┐                                                       │
│  │  bundle/        │                                                       │
│  │  manifest.yaml  │                                                       │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│   ┌───────┼───────┬───────────┬───────────┬───────────┐                   │
│   ▼       ▼       ▼           ▼           ▼           ▼                   │
│ ┌──────┐┌──────┐┌──────┐ ┌──────────┐ ┌──────────┐ ┌──────┐              │
│ │AUDIE-││DATA- ││ASSOC-│ │KNOWLEDGE │ │ COMPUTED │ │MANUAL│              │
│ │NCES  ││HUB   ││IATIO-│ │   BASE   │ │  FIELDS  │ │ACTION│              │
│ │(Auto)││VIEWS ││NS    │ │ ARTICLES │ │ (Review) │ │GUIDE │              │
│ │      ││(Auto)││(Rev) │ │  (Auto)  │ │          │ │      │              │
│ └──┬───┘└──┬───┘└──┬───┘ └────┬─────┘ └────┬─────┘ └──┬───┘              │
│    │       │       │          │            │          │                   │
│    ▼       ▼       ▼          ▼            ▼          ▼                   │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                      BIRD WORKSPACE                                │   │
│  │                                                                    │   │
│  │  Engagements:                                                     │   │
│  │  └── Audiences/                                                   │   │
│  │      └── SaaS Semantic Layer/                                     │   │
│  │          ├── Lifecycle/ (2 audiences)                             │   │
│  │          ├── Engagement/ (4 audiences)                            │   │
│  │          ├── Intent/ (3 audiences)                                │   │
│  │          └── Behavioral/ (3 audiences)                            │   │
│  │                                                                    │   │
│  │  DataHub:                                                         │   │
│  │  └── Views/                                                       │   │
│  │      ├── company_health_summary                                   │   │
│  │      ├── engagement_trends                                        │   │
│  │      └── churn_risk_signals                                       │   │
│  │                                                                    │   │
│  │  Knowledge Base:                                                  │   │
│  │  └── SaaS Semantic Layer/                                         │   │
│  │      ├── Overview                                                 │   │
│  │      ├── Segment Composition Guide                                │   │
│  │      ├── Reference/                                               │   │
│  │      │   ├── Lifecycle Segments                                   │   │
│  │      │   ├── Engagement Segments                                  │   │
│  │      │   └── Data Model Documentation                             │   │
│  │                                                                    │   │
│  │  (Pending manual setup):                                          │   │
│  │  └── company.acv, company.churnedAt                              │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Deliverables Summary

| Phase | Rounds | Artifact | Deployable Output |
|-------|--------|----------|-------------------|
| Pre-Session | 0 | `discovery/pre-discovery.yaml` | — |
| **Phase 1** | 1-2 | `context/business-context.yaml` | — |
| **Phase 2** | 1-3 | `discovery/data-inventory.yaml` | — |
| **Phase 3** | 2-3 | `mapping/semantic-mapping.yaml` | — |
| **Phase 4** | 1-2 | `analysis/gap-analysis.md` | `bundle/recommendations/` |
| **Phase 5** | 1-2 | `catalog/segment-catalog.yaml` | `bundle/audiences/` |
| **Phase 6** | 1 | `session-summary.md` | `bundle/datahub/` |

**Total Bundle Contents**:
- 12+ audience definitions (JSON)
- 3 DataHub views (YAML)
- 1-2 association recommendations (YAML)
- 2-3 computed field specs (YAML)
- 5 knowledge base articles (Markdown)
- Manual action guides (Markdown)

---

## Bundle Contents Summary

| Type | Format | Count | Deployment |
|------|--------|-------|------------|
| **Audiences** | JSON | 12+ | Auto via API |
| **DataHub Views** | YAML | 3 | Auto via API |
| **Knowledge Base** | Markdown | 5 | Auto via API |
| **Associations** | YAML | 1-2 | Review + create |
| **Computed Fields** | YAML | 2-3 | Manual setup |
| **Action Guides** | Markdown | 2 | Reference only |

### Knowledge Base Articles

| Article | Purpose |
|---------|---------|
| **Overview** | What is the semantic layer, how to use it |
| **Composition Guide** | Recipe book for combining segments |
| **Lifecycle Reference** | Detailed lifecycle segment docs |
| **Engagement Reference** | Detailed engagement segment docs |
| **Data Model Docs** | Full data model with field definitions |

These articles ensure the semantic layer is **self-documenting** — anyone in the workspace can understand and use the segments without asking the person who created them.

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
