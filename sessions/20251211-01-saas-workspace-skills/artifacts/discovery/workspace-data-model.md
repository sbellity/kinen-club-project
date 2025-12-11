# Workspace Data Model Discovery

> Discovery from Bird production workspace - December 11, 2025

## Executive Summary

The workspace has **rich CRM and engagement data** with SaaS-relevant fields, but **sales pipeline and invoicing models are not directly exposed** in DataHub. Key opportunities exist for better SaaS lifecycle tracking.

## Data Inventory

### Core CRM Objects

#### crm.contact (134 fields)

**Scale**: ~1.27M contacts total

| Category | Fields | Notes |
|----------|--------|-------|
| **Identity** | firstName, lastName, displayName, emailaddress, phonenumber | Core PII |
| **Company** | company, domain, industry, companyDomain, company_size | B2B enrichment |
| **Role** | roleTitle, job_title | Decision-maker identification |
| **Subscriptions** | subscribedEmail, subscribedSms, subscribedWhatsApp, subscribedPush, subscribedRcs | Channel preferences |
| **Reachability** | reachableIdentifiersForEmailMarketing, reachableIdentifiersForSmsTransactional, etc. | Per-channel, marketing vs transactional |
| **Lead Stage** | lead_stage | Values: new, marketing-qualified, marketing-rejected, suspicious, enriched |
| **Account Links** | account_id, external_account_id, accountIds, admin_contact_id | Multi-account support |
| **Attribution** | initialSource, initialReference, ad_attribution_*, attribution_source | Campaign attribution |
| **Enrichment** | enrichedAt, companyDomainEnriched, companyDomainEnrichedv2 | Data enrichment tracking |
| **Product** | product_of_interest | Interest tracking |
| **Lead Score** | ads_lead_score, attribution_lead_score, ads_lead_score_notes | Scoring |

**Associations**:
- `companies` → `crm.company` (many)
- `lists` → `contact_list` (many)

**Key Distributions**:
| Field | Values | Counts |
|-------|--------|--------|
| subscribedEmail | null / false / true | 1.1M / 112k / 21k |
| lead_stage | null / new / rejected / qualified / suspicious / enriched | 1.27M / 733 / 411 / 139 / 113 / 33 |

---

#### crm.company (28 fields)

**Scale**: ~258k companies

| Category | Fields | Notes |
|----------|--------|-------|
| **Identity** | name, description, domain | Core identifiers |
| **Customer Status** | connectivityCustomer, bird | Boolean customer flags |
| **Tier** | Category_Support | Values: VIP, connectivity-prio, connectivity-p1 |
| **Location** | address1, address2, city, province, country, postalCode | Geographic |
| **Ownership** | accountManager, connectivity_am, tam_michelle | Sales/success ownership |
| **Industry** | industry, employeeRange | Firmographics |
| **External IDs** | customerId (identifier), external_id | System integration |

**Key Distributions**:
| Field | Values | Counts |
|-------|--------|--------|
| connectivityCustomer | null / true / false | 258k / 427 / 3 |
| Category_Support | null / connectivity-p1 / VIP / connectivity-prio | 258k / 289 / 46 / 24 |

---

### Activity Tracking

#### activities.activity (14 fields)

**Scale**: ~233k activities

| Field | Purpose |
|-------|---------|
| actorId, actorType | Who performed action |
| action | What was done |
| targetId, targetType | Target entity |
| data (JSON) | Flexible payload |
| createdAt | Timestamp |

**Target Types**:
| Type | Count | Notes |
|------|-------|-------|
| lead | 232,882 | **Sales pipeline tracking!** |
| opportunity | 78 | **Deal tracking!** |

**Actions**:
| Action | Count | Notes |
|--------|-------|-------|
| created | 170,189 | New records |
| ownerChanged | 48,526 | Reassignments |
| updated | 11,060 | Modifications |
| conversationCreated | 3,062 | Chat/support |
| called | 121 | Phone activities |

---

### Engagement Metrics

#### marketing.messaging_metrics (32 fields)

**Purpose**: Aggregated email/SMS/WhatsApp engagement

| Category | Fields |
|----------|--------|
| **Dimensions** | campaignID, campaignName, journeyID, flowID, platformName, direction |
| **Delivery** | sentCount, deliveredCount, deliveryRate, deliveryFailedCount, bouncedCount, bounceRate |
| **Engagement** | openCount, openRate, clickCount, clickRate |
| **Negative** | unsubscribedCount, unsubscribeRate, spamComplaintCount, spamComplaintRate |
| **Holdouts** | globalHoldoutsCount, campaignHoldoutsCount, journeyHoldoutsCount |

**Use Cases**: 
- Email engagement for churn detection
- Deliverability for reachability analysis
- Unsubscribes for communication preference tracking

---

#### marketing.web_metrics (14 fields)

**Purpose**: Web analytics aggregates

| Category | Fields |
|----------|--------|
| **Dimensions** | pageHost, pagePath, formID, stepID |
| **UTM** | campaignUTMSource, campaignUTMMedium, campaignUTMContent, campaignUTMTerm |
| **Measures** | pageViewed, formViewedCount, searchSubmittedCount, pageLostFocusCount |

---

### Meeting/Calendar Data

#### calendars.calendar_event (28 fields)

| Field | Purpose |
|-------|---------|
| summary | Meeting title |
| startTime, endTime | Duration |
| organizerEmail, organizerName | Host |
| responseStatus | Acceptance |
| rrule | Recurrence |

**Note**: Query access restricted (403 Forbidden) - needs permissions.

#### calendars.calendar_event_attendee (16 fields)

| Field | Purpose |
|-------|---------|
| eventId | Links to calendar_event |
| attendeeType | Type of attendee |
| attendeeId | Link to entity |
| email, name | Attendee identity |
| status | RSVP status |

---

## Data Gaps for SaaS Vertical

### Missing Objects (Not Found in DataHub)

| Object | Expected Purpose | Status |
|--------|------------------|--------|
| crm.lead | Dedicated lead object | Referenced in activities but not queryable |
| crm.opportunity | Deal/opportunity object | Referenced in activities but not queryable |
| invoice.* | Billing/invoicing | Not found |
| subscription.* | Recurring subscriptions | Catalog exists but models not found |
| payment.* | Payment transactions | Catalog exists but models not found |

### Missing Fields for Full SaaS Lifecycle

| Need | Current State | Recommendation |
|------|---------------|----------------|
| Customer status | `connectivityCustomer` boolean only | Add explicit `customer_status` enum (prospect/trial/customer/churned) |
| Subscription tier | `Category_Support` (partial) | Add `subscription_tier` / `plan_name` |
| MRR/ARR | Not found | Add revenue fields to company |
| Contract dates | Not found | Add `contract_start_date`, `contract_end_date`, `renewal_date` |
| Churn date | Not found | Add `churned_at` timestamp |
| Last login | Not found | Need product usage events |
| Feature usage | Not found | Need custom events |

---

## Associations Map

```
┌─────────────────┐        ┌─────────────────┐
│   crm.contact   │───────▶│   crm.company   │
│   (1.27M)       │ N:M    │   (258k)        │
└────────┬────────┘        └─────────────────┘
         │
         │ N:M
         ▼
┌─────────────────┐
│  contact_list   │
└─────────────────┘

┌─────────────────┐        ┌─────────────────────────┐
│activities.activity──────▶│ lead (232k activities)  │
│   (233k)        │        │ opportunity (78 acts)   │
└─────────────────┘        └─────────────────────────┘

┌─────────────────┐        ┌─────────────────────────┐
│calendar_event   │───────▶│ calendar_event_attendee │
└─────────────────┘        └─────────────────────────┘
```

**Missing Associations**:
- contact ↔ lead (not linked)
- contact ↔ opportunity (not linked)
- company ↔ subscription (no subscription object)
- contact ↔ calendar_event_attendee (not linked)

---

## Reachability Analysis

### Channel Coverage

| Channel | Subscription Field | Reachability Field |
|---------|-------------------|-------------------|
| Email (Marketing) | subscribedEmail | reachableIdentifiersForEmailMarketing |
| Email (Transactional) | - | reachableIdentifiersForEmailTransactional |
| SMS (Marketing) | subscribedSms | reachableIdentifiersForSmsMarketing |
| SMS (Transactional) | - | reachableIdentifiersForSmsTransactional |
| WhatsApp (Marketing) | subscribedWhatsApp | reachableIdentifiersForWhatsAppMarketing |
| WhatsApp (Transactional) | - | reachableIdentifiersForWhatsAppTransactional |
| RCS (Marketing) | subscribedRcs | reachableIdentifiersForRcsMarketing |
| Push | subscribedPush | - |
| AppInbox | subscribedAppInbox | - |

### Email Validation

Field: `email_validation_result`
- Can be used to filter valid/deliverable emails
- Separate from subscription status

---

## Query Capabilities

### Queryable Patterns

| Query Type | Supported | Model |
|------------|-----------|-------|
| Contact counts by attribute | ✅ | crm.contact |
| Company counts by customer status | ✅ | crm.company |
| Lead stage distribution | ✅ | crm.contact.attributes.lead_stage |
| Email engagement metrics | ✅ | marketing.messaging_metrics |
| Web analytics | ✅ | marketing.web_metrics |
| Activity trends | ✅ | activities.activity |

### Blocked Patterns

| Query Type | Status | Reason |
|------------|--------|--------|
| Lead pipeline stages | ❌ | Lead model not exposed |
| Opportunity values | ❌ | Opportunity model not exposed |
| Calendar events | ❌ | Access forbidden |
| Invoice totals | ❌ | No invoice model |
| Subscription MRR | ❌ | No subscription model |

---

## Recommendations

### Immediate (Use Existing Data)

1. **Customer identification**: Use `connectivityCustomer=true` on company + contact association
2. **Lead tracking**: Use `lead_stage` on contact for funnel analysis
3. **Engagement signals**: Use messaging_metrics for activity detection
4. **Reachability**: Use subscription fields + reachableIdentifiers fields

### Data Model Enhancements

1. **Expose lead/opportunity models** to DataHub for full pipeline visibility
2. **Add customer lifecycle fields** to contact/company:
   - `customer_status` enum
   - `subscription_tier`
   - `mrr` / `arr` (on company)
   - `contract_dates`
3. **Create subscription object** with:
   - plan_name, plan_tier
   - start_date, end_date
   - mrr, billing_cycle
   - status (active/cancelled/past_due)
4. **Add product usage events**:
   - login events
   - feature usage events
   - session duration

### Association Improvements

1. Link contacts to leads/opportunities
2. Link calendar attendees to contacts
3. Create company ↔ subscription association
