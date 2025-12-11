# Round 02: SaaS Data Onboarding Skill

## Problem Statement

When a SaaS company wants to run sophisticated campaigns like "contacts from churned high-value customers", they face multiple knowledge gaps:

1. **Don't know what data they have** in Bird workspace
2. **Don't know what data they need** for their use case
3. **Don't know where their data lives** (billing, CRM, product, etc.)
4. **Don't know how to get it into Bird** (connectors, imports, API)
5. **Don't know how to structure it** (fields, associations, identifiers)

Current state: Each of these requires separate manual investigation. No unified workflow exists.

## Solution: `saas-data-onboarding` Skill

A conversational skill that guides users through a structured discovery and setup process.

## Skill Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SAAS DATA ONBOARDING WORKFLOW                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: BUSINESS DISCOVERY                                                │
│  ─────────────────────────                                                  │
│  "Tell me about your business"                                              │
│  • What does your SaaS do?                                                  │
│  • Who are your customers? (B2B, B2C, B2B2C)                               │
│  • What's your pricing model? (subscription, usage, hybrid)                 │
│  • How is your sales org structured? (PLG, sales-led, hybrid)              │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 2: DATA LANDSCAPE DISCOVERY                                          │
│  ────────────────────────────────                                           │
│  "Let me see what's in your workspace"                                      │
│  • Scan all catalogs and models                                             │
│  • Analyze field coverage and quality                                       │
│  • Map existing associations                                                │
│  • Identify SaaS-relevant fields                                            │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 3: USE CASE REQUIREMENTS                                             │
│  ─────────────────────────────                                              │
│  "What do you want to be able to do?"                                       │
│  • Identify target segments (churned, at-risk, expansion)                   │
│  • Map required data for each segment                                       │
│  • Score current capability vs requirements                                 │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 4: GAP ANALYSIS                                                      │
│  ─────────────────────────                                                  │
│  "Here's what's missing"                                                    │
│  • List missing fields with impact                                          │
│  • Identify source systems for missing data                                 │
│  • Prioritize by use case impact                                            │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 5: DATA SOURCE MAPPING                                               │
│  ───────────────────────────                                                │
│  "Where does this data live?"                                               │
│  • Billing system (Stripe, Chargebee, Recurly)                             │
│  • CRM (Salesforce, HubSpot, Pipedrive)                                    │
│  • Product analytics (Segment, Amplitude, Mixpanel)                        │
│  • Internal databases                                                       │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 6: SETUP GUIDANCE                                                    │
│  ─────────────────────────                                                  │
│  "Here's how to set it up"                                                  │
│  • Field schema recommendations                                             │
│  • Connector configuration                                                  │
│  • Import templates                                                         │
│  • Validation queries                                                       │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 7: VALIDATION                                                        │
│  ───────────────────────                                                    │
│  "Let's verify the setup"                                                   │
│  • Run test queries                                                         │
│  • Check field coverage                                                     │
│  • Validate segment can be built                                            │
│  • Generate readiness report                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Phase 1: Business Discovery

### Conversation Flow

```markdown
**Agent**: Let me help you set up your workspace for SaaS use cases. 
First, I need to understand your business model.

**Questions**:

1. **Business Type**: What does your SaaS product do?
   - [ ] Developer tools / API
   - [ ] Business software (CRM, HR, Finance)
   - [ ] Consumer app with subscription
   - [ ] Marketplace / Platform
   - [ ] Other: ___

2. **Customer Model**: Who are your customers?
   - [ ] B2B (companies buy)
   - [ ] B2C (individuals buy)
   - [ ] B2B2C (companies buy for their users)
   - [ ] Mixed

3. **Pricing Model**: How do you charge?
   - [ ] Pure subscription (monthly/annual)
   - [ ] Usage-based (pay per use)
   - [ ] Seat-based (per user)
   - [ ] Hybrid (base + usage)
   - [ ] One-time purchase + subscription

4. **Sales Motion**: How do customers buy?
   - [ ] Self-serve (PLG - Product Led Growth)
   - [ ] Sales-led (demos, contracts)
   - [ ] Hybrid (self-serve + sales assist)
   - [ ] Partner/reseller

5. **Contract Structure**: 
   - [ ] Month-to-month
   - [ ] Annual contracts
   - [ ] Multi-year deals
   - [ ] Mixed

6. **Key Metrics You Track**:
   - [ ] MRR / ARR
   - [ ] ACV (Annual Contract Value)
   - [ ] Seats / Users
   - [ ] Usage volume
   - [ ] NRR (Net Revenue Retention)
```

### Business Profile Output

```yaml
business_profile:
  company: "Acme SaaS"
  product_type: "business_software"
  customer_model: "b2b"
  pricing_model: "seat_based_subscription"
  sales_motion: "hybrid"
  contract_types: ["monthly", "annual"]
  key_metrics:
    - mrr
    - acv
    - seat_count
    - nrr
  
  # Derived requirements
  required_entities:
    - company (account)
    - contact (users at account)
    - subscription
    - contract
  
  required_fields:
    company:
      - customerStatus (lead, trial, customer, churned)
      - acv
      - mrr
      - seatCount
      - contractStartDate
      - contractEndDate
      - churnedAt
    contact:
      - role (admin, user, billing)
      - lastLogin
      - productUsage
```

## Phase 2: Data Landscape Discovery

### Automated Scan Workflow

```typescript
// 1. Discover all catalogs
const catalogs = await listCatalogs();

// 2. For each catalog, list models
const models = await Promise.all(
  catalogs.map(c => listModels({ catalogId: c.id }))
);

// 3. For priority models, get detailed schema
const schemas = await Promise.all(
  priorityModels.map(m => getModel({ modelId: m.id }))
);

// 4. Run volume and quality queries
const stats = await Promise.all(
  priorityModels.map(m => runVolumeQuery(m))
);

// 5. Generate discovery report
const report = generateDiscoveryReport(schemas, stats);
```

### Discovery Report Template

```markdown
# Workspace Data Discovery Report

## Summary

| Metric | Value |
|--------|-------|
| Total Catalogs | 9 |
| Total Models | 47 |
| Contact Records | 1,270,862 |
| Company Records | 258,158 |
| Data Age | 8 months |

## Model Inventory

### Core CRM Objects

| Model | Records | Key Fields | Quality |
|-------|---------|------------|---------|
| crm.contact | 1.27M | email (18%), phone (1.3%) | ⚠️ Sparse |
| crm.company | 258k | industry (1.7%), customer (0.17%) | ⚠️ Very Sparse |

### Activity Data

| Model | Records | Use |
|-------|---------|-----|
| activities.activity | 233k | Lead/opportunity tracking |
| marketing.messaging_metrics | 1.08M | Email engagement |
| marketing.web_metrics | 561k | Web activity |

## Association Map

```
crm.contact ──(companies)──► crm.company
     │
     └──(lists)──► contact_list
```

## SaaS-Relevant Fields Found

### On crm.contact
- ✅ `lead_stage` - Lead funnel position
- ✅ `subscribedEmail` - Email reachability
- ⚠️ `account_id` - Company link (5k populated)
- ❌ `customerStatus` - Not found
- ❌ `lastLogin` - Not found

### On crm.company
- ✅ `connectivityCustomer` - Current customer flag (427)
- ✅ `Category_Support` - Customer tier (359)
- ❌ `customerStatus` - Not found (enum)
- ❌ `acv` - Not found
- ❌ `churnedAt` - Not found
- ❌ `mrr` - Not found
```

## Phase 3: Use Case Requirements Mapping

### Standard SaaS Use Cases Library

```yaml
use_cases:
  customer_lifecycle:
    name: "Customer Lifecycle Segments"
    description: "Segment by customer stage: lead, trial, customer, churned"
    required_fields:
      - entity: company
        field: customerStatus
        type: enum
        values: [lead, trial, customer, churned, lost]
      - entity: company
        field: customerSince
        type: timestamp
      - entity: company
        field: churnedAt
        type: timestamp
    
  high_value_churn_winback:
    name: "Churned High-Value Customer Winback"
    description: "Target contacts at churned accounts with high ACV"
    required_fields:
      - entity: company
        field: customerStatus
        type: enum
        values: [churned]
      - entity: company
        field: acv
        type: number
        filter: ">= 100000"
      - entity: company
        field: churnedAt
        type: timestamp
        filter: "> now - 3 years"
      - entity: contact
        field: emailaddress
        type: identifier
    
  expansion_opportunities:
    name: "Expansion Opportunity Targeting"
    description: "Identify accounts ready for upsell"
    required_fields:
      - entity: company
        field: customerStatus
        type: enum
        values: [customer]
      - entity: company
        field: seatCount
        type: number
      - entity: company
        field: seatLimit
        type: number
      - entity: contact
        field: role
        type: enum
        values: [admin, decision_maker]
    
  at_risk_detection:
    name: "At-Risk Customer Detection"
    description: "Find customers showing churn signals"
    required_fields:
      - entity: company
        field: customerStatus
        type: enum
        values: [customer]
      - entity: contact
        field: lastLogin
        type: timestamp
      - entity: contact
        field: engagementScore
        type: number
      - event: product.feature_used
        aggregate: count
        timeframe: "30 days"
    
  lead_qualification:
    name: "Lead Qualification and Routing"
    description: "Score and route leads based on fit"
    required_fields:
      - entity: contact
        field: lead_stage
        type: enum
      - entity: contact
        field: leadScore
        type: number
      - entity: company
        field: employeeCount
        type: number
      - entity: company
        field: industry
        type: string
```

### Use Case Capability Scoring

```markdown
# Use Case Readiness Assessment

## High-Value Churn Winback

| Requirement | Field | Status | Gap |
|-------------|-------|--------|-----|
| Churned status | company.customerStatus | ❌ Missing | Need enum field |
| Contract value | company.acv | ❌ Missing | Need number field |
| Churn date | company.churnedAt | ❌ Missing | Need timestamp |
| Contact reachable | contact.emailaddress | ⚠️ 18% | Low coverage |
| Contact-company link | companyRefs | ✅ 85% | Good |

**Readiness Score: 20%** (1 of 5 requirements met)

**Blocking Gaps**:
1. No way to identify churned companies
2. No ACV data for value filtering
3. No temporal data for recency filtering
```

## Phase 4: Gap Analysis

### Gap Prioritization Matrix

```markdown
# Data Gap Analysis

## Critical Gaps (Blocks Multiple Use Cases)

| Gap | Use Cases Blocked | Effort | Priority |
|-----|-------------------|--------|----------|
| `customerStatus` enum | Lifecycle, Churn, At-Risk | Low | P0 |
| `acv` / `contractValue` | High-Value, Expansion | Low | P0 |
| `churnedAt` timestamp | Churn Winback | Low | P0 |

## Important Gaps (Blocks Specific Use Cases)

| Gap | Use Cases Blocked | Effort | Priority |
|-----|-------------------|--------|----------|
| Product usage events | At-Risk, Engagement | High | P1 |
| `lastLogin` timestamp | At-Risk, Active Users | Medium | P1 |
| `seatCount` / `seatLimit` | Expansion | Low | P2 |

## Nice-to-Have Gaps

| Gap | Benefit | Effort | Priority |
|-----|---------|--------|----------|
| `mrr` / `arr` fields | Revenue analysis | Low | P3 |
| Contract start/end dates | Renewal targeting | Low | P3 |
| `cancellationReason` | Churn analysis | Low | P3 |
```

## Phase 5: Data Source Mapping

### Source System Questionnaire

```markdown
**Agent**: Now let's figure out where your data lives.

1. **Billing/Subscription Data** (ACV, MRR, churn dates)
   - [ ] Stripe
   - [ ] Chargebee
   - [ ] Recurly
   - [ ] Paddle
   - [ ] Custom billing system
   - [ ] Spreadsheets
   - [ ] None / Don't track

2. **CRM / Sales Data** (deals, pipeline, account owners)
   - [ ] Salesforce
   - [ ] HubSpot
   - [ ] Pipedrive
   - [ ] Close.io
   - [ ] Custom CRM
   - [ ] Spreadsheets
   - [ ] None

3. **Product Usage Data** (logins, feature usage)
   - [ ] Segment
   - [ ] Amplitude
   - [ ] Mixpanel
   - [ ] PostHog
   - [ ] Custom analytics
   - [ ] None / Don't track

4. **Customer Database** (master customer record)
   - [ ] PostgreSQL / MySQL
   - [ ] MongoDB
   - [ ] Snowflake / BigQuery
   - [ ] Airtable
   - [ ] Spreadsheets
   - [ ] Other: ___
```

### Data Source → Field Mapping

```yaml
data_sources:
  stripe:
    provides:
      - acv (from subscription.plan.amount * 12)
      - mrr (from subscription.plan.amount)
      - customerStatus (from subscription.status)
      - churnedAt (from subscription.canceled_at)
      - customerSince (from subscription.created)
    connector: "stripe-connector"
    
  salesforce:
    provides:
      - acv (from Opportunity.Amount)
      - customerStatus (from Account.Type)
      - accountOwner (from Account.OwnerId)
      - industry (from Account.Industry)
      - employeeCount (from Account.NumberOfEmployees)
    connector: "salesforce-connector"
    
  segment:
    provides:
      - lastLogin (from identify event)
      - featureUsage (from track events)
      - pageViews (from page events)
    connector: "segment-connector"
```

## Phase 6: Setup Guidance

### Field Schema Generator

```markdown
# Recommended Field Setup

Based on your business model (B2B SaaS, seat-based, hybrid sales) and use cases,
here's the recommended schema:

## Company Fields to Add

### customerStatus (REQUIRED)
- **Type**: Select (single)
- **Options**: 
  - `lead` - Not yet customer
  - `trial` - In trial period
  - `customer` - Active paying customer
  - `churned` - Former customer, cancelled
  - `lost` - Deal lost, never became customer
- **Source**: Stripe subscription.status
- **Mapping**:
  - `active`, `trialing` → `customer` or `trial`
  - `canceled`, `unpaid` → `churned`

### acv (REQUIRED)
- **Type**: Number
- **Description**: Annual Contract Value in USD
- **Source**: Stripe subscription.plan.amount × 12
- **Calculation**: Monthly price × 12 for annual, or annual price directly

### churnedAt (REQUIRED)
- **Type**: Timestamp
- **Description**: Date customer cancelled
- **Source**: Stripe subscription.canceled_at
- **Note**: Only set when customerStatus = churned

### customerSince (RECOMMENDED)
- **Type**: Timestamp
- **Description**: Date became paying customer
- **Source**: Stripe subscription.created (first non-trial)

### seatCount (IF SEAT-BASED)
- **Type**: Number
- **Description**: Current number of seats/users
- **Source**: Stripe subscription.quantity

## Contact Fields to Add

### role (RECOMMENDED)
- **Type**: Select (single)
- **Options**: admin, user, billing_contact, champion
- **Source**: Product database or CRM

### lastProductLogin (IF TRACKING USAGE)
- **Type**: Timestamp
- **Source**: Segment identify or custom events
```

### Connector Setup Guide

```markdown
# Stripe Connector Setup

## Prerequisites
- Stripe account with API access
- List of Stripe customer IDs OR email/domain matching

## Configuration Steps

1. **Navigate to Integrations**
   Settings → Integrations → Add Integration → Stripe

2. **Authenticate**
   - Enter Stripe API key (restricted key recommended)
   - Select "Read" permissions only

3. **Configure Sync**
   ```yaml
   sync_settings:
     objects:
       - customers → crm.company
       - subscriptions → (custom object or company fields)
     
     field_mapping:
       customer.email → company identifier (domain)
       subscription.status → company.customerStatus
       subscription.plan.amount → company.mrr
       subscription.canceled_at → company.churnedAt
     
     sync_frequency: every 6 hours
   ```

4. **Test Connection**
   - Verify sample records sync
   - Check field mapping accuracy

5. **Enable Full Sync**
   - Run initial historical sync
   - Enable ongoing sync
```

### CSV Import Template

```markdown
# Manual Import Template

If no connector available, use CSV import:

## Company Import Template

| company_domain | customer_status | acv | mrr | churned_at | customer_since |
|----------------|-----------------|-----|-----|------------|----------------|
| acme.com | customer | 120000 | 10000 | | 2023-01-15 |
| beta.io | churned | 85000 | 7083 | 2024-06-30 | 2022-03-01 |
| gamma.co | trial | 0 | 0 | | 2025-12-01 |

## Import Steps

1. Export from source system (billing, CRM)
2. Transform to Bird format
3. Upload: Contacts → Import → Companies
4. Map columns to fields
5. Select identifier: `domain`
6. Run import
7. Verify records
```

## Phase 7: Validation

### Validation Queries

```typescript
// 1. Check field population
const fieldCoverage = await runQuery({
  modelName: "crm.company",
  query: `
    aggregate:
      total is count(),
      has_status is count() { where: \`attributes.customerStatus\` != null },
      has_acv is count() { where: \`attributes.acv\` != null },
      has_churned_at is count() { where: \`attributes.churnedAt\` != null }
  `
});

// 2. Check enum distribution
const statusDistribution = await runQuery({
  modelName: "crm.company",
  query: `
    group_by: \`attributes.customerStatus\`
    aggregate: total is count()
  `
});

// 3. Validate target segment
const targetSegment = await countEntities({
  entityType: "contact",
  query: {
    type: "and",
    predicates: [
      {
        type: "association",
        association: "companies",
        predicate: {
          type: "and",
          predicates: [
            { type: "field", field: "attributes.customerStatus", operator: "equals", value: "churned" },
            { type: "field", field: "attributes.acv", operator: "greaterThanOrEquals", value: 100000 }
          ]
        }
      },
      { type: "field", field: "attributes.emailaddress", operator: "isNotNull" }
    ]
  }
});
```

### Readiness Report

```markdown
# Setup Validation Report

## Field Coverage

| Field | Target | Actual | Status |
|-------|--------|--------|--------|
| customerStatus | 100% of known | 95% | ✅ |
| acv | 100% of customers | 87% | ⚠️ |
| churnedAt | 100% of churned | 100% | ✅ |

## Data Quality

| Check | Result | Notes |
|-------|--------|-------|
| Status enum valid | ✅ Pass | All values in expected set |
| ACV range valid | ⚠️ Warning | 3 records with ACV = 0 |
| Dates logical | ✅ Pass | churnedAt > customerSince |

## Target Segment Validation

**Segment**: Churned High-Value Customers (ACV > $100k, last 3 years)

| Metric | Value |
|--------|-------|
| Companies matching | 47 |
| Contacts at those companies | 892 |
| Contacts with email | 634 |
| **Reachable audience** | **634** |

✅ **Segment is now buildable!**

## Remaining Issues

1. ⚠️ 13% of customers missing ACV - review import
2. ⚠️ 3 companies with ACV = 0 - verify data
```

## Skill Implementation

### SKILL.md Structure

```yaml
---
name: saas-data-onboarding
description: |
  Guided workflow to discover workspace data, understand business requirements,
  identify gaps, and set up data for SaaS use cases.
operations:
  - datahub.catalogs:listCatalogs
  - datahub.models:listModels
  - datahub.models:getModel
  - datahub.explorer:runQuery
  - data.entities:countEntities
  - aitools.workflows:segmentBuilder
phases:
  - business_discovery
  - data_discovery
  - use_case_mapping
  - gap_analysis
  - source_mapping
  - setup_guidance
  - validation
---
```

### Conversational Flow

```markdown
## Phase 1: Business Discovery

**Agent**: 
I'll help you set up your Bird workspace for SaaS customer lifecycle management.
Let's start by understanding your business.

What type of SaaS product do you offer?
1. Developer tools / API platform
2. Business software (CRM, HR, Finance, etc.)
3. Consumer subscription app
4. Marketplace / Platform
5. Other

**User**: 2 - Business software

**Agent**:
Great! And how do your customers typically pay?
1. Monthly subscription
2. Annual contracts
3. Usage-based pricing
4. Seat-based (per user)
5. Combination

**User**: 4 - Seat-based

**Agent**:
Got it. One more question - how do customers typically buy?
1. Self-serve (sign up, enter credit card)
2. Sales-assisted (demos, negotiations)
3. Both - small deals self-serve, enterprise through sales

**User**: 3 - Both

**Agent**:
Perfect. Based on your business model (B2B seat-based SaaS with hybrid sales), 
here's what I'll look for in your workspace:

**Key entities needed**:
- Companies (your accounts)
- Contacts (users at accounts)
- Subscription data (seats, pricing, status)

**Key fields needed**:
- Customer status (lead, trial, customer, churned)
- Annual Contract Value (ACV)
- Seat count
- Churn date (for former customers)

Let me scan your workspace to see what exists...

[Runs Phase 2: Data Discovery]
```

## Output Artifacts

The skill produces:

1. **business-profile.yaml** - Structured business model description
2. **data-discovery-report.md** - Current state inventory
3. **gap-analysis.md** - Missing data with priorities
4. **field-schema.yaml** - Recommended fields to add
5. **setup-guide.md** - Step-by-step setup instructions
6. **validation-report.md** - Post-setup verification

## Next Steps

1. **Round 03**: Implement Phase 1-2 (Business + Data Discovery)
2. **Round 04**: Implement Phase 3-4 (Use Cases + Gap Analysis)
3. **Round 05**: Implement Phase 5-6 (Source Mapping + Setup)
4. **Round 06**: Implement Phase 7 (Validation)
5. **Round 07**: Integration and testing
