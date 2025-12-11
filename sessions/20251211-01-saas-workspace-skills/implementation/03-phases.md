# 03: Session Phases & Deliverables

## Overview

Sessions are organized into **phases**, each potentially spanning multiple rounds.
Each phase produces specific **deliverables** that feed into subsequent phases.

---

## Pre-Session (Silent)

**Purpose**: Automated workspace scan before first user interaction

**Agent Actions**:
- Scan all catalogs and models
- Detect custom objects and events
- Analyze web page patterns
- Gather volume statistics
- Identify SaaS-relevant fields

**Deliverable**: `artifacts/discovery/pre-discovery.yaml`

```yaml
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

custom_events:
  - name: user-login
    monthly_volume: 45230
    has_contact_link: true
    inferred_type: login

web_patterns_detected:
  purchase_intent: ["/pricing", "/upgrade", "/checkout"]
  churn_intent: ["/cancel", "/downgrade"]

detected_business_model:
  type: B2B SaaS
  confidence: high
```

---

## Phase 1: Foundation (1-2 rounds)

**Purpose**: Validate business context and establish session goals

**Topics**:
- Business model validation (B2B/B2C/PLG/hybrid)
- Customer definition (what makes someone a "customer")
- Enterprise/value tier definition
- Priority use cases (churn, win-back, expansion, etc.)

**Deliverable**: `artifacts/context/business-context.yaml`

```yaml
confirmed_at: 2025-12-11T15:00:00Z

business_model:
  type: B2B SaaS
  sales_motion: hybrid
  validated: true

customer_definition:
  entity: company
  source: subscription.status
  active_value: "active"

enterprise_definition:
  method: acv_threshold
  threshold: 50000
  field: company.acv  # MISSING - flagged for gap analysis
  fallback: "company.employees > 500"

priority_use_cases:
  - id: churn_prevention
    priority: 1
  - id: winback
    priority: 2
  - id: expansion
    priority: 3
```

---

## Phase 2: Data Landscape (1-3 rounds)

**Purpose**: Document all relevant data with business meaning

**Topics**:
- Custom object deep dive (fields, purposes, relationships)
- Custom event semantics (what triggers them, what they mean)
- Key field documentation
- Association mapping

**Deliverable**: `artifacts/discovery/data-inventory.yaml`

```yaml
documented_at: 2025-12-11T15:30:00Z

custom_objects:
  subscription:
    description: "Customer subscription records"
    record_count: 4521
    key_fields:
      - path: status
        values: [active, cancelled, paused, trial]
        purpose: "Current subscription state"
      - path: plan
        values: [starter, pro, enterprise]
        purpose: "Subscription tier"
      - path: mrr
        type: number
        purpose: "Monthly recurring revenue"
    associations:
      - to: crm.company
        via: companyId
    saas_relevance: critical

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

web_patterns:
  documented:
    - pattern: "/pricing/*"
      behavior: purchase_intent
    - pattern: "/cancel"
      behavior: churn_intent
      priority: critical
```

---

## Phase 3: Concept Mapping (2-3 rounds)

**Purpose**: Define SaaS concepts with user-validated thresholds

**Topics**:
- Lifecycle concepts (active, churned, trial)
- Engagement concepts (active user, power user, dormant)
- Intent signals (purchase, churn, expansion)
- Value segmentation (enterprise, SMB)

**Deliverable**: `artifacts/mapping/semantic-mapping.yaml`

```yaml
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
      limitation: "Cannot filter by churn date (missing churnedAt)"
      
  engagement:
    active_users_7d:
      status: defined
      definition: "Contact with user-login event in last 7 days"
      threshold: 7 days
      threshold_rationale: "User confirmed weekly active is meaningful"
        
    power_users:
      status: defined
      definition: "Contact with 10+ logins in last 30 days"
      threshold: 10 logins
      threshold_rationale: "User confirmed based on their product usage patterns"
        
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
      priority: critical
      
  value:
    enterprise_customers:
      status: blocked
      definition: "Company with ACV > $50,000"
      missing: "company.acv field"
      workaround: "Using company.employees > 500 as proxy"
```

---

## Phase 4: Gap Analysis (1-2 rounds)

**Purpose**: Identify blockers and plan resolutions

**Topics**:
- List all blocked concepts
- Discuss workarounds vs. proper fixes
- Map data sources for missing fields
- Prioritize resolution actions

**Deliverable**: `artifacts/analysis/gap-analysis.md`

```markdown
# Gap Analysis Report

## Summary

| Domain | Defined | Blocked | Coverage |
|--------|---------|---------|----------|
| Lifecycle | 2 | 1 | 67% |
| Engagement | 4 | 0 | 100% ✅ |
| Intent | 2 | 0 | 100% ✅ |
| Value | 0 | 2 | 0% ❌ |

**Overall Semantic Coverage: 68%**

## Critical Gaps

### Gap 1: No Value Segmentation (Priority: HIGH)

**Blocked Concepts**: Enterprise Customers, SMB Customers
**Root Cause**: Missing `acv` field on company

**Resolution Options**:
| Option | Effort | Recommendation |
|--------|--------|----------------|
| Add company.acv | Low | ✅ Recommended |
| Use subscription.plan tier | Medium | Alternative |

## Gaps by Priority

| Priority | Gap | Blocked Segments | Resolution Effort |
|----------|-----|------------------|-------------------|
| HIGH | No ACV field | 3 segments | Low |
| MEDIUM | No churnedAt | 2 segments | Medium |
```

---

## Phase 5: Segment Catalog (1-2 rounds)

**Purpose**: Finalize segment definitions before creation

**Topics**:
- Review all segment definitions
- Confirm naming conventions
- Agree on folder structure
- Final predicate review

**Deliverable**: `artifacts/catalog/segment-catalog.yaml`

```yaml
finalized_at: 2025-12-11T17:00:00Z

folder_structure:
  root: "SaaS Semantic Layer"
  subfolders:
    - Lifecycle
    - Engagement
    - Intent
    - Behavioral

naming_convention: "[Domain] Segment Name"

segments_to_create:
  - name: "[Lifecycle] Active Customers"
    folder: Lifecycle
    description: "Companies with active subscriptions."
    predicate: { ... }
    priority: 1
    
  - name: "[Intent] Showed Churn Intent ⚠️"
    folder: Intent
    description: "CRITICAL: Contacts who visited cancel/downgrade pages."
    predicate: { ... }
    priority: 1

segments_blocked:
  - name: "[Value] Enterprise Customers"
    blocked_by: "Gap 1: No ACV field"
```

---

## Phase 6: Implementation (1 round)

**Purpose**: Create audiences and finalize documentation

**Actions**:
- Create Bird audiences from segment catalog
- Create DataHub views
- Generate knowledge base articles
- Generate final documentation
- Define next steps

**Deliverables**:

1. **Created Audiences** (in Bird workspace)
2. **Session Summary**: `session-summary.md`
3. **Composition Guide**: `artifacts/catalog/composition-guide.md`
4. **Bundle**: `bundle/` with all deployable files

---

## Phase Summary Table

| Phase | Rounds | Key Deliverable | Format |
|-------|--------|-----------------|--------|
| Pre-Session | 0 | Pre-discovery report | YAML |
| **Phase 1** | 1-2 | Business context | YAML |
| **Phase 2** | 1-3 | Data inventory | YAML |
| **Phase 3** | 2-3 | Semantic mapping | YAML |
| **Phase 4** | 1-2 | Gap analysis | Markdown |
| **Phase 5** | 1-2 | Segment catalog | YAML |
| **Phase 6** | 1 | Bundle + Summary | Mixed |

**Total**: 8-13 rounds, ~6 artifacts + bundle
