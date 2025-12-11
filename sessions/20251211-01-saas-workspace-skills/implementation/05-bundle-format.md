# 05: Deployable Bundle Format

## Overview

The `bundle/` directory contains everything that can be deployed to the workspace.

---

## Bundle Manifest

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
    views: 4
    associations: 1
    
  knowledge_base:
    articles: 5
    folder: "SaaS Semantic Layer"
    
  manual_actions_required: 2

status:
  ready_to_deploy:
    - audiences (12)
    - datahub views (4)
    - knowledge base articles (5)
  requires_manual_setup:
    - company.acv field
    - company.churnedAt field
```

---

## Audience Definitions

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

---

## DataHub Views

DataHub views use **queryengine predicates** (not Malloy) with column selection.

```yaml
# bundle/datahub/views/saas-views.yaml

views:
  - name: active_customers_view
    model_id: crm.company
    doc:
      name: "Active Customers"
      description: "Companies with active subscriptions"
    query:
      type: "relatedEntity"
      entityType: "subscription"
      predicate:
        type: "attribute"
        attribute: "status"
        operator: "equals"
        value: "active"
    displayed_columns:
      - "attributes.name"
      - "attributes.industry"
      - "attributes.employees"
      - "createdAt"
    sort_by: "createdAt"
    sort_order: "desc"
    
  - name: churned_customers_view
    model_id: crm.company
    doc:
      name: "Churned Customers"
      description: "Companies with cancelled subscriptions"
    query:
      type: "relatedEntity"
      entityType: "subscription"
      predicate:
        type: "attribute"
        attribute: "status"
        operator: "equals"
        value: "cancelled"
    displayed_columns:
      - "attributes.name"
      - "attributes.industry"
      - "createdAt"
    sort_by: "createdAt"
    sort_order: "desc"
```

**Note**: Views are saved filters, NOT Malloy queries. For complex analytics, use Malloy via `datahub_explorer_run_query`.

---

## Knowledge Base Articles

```yaml
# bundle/knowledge-base/manifest.yaml

articles:
  - id: saas-semantic-layer-overview
    folder: "SaaS Semantic Layer"
    title: "SaaS Semantic Layer Overview"
    file: articles/saas-semantic-layer-overview.md
    status: active
    tags: [semantic-layer, saas, segments, guide]
    
  - id: segment-composition-guide
    folder: "SaaS Semantic Layer"
    title: "How to Compose Segments"
    file: articles/segment-composition-guide.md
    status: active
    tags: [segments, composition, campaigns]
    
  - id: lifecycle-segments-reference
    folder: "SaaS Semantic Layer/Reference"
    title: "Lifecycle Segments Reference"
    file: articles/lifecycle-segments-reference.md
    status: active
    tags: [lifecycle, customer-status, churn]
    
  - id: engagement-segments-reference
    folder: "SaaS Semantic Layer/Reference"
    title: "Engagement Segments Reference"
    file: articles/engagement-segments-reference.md
    status: active
    tags: [engagement, active-users, power-users]
    
  - id: data-model-documentation
    folder: "SaaS Semantic Layer/Reference"
    title: "Data Model Documentation"
    file: articles/data-model-documentation.md
    status: active
    tags: [data-model, custom-objects, events]
```

---

## Manual Recommendations

```markdown
# bundle/recommendations/schema-changes.md

# Schema Changes Required

These changes must be made manually in DataHub.

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

## Priority 2: Add Churn Timestamp

**Model**: crm.company
**Field**: `attributes.churnedAt`
**Type**: timestamp
**Description**: When the company churned

**Unblocks**:
- [Lifecycle] Recently Churned (90d)
- Time-based win-back campaigns
```

---

## Deployment Flow

```
SESSION COMPLETE
       │
       ▼
   bundle/
       │
       ├── audiences/ ────────► Bird Audiences (auto)
       ├── datahub/views/ ────► DataHub Views (auto)
       ├── knowledge-base/ ───► KB Articles (auto)
       └── recommendations/ ──► Manual setup guide
```

---

## Bundle Contents Summary

| Type | Format | Count | Deployment |
|------|--------|-------|------------|
| **Audiences** | JSON | 12+ | Auto via API |
| **DataHub Views** | JSON | 3-4 | Auto via API |
| **Knowledge Base** | Markdown | 5 | Auto via API |
| **Associations** | YAML | 1-2 | Review + create |
| **Computed Fields** | YAML | 2-3 | Manual setup |
| **Action Guides** | Markdown | 2 | Reference only |

---

## Resource Types Comparison

| Resource | What It Does | Query Type | Use For |
|----------|--------------|------------|---------|
| **Audiences** | Segment contacts/companies | Queryengine predicates | Campaign targeting |
| **DataHub Views** | Saved filter + columns | Queryengine predicates | Filtered browsing |
| **Malloy Queries** | Complex analytics | Malloy | Ad-hoc analysis |
| **KB Articles** | Documentation | N/A | User education |
