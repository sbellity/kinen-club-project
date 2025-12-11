# Workspace Statistics Report

> Generated: December 11, 2025
> Workspace: Bird Production

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Contacts** | 1,270,675 |
| **Identified Contacts** | 251,059 (20%) |
| **Anonymous Contacts** | 1,019,625 (80%) |
| **Total Companies** | 258,158 |
| **Total Activities** | 232,960 |
| **Messaging Records** | 1,076,047 |
| **Web Events** | 561,366 |

---

## Volume Statistics by Model

### CRM Contact

| Period | Count | % of Total |
|--------|-------|------------|
| **Total** | 1,270,675 | 100% |
| Last 1 year | 1,270,675 | 100% |
| Last 90 days | 1,043,982 | 82.2% |
| Last 30 days | 739,282 | 58.2% |
| Last 7 days | 85,530 | 6.7% |
| Last 24 hours | 13,924 | 1.1% |

**Temporal Range**: 2025-04-03 → 2025-12-11 (8 months)

**Contact Types**:
| Type | Count | % |
|------|-------|---|
| Anonymous | 1,019,625 | 80.2% |
| Identified | 251,059 | 19.8% |

---

### CRM Company

| Period | Count | % of Total |
|--------|-------|------------|
| **Total** | 258,158 | 100% |
| Last 1 year | 258,158 | 100% |
| Last 90 days | 7,049 | 2.7% |
| Last 30 days | 3,216 | 1.2% |
| Last 7 days | 795 | 0.3% |
| Last 24 hours | 112 | 0.04% |

**Temporal Range**: 2025-04-14 → 2025-12-11 (8 months)

**Growth Pattern**: Bulk import followed by steady trickle (~100/day)

---

### Activities

| Period | Count | % of Total |
|--------|-------|------------|
| **Total** | 232,960 | 100% |
| Last 1 year | 232,960 | 100% |
| Last 90 days | 13,413 | 5.8% |
| Last 30 days | 4,237 | 1.8% |
| Last 7 days | 1,091 | 0.5% |
| Last 24 hours | 162 | 0.07% |

**Temporal Range**: 2025-05-15 → 2025-12-11 (7 months)

**Activity by Target Type**:
| Target | Count | % |
|--------|-------|---|
| lead | 232,882 | 99.97% |
| opportunity | 78 | 0.03% |

**Activity by Action**:
| Action | Count | % |
|--------|-------|---|
| created | 170,189 | 73.1% |
| ownerChanged | 48,526 | 20.8% |
| updated | 11,060 | 4.7% |
| conversationCreated | 3,062 | 1.3% |
| called | 121 | 0.05% |
| deleted | 2 | 0.001% |

---

### Marketing Messaging Metrics

| Period | Count | % of Total |
|--------|-------|------------|
| **Total** | 1,076,047 | 100% |
| Last 1 year | 1,076,047 | 100% |
| Last 90 days | 243,809 | 22.7% |
| Last 30 days | 87,933 | 8.2% |
| Last 7 days | 24,508 | 2.3% |
| Last 24 hours | 5,339 | 0.5% |

**By Platform**:
| Platform | Count | % |
|----------|-------|---|
| Email | 1,022,737 | 95.0% |
| Unknown | 53,289 | 5.0% |
| WhatsApp | 21 | 0.002% |

---

### Marketing Web Metrics

| Period | Count | % of Total |
|--------|-------|------------|
| **Total** | 561,366 | 100% |
| Last 1 year | 561,366 | 100% |
| Last 90 days | 561,366 | 100% |
| Last 30 days | 561,366 | 100% |
| Last 7 days | 126,675 | 22.6% |
| Last 24 hours | 21,848 | 3.9% |

**Note**: All data within last 30 days (recent collection)

**By Page Host**:
| Host | Count | % |
|------|-------|---|
| app.bird.com | 303,835 | 54.1% |
| bird.com | 254,900 | 45.4% |
| Other | 2,631 | 0.5% |

---

## Field Quality Analysis

### Contact Field Coverage

| Field | Set Count | Null Count | Null % |
|-------|-----------|------------|--------|
| **Total** | 1,270,679 | - | - |
| emailaddress | 229,861 | 1,040,818 | **81.9%** |
| phonenumber | 16,716 | 1,253,963 | **98.7%** |
| company | 16,493 | 1,254,186 | **98.7%** |
| country | 8,736 | 1,261,943 | **99.3%** |
| lead_stage | 1,429 | 1,269,250 | **99.9%** |

**Key Insight**: Most contacts are anonymous with minimal profile data. Only ~18% have email addresses.

---

### Company Field Coverage

| Field | Set Count | Null Count | Null % |
|-------|-----------|------------|--------|
| **Total** | 258,158 | - | - |
| industry | 4,317 | 253,841 | **98.3%** |
| country | 6,430 | 251,728 | **97.5%** |
| accountManager | 8,987 | 249,171 | **96.5%** |
| customerId | 4,815 | 253,343 | **98.1%** |

**Key Insight**: Company data is very sparse. Most fields are >95% null.

---

## Dimension Distributions

### Contact: Initial Source

| Source | Count | % |
|--------|-------|---|
| unknown | 1,053,057 | 82.9% |
| import | 121,078 | 9.5% |
| connectors | 67,920 | 5.3% |
| api | 13,122 | 1.0% |
| payments | 12,648 | 1.0% |
| flows | 2,216 | 0.2% |
| web | 600 | 0.05% |

---

### Contact: Lead Stage

| Stage | Count | % |
|-------|-------|---|
| (null) | 1,269,250 | 99.89% |
| new | 733 | 0.06% |
| marketing-rejected | 411 | 0.03% |
| marketing-qualified | 139 | 0.01% |
| suspicious | 113 | 0.009% |
| enriched | 33 | 0.003% |

**Key Insight**: Lead stage is very sparse - only 1,429 contacts (0.11%) have a lead stage assigned.

---

### Contact: Industry

| Industry | Count | % |
|----------|-------|---|
| (null) | 1,266,776 | 99.7% |
| other | 549 | 0.04% |
| Hospitality | 422 | 0.03% |
| Business Services | 326 | 0.03% |
| Transportation | 295 | 0.02% |
| saas_tech | 272 | 0.02% |
| Retail | 247 | 0.02% |
| ecommerce | 207 | 0.02% |
| Software | 187 | 0.01% |

---

### Contact: Country (Top 15)

| Country | Count | % |
|---------|-------|---|
| (null) | 1,261,944 | 99.3% |
| United States | 2,574 | 0.20% |
| United States of America | 1,011 | 0.08% |
| US | 728 | 0.06% |
| NL | 373 | 0.03% |
| GB | 287 | 0.02% |
| IN | 265 | 0.02% |
| AL | 259 | 0.02% |
| AF | 227 | 0.02% |
| United Kingdom | 157 | 0.01% |
| BR | 124 | 0.01% |
| AE | 116 | 0.009% |
| MX | 110 | 0.009% |
| AU | 98 | 0.008% |
| ES | 95 | 0.007% |

**Note**: Country values not normalized (US, United States, United States of America all appear separately)

---

### Company: Industry (Top 15)

| Industry | Count | % |
|----------|-------|---|
| (null) | 253,841 | 98.3% |
| Business Services | 655 | 0.25% |
| Software | 330 | 0.13% |
| (empty string) | 260 | 0.10% |
| Retail | 239 | 0.09% |
| Hospitality | 153 | 0.06% |
| Media & Internet | 149 | 0.06% |
| Advertising & Marketing | 138 | 0.05% |
| Finance | 133 | 0.05% |
| Internet Software & Services | 95 | 0.04% |

---

### Company: Customer Status

| Status | Count | % |
|--------|-------|---|
| connectivityCustomer = null | 257,727 | 99.8% |
| connectivityCustomer = true | 427 | 0.17% |
| connectivityCustomer = false | 3 | 0.001% |

**Customer Tier (Category_Support)**:
| Tier | Count | % |
|------|-------|---|
| (null) | 257,798 | 99.9% |
| connectivity-p1 | 289 | 0.11% |
| VIP | 46 | 0.02% |
| connectivity-prio | 24 | 0.009% |

**Key Insight**: Only 427 companies (~0.2%) are marked as customers.

---

## Data Quality Summary

### Critical Issues

| Issue | Impact | Recommendation |
|-------|--------|----------------|
| 80% anonymous contacts | Can't personalize | Implement identification strategies |
| 82% contacts missing email | Can't reach by email | Focus on acquisition quality |
| 99% missing lead_stage | Can't track funnel | Implement lead qualification workflow |
| 98% companies missing industry | Can't segment B2B | Enrich company data |
| Country values not normalized | Inconsistent segmentation | Normalize country codes |

### Healthy Patterns

| Pattern | Status |
|---------|--------|
| Recent contact growth | ✅ ~14k/day |
| Messaging activity | ✅ ~5k/day |
| Web tracking | ✅ ~22k/day |
| Activity logging | ✅ ~160/day |

---

## Recommendations

### Data Quality Improvements

1. **Contact Identification**: 80% anonymous rate is very high. Implement progressive profiling.
2. **Email Collection**: Only 18% have email. Add email capture forms and incentives.
3. **Lead Stage Workflow**: Less than 0.1% have lead stage. Implement automated lead scoring.
4. **Country Normalization**: Multiple formats for same country. Standardize to ISO codes.
5. **Company Enrichment**: Use third-party enrichment for industry, size, revenue.

### For SaaS Use Cases

1. **Customer Identification**: Use `company.connectivityCustomer` + `company.Category_Support` for customer segmentation.
2. **Lead Funnel**: Use `contact.lead_stage` but expect very low coverage.
3. **Engagement**: Use messaging_metrics for email engagement signals.
4. **Missing**: No subscription/MRR data, no product usage events, no login tracking.
