# Use Case: Churned High-Value Customer Winback

> Target: Run campaigns on contacts from companies that are churned customers with ACV > $100k in the last 3 years

## Segment Requirements

```
CONTACTS where:
  - Company.customerStatus = "churned"
  - Company.acv >= 100000
  - Company.churnedAt > now - 3 years
  - Contact.isAnonymous = false
  - Contact.reachable = true (email or phone)
```

## Current Data Gap Analysis

### ✅ What EXISTS

| Requirement | Field | Coverage | Notes |
|-------------|-------|----------|-------|
| Contact ↔ Company link | `companyRefs` | **84.5%** (1,073,825) | Strong association |
| Current customer flag | `company.connectivityCustomer` | 0.17% (427) | Only current customers |
| Customer tier | `company.Category_Support` | 0.14% (359) | VIP, P1, Prio |
| Contact reachability | `contact.emailaddress` | 18.1% | Email only |

### ❌ What's MISSING

| Requirement | Expected Field | Status | Impact |
|-------------|----------------|--------|--------|
| **Customer Status Enum** | `company.customerStatus` | ❌ Not exists | Can't identify "churned" |
| **ACV / Contract Value** | `company.acv` or `company.contractValue` | ❌ Not exists | Can't filter by value |
| **Churn Date** | `company.churnedAt` | ❌ Not exists | Can't filter by recency |
| **Contract Start/End** | `company.contractStartDate`, `company.contractEndDate` | ❌ Not exists | No contract timeline |
| **Revenue Data** | `company.mrr`, `company.arr` | ❌ Not exists | No revenue tracking |
| **ZoomInfo Revenue** | `zoominfo.companyRevenue` | 0% populated | Exists but empty |

### ⚠️ Partial Coverage

| Field | Coverage | Issue |
|-------|----------|-------|
| Contact email | 18.1% | Most contacts can't be emailed |
| Company customer flag | 0.17% | Only 427 companies tagged |
| Contact-company link | 84.5% | Good, but company data sparse |

## Required Data Model Changes

### Option A: Extend crm.company (Recommended)

Add these fields to `crm.company`:

```yaml
# Customer Lifecycle Fields
customerStatus:
  type: select
  options: [lead, trial, customer, churned, lost]
  description: "Current customer lifecycle stage"

customerSince:
  type: timestamp
  description: "Date became a customer"

churnedAt:
  type: timestamp  
  description: "Date customer churned (null if active)"

# Value Fields
acv:
  type: number
  description: "Annual Contract Value in USD"

contractValue:
  type: number
  description: "Total contract value"

# Contract Fields
contractStartDate:
  type: timestamp
  description: "Current contract start date"

contractEndDate:
  type: timestamp
  description: "Current contract end date"

# Segmentation Fields
customerSegment:
  type: select
  options: [enterprise, mid-market, smb, startup]
  description: "Customer segment tier"
```

### Option B: Create Subscription Custom Object

```yaml
# custom-object: subscription
fields:
  companyId:
    type: relation
    to: crm.company
  
  status:
    type: select
    options: [active, cancelled, paused, churned]
  
  plan:
    type: string
  
  acv:
    type: number
  
  startDate:
    type: timestamp
  
  endDate:
    type: timestamp
  
  cancellationDate:
    type: timestamp
  
  cancellationReason:
    type: select
    options: [price, competitor, no-need, other]
```

## Data Population Strategy

### Step 1: Identify Data Source

Where does churn/ACV data live?
- [ ] Billing system (Stripe, Chargebee, etc.)
- [ ] CRM (Salesforce, HubSpot)
- [ ] Internal database
- [ ] Spreadsheets/manual tracking

### Step 2: Create Connector/Import

1. Set up connector to billing system OR
2. Create CSV import workflow for manual data

### Step 3: Backfill Historical Data

For "last 3 years" requirement:
- Import historical churn events
- Backfill ACV for churned accounts
- Ensure `churnedAt` timestamps are accurate

### Step 4: Set Up Ongoing Sync

Automate updates when:
- Customer churns → update `customerStatus`, `churnedAt`
- Contract renews → update `acv`, dates
- New customer → update `customerStatus`, `customerSince`

## Interim Workaround

Without the missing fields, best approximation:

### Approach 1: Use `connectivityCustomer = false` + historical

```json
{
  "type": "and",
  "predicates": [
    {
      "type": "association",
      "association": "companies",
      "predicate": {
        "type": "and",
        "predicates": [
          { "type": "field", "field": "attributes.connectivityCustomer", "operator": "notEquals", "value": true },
          { "type": "field", "field": "attributes.customerId", "operator": "isNotNull" }
        ]
      }
    },
    { "type": "field", "field": "isAnonymous", "operator": "equals", "value": false },
    { "type": "field", "field": "attributes.emailaddress", "operator": "isNotNull" }
  ]
}
```

**Limitation**: This catches "not current customer with customerId" but:
- ❌ Includes companies that were NEVER customers
- ❌ No ACV filter
- ❌ No time-based filter

### Approach 2: Manual list import

1. Export churned customers from billing system
2. Filter ACV > $100k, last 3 years
3. Import as contact list in Bird
4. Target list directly

**Limitation**: 
- ❌ Static list, needs manual refresh
- ❌ Doesn't leverage Bird's dynamic segmentation

## Target Segment (Once Data Exists)

```json
{
  "type": "and",
  "predicates": [
    {
      "type": "association",
      "association": "companies",
      "predicate": {
        "type": "and",
        "predicates": [
          { 
            "type": "field", 
            "field": "attributes.customerStatus", 
            "operator": "equals", 
            "value": "churned" 
          },
          { 
            "type": "field", 
            "field": "attributes.acv", 
            "operator": "greaterThanOrEquals", 
            "value": 100000 
          },
          { 
            "type": "field", 
            "field": "attributes.churnedAt", 
            "operator": "greaterThan", 
            "value": "now - 3 years" 
          }
        ]
      }
    },
    { 
      "type": "field", 
      "field": "isAnonymous", 
      "operator": "equals", 
      "value": false 
    },
    { 
      "type": "field", 
      "field": "attributes.subscribedEmail", 
      "operator": "equals", 
      "value": true 
    }
  ]
}
```

## Estimated Segment Size

Based on current data:

| Filter | Estimated Size | Notes |
|--------|----------------|-------|
| All contacts | 1,270,862 | Starting point |
| With company link | 1,073,825 (85%) | Good coverage |
| Identified (not anonymous) | 251,059 (20%) | Major dropoff |
| With email | 229,863 (18%) | Campaign reachable |
| At "churned" companies | **Unknown** | No data |
| ACV > $100k | **Unknown** | No data |
| Churned < 3 years | **Unknown** | No data |

**Expected final segment**: Likely 100-5,000 contacts (assuming ~50 churned high-value accounts with ~10-100 contacts each)

## Recommended Actions

### Immediate (This Week)
1. [ ] Identify where ACV/churn data lives
2. [ ] Create company fields: `customerStatus`, `acv`, `churnedAt`
3. [ ] Import historical churned customer data

### Short-term (This Month)
4. [ ] Set up billing system connector
5. [ ] Backfill historical ACV data
6. [ ] Tag existing churned accounts

### Ongoing
7. [ ] Automate churn event capture
8. [ ] Update ACV on contract changes
9. [ ] Build dynamic segment

## Success Metrics

| Metric | Target |
|--------|--------|
| Companies with `customerStatus` | 100% of known customers |
| Companies with `acv` | 100% of customers |
| Churned accounts identified | All from last 3 years |
| Contact reachability | >50% of target segment |
