# Round 02: SaaS Data Onboarding Skill

## The Big Insight: Building a Semantic Layer on DataHub

**What we're really building is a semantic layer.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE BIRD SEMANTIC LAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: BUSINESS QUESTIONS                                        │   │
│  │  ───────────────────────────────                                    │   │
│  │  "Who are my churned enterprise customers that were power users?"   │   │
│  │  "Which trial users are most likely to convert?"                    │   │
│  │  "Who should I target for win-back campaigns?"                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ▲                                              │
│                              │ Composed from                                │
│                              │                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: SEMANTIC LAYER (Segments as Concepts)          ◄── WE    │   │
│  │  ──────────────────────────────────────────────────────      BUILD │   │
│  │                                                              THIS  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │ Churned  │ │Enterprise│ │  Power   │ │  Trial   │              │   │
│  │  │Customers │ │Customers │ │  Users   │ │  Users   │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │  Active  │ │ At Risk  │ │ Purchase │ │  Churn   │              │   │
│  │  │  Users   │ │  Score   │ │  Intent  │ │  Intent  │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │   │
│  │                                                                    │   │
│  │  Each segment = A business concept with clear meaning              │   │
│  │  Segments are composable: "Churned ∩ Enterprise ∩ Was Power User" │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ▲                                              │
│                              │ Derived from                                 │
│                              │                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: DATAHUB (Raw Data)                                        │   │
│  │  ───────────────────────────                                        │   │
│  │                                                                     │   │
│  │  Models:     crm.contact, crm.company, custom-object.subscription  │   │
│  │  Events:     custom-event.login, web_page_view, email_opened       │   │
│  │  Fields:     status, plan, mrr, createdAt, pagePath, timestamp     │   │
│  │  Associations: contact → company, subscription → company           │   │
│  │                                                                     │   │
│  │  Raw, uninterpreted, requires domain knowledge to use              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why a Semantic Layer?

| Without Semantic Layer | With Semantic Layer |
|------------------------|---------------------|
| User must understand data model | User thinks in business concepts |
| Complex predicates for each query | Compose named segments |
| Repeated logic across campaigns | Define once, reuse everywhere |
| Tribal knowledge required | Self-documenting building blocks |
| Hard to validate correctness | Each segment is testable |
| "What does this query mean?" | "Churned ∩ Enterprise = obvious" |

### The Skill's Mission

**Transform raw DataHub data into a rich semantic layer of composable segments that encode SaaS business logic.**

The skill doesn't just *analyze* data—it **builds understanding** by:

1. **Discovering** what raw data exists (DataHub models, events, fields)
2. **Interpreting** what it means (page paths → behaviors, events → engagement)
3. **Proposing** semantic concepts (segments with business meaning)
4. **Guiding** the user to fill gaps (missing fields, new data sources)
5. **Creating** the building blocks (actual audience segments in Bird)
6. **Enabling** complex queries through composition (not raw predicates)

### Analogy: Like dbt for Customer Data

| Data Warehouse World | Bird World |
|---------------------|------------|
| Raw tables | DataHub models |
| dbt models / metrics | Audience segments |
| dbt semantic layer | Segment catalog |
| SQL queries | Predicate compositions |
| Metrics definitions | Engagement scores, lifecycle stages |
| Data tests | Segment validation |

---

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
│  PHASE 0: AUTOMATED PRE-DISCOVERY (Silent)                                  │
│  ─────────────────────────────────────────                                  │
│  "Let me understand your workspace first"                                   │
│  • Scan all catalogs and models                                             │
│  • Detect business model signals from data structure                        │
│  • Identify existing SaaS-relevant fields                                   │
│  • Infer customer model (B2B/B2C) from associations                        │
│  • Generate pre-populated hypothesis                                        │
│                                                                             │
│                              ↓                                              │
│                                                                             │
│  PHASE 1: BUSINESS DISCOVERY (Informed Conversation)                        │
│  ───────────────────────────────────────────────────                        │
│  "Based on what I found, let me confirm..."                                 │
│  • Validate detected business model                                         │
│  • Clarify pricing/sales motion                                             │
│  • Confirm key use cases                                                    │
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

## Phase 0: Automated Pre-Discovery

### Purpose

Before asking the user anything, scan the workspace to:
1. **Detect business model signals** from existing data
2. **Pre-populate hypotheses** for Phase 1 confirmation
3. **Identify existing SaaS-relevant fields** already in place
4. **Assess data maturity** to tailor guidance complexity

### Discovery Signals

#### Customer Model Detection (B2B vs B2C)

| Signal | B2B Indicator | B2C Indicator |
|--------|---------------|---------------|
| `crm.company` records | >1,000 companies | <100 or empty |
| Contact-Company association | High coverage (>50%) | Low/none |
| Fields: `companyName`, `industry` | Populated | Sparse |
| Fields: `jobTitle`, `department` | Populated | Sparse |
| Average contacts per company | Multiple (2-50) | 1 or N/A |
| Fields: personal (birthday, gender) | Sparse | Populated |

#### Pricing Model Detection

| Signal | Subscription | Usage-Based | Seat-Based |
|--------|--------------|-------------|------------|
| Fields: `mrr`, `arr` | Present | Maybe | Present |
| Fields: `seatCount`, `users` | Sparse | Sparse | Present |
| Fields: `usageVolume`, `credits` | Sparse | Present | Sparse |
| Fields: `plan`, `tier` | Present | Present | Present |

#### Sales Motion Detection

| Signal | PLG (Self-Serve) | Sales-Led | Hybrid |
|--------|------------------|-----------|--------|
| `lead_stage` field populated | <10% | >30% | 10-30% |
| `activities.activity` volume | Low | High | Medium |
| Lead/Opportunity activities | Few | Many | Mixed |
| `accountManager` populated | Sparse | >50% | Variable |
| Trial-related fields | Present | Sparse | Present |

#### Data Maturity Detection

| Maturity Level | Signals |
|----------------|---------|
| **Nascent** | <10k contacts, no custom fields, no integrations |
| **Basic** | 10k-100k contacts, some custom fields, basic CRM |
| **Established** | 100k+ contacts, multiple integrations, good coverage |
| **Advanced** | Custom objects, events, high field coverage (>50%) |

### Pre-Discovery Workflow

```typescript
async function runPreDiscovery(): Promise<PreDiscoveryReport> {
  // 1. Scan workspace structure
  const catalogs = await listCatalogs();
  const models = await listModels();
  
  // 2. Get volume stats
  const contactCount = await countModel("crm.contact");
  const companyCount = await countModel("crm.company");
  
  // 3. Analyze contact-company relationship
  const companyLinkage = await runQuery({
    modelName: "crm.contact",
    query: `aggregate: 
      total is count(),
      has_company is count() { where: companyRefs != null }`
  });
  
  // 4. Check for SaaS-relevant fields on standard objects
  const contactSchema = await getModel("crm.contact");
  const companySchema = await getModel("crm.company");
  const saasFields = detectSaaSFields(contactSchema, companySchema);
  
  // 5. Check activity patterns
  const activityStats = await runQuery({
    modelName: "activities.activity",
    query: `group_by: targetType; aggregate: total is count()`
  });
  
  // 6. DISCOVER CUSTOM OBJECTS AND EVENTS
  const customObjects = await discoverCustomObjects(models);
  const customEvents = await discoverCustomEvents(models);
  
  // 7. Analyze and document custom schema semantics
  const customAnalysis = await analyzeCustomSchemas(customObjects, customEvents);
  
  // 8. Generate hypothesis
  return {
    detectedModel: inferBusinessModel({
      contactCount,
      companyCount,
      companyLinkage,
      saasFields,
      activityStats,
      customObjects,
      customEvents,
      customAnalysis
    }),
    confidence: calculateConfidence(...),
    existingCapabilities: saasFields,
    customObjectsFound: customAnalysis.objects,
    customEventsFound: customAnalysis.events,
    maturityLevel: assessMaturity(...),
    recommendations: generateInitialRecs(...)
  };
}
```

### Custom Object & Event Discovery

Custom objects and events often contain the most valuable SaaS-specific data (subscriptions, invoices, product usage events). Phase 0 must discover and analyze them.

#### Discovery Logic

```typescript
async function discoverCustomObjects(models: Model[]): Promise<CustomObjectAnalysis[]> {
  // Find all custom objects
  const customObjects = models.filter(m => 
    m.name.startsWith("custom-object.") || 
    m.catalogId === "ws:default" && m.kind === "object"
  );
  
  const analyses = [];
  
  for (const obj of customObjects) {
    // Get full schema
    const schema = await getModel({ modelId: obj.id });
    
    // Get volume and recency
    const stats = await runQuery({
      modelName: obj.name,
      query: `aggregate: 
        total is count(),
        last_30d is count() { where: createdAt > now - 30 day },
        earliest is min(createdAt),
        latest is max(createdAt)`
    });
    
    // Infer semantics from schema
    const semantics = inferObjectSemantics(obj.name, schema);
    
    analyses.push({
      name: obj.name,
      displayName: obj.displayName,
      description: obj.description, // May be empty
      kind: obj.kind,
      fields: schema.fields,
      associations: schema.associations,
      stats,
      inferredSemantics: semantics,
      hasDocumentation: !!obj.description && obj.description.length > 10
    });
  }
  
  return analyses;
}

async function discoverCustomEvents(models: Model[]): Promise<CustomEventAnalysis[]> {
  // Find all custom events
  const customEvents = models.filter(m => 
    m.name.startsWith("custom-event.") ||
    m.name.startsWith("semantic-event.") ||
    (m.catalogId === "ws:default" && m.kind === "event")
  );
  
  const analyses = [];
  
  for (const evt of customEvents) {
    const schema = await getModel({ modelId: evt.id });
    
    // Get volume by time window
    const stats = await runQuery({
      modelName: evt.name,
      query: `aggregate:
        total is count(),
        last_7d is count() { where: timestamp > now - 7 day },
        last_30d is count() { where: timestamp > now - 30 day },
        last_90d is count() { where: timestamp > now - 90 day }`
    });
    
    // Check for contact association
    const hasContactLink = schema.fields.some(f => 
      f.path.includes("contactId") || f.path.includes("contact_id")
    );
    
    // Infer event semantics
    const semantics = inferEventSemantics(evt.name, schema);
    
    analyses.push({
      name: evt.name,
      displayName: evt.displayName,
      description: evt.description,
      fields: schema.fields,
      stats,
      hasContactLink,
      inferredSemantics: semantics,
      hasDocumentation: !!evt.description && evt.description.length > 10
    });
  }
  
  return analyses;
}
```

#### Semantic Inference Patterns

```typescript
const CUSTOM_OBJECT_PATTERNS = {
  subscription: {
    namePatterns: ["subscription", "plan", "license", "contract"],
    fieldPatterns: ["status", "plan", "price", "startDate", "endDate", "renewalDate"],
    saasRelevance: "critical",
    purpose: "Tracks customer subscriptions and recurring revenue"
  },
  
  invoice: {
    namePatterns: ["invoice", "billing", "payment"],
    fieldPatterns: ["amount", "status", "dueDate", "paidAt", "invoiceNumber"],
    saasRelevance: "high",
    purpose: "Tracks invoices and payment history"
  },
  
  order: {
    namePatterns: ["order", "purchase", "transaction"],
    fieldPatterns: ["total", "status", "items", "orderedAt"],
    saasRelevance: "medium",
    purpose: "Tracks purchases (e-commerce or add-ons)"
  },
  
  ticket: {
    namePatterns: ["ticket", "support", "case", "issue"],
    fieldPatterns: ["status", "priority", "assignee", "resolvedAt"],
    saasRelevance: "medium",
    purpose: "Tracks support interactions (churn signal)"
  },
  
  deal: {
    namePatterns: ["deal", "opportunity", "proposal"],
    fieldPatterns: ["stage", "amount", "closeDate", "probability"],
    saasRelevance: "high",
    purpose: "Tracks sales pipeline"
  },
  
  account: {
    namePatterns: ["account", "organization", "tenant"],
    fieldPatterns: ["name", "plan", "status", "ownerId"],
    saasRelevance: "critical",
    purpose: "Core customer account (may supplement crm.company)"
  }
};

const CUSTOM_EVENT_PATTERNS = {
  login: {
    namePatterns: ["login", "sign-in", "auth", "session-start"],
    fieldPatterns: ["userId", "timestamp", "device", "ip"],
    saasRelevance: "critical",
    purpose: "Tracks product engagement (active users)"
  },
  
  feature_usage: {
    namePatterns: ["feature", "action", "clicked", "used", "viewed"],
    fieldPatterns: ["featureName", "action", "timestamp"],
    saasRelevance: "critical",
    purpose: "Tracks product adoption (expansion/churn signals)"
  },
  
  page_view: {
    namePatterns: ["page", "view", "screen", "navigation"],
    fieldPatterns: ["pageName", "url", "referrer"],
    saasRelevance: "medium",
    purpose: "Tracks in-app navigation"
  },
  
  api_call: {
    namePatterns: ["api", "request", "call"],
    fieldPatterns: ["endpoint", "method", "statusCode"],
    saasRelevance: "high",
    purpose: "Tracks API usage (for usage-based pricing)"
  },
  
  subscription_event: {
    namePatterns: ["subscribed", "upgraded", "downgraded", "cancelled", "renewed"],
    fieldPatterns: ["plan", "amount", "reason"],
    saasRelevance: "critical",
    purpose: "Tracks subscription lifecycle changes"
  },
  
  payment_event: {
    namePatterns: ["payment", "charge", "refund", "failed"],
    fieldPatterns: ["amount", "status", "method"],
    saasRelevance: "high",
    purpose: "Tracks payment success/failure"
  }
};

function inferObjectSemantics(name: string, schema: Schema): InferredSemantics {
  const nameLower = name.toLowerCase();
  
  for (const [type, pattern] of Object.entries(CUSTOM_OBJECT_PATTERNS)) {
    // Check name match
    const nameMatch = pattern.namePatterns.some(p => nameLower.includes(p));
    
    // Check field match
    const fieldNames = schema.fields.map(f => f.path.toLowerCase());
    const fieldMatches = pattern.fieldPatterns.filter(p => 
      fieldNames.some(f => f.includes(p.toLowerCase()))
    );
    
    if (nameMatch || fieldMatches.length >= 2) {
      return {
        inferredType: type,
        confidence: nameMatch && fieldMatches.length >= 2 ? "high" : "medium",
        saasRelevance: pattern.saasRelevance,
        purpose: pattern.purpose,
        matchedPatterns: {
          name: nameMatch,
          fields: fieldMatches
        }
      };
    }
  }
  
  return {
    inferredType: "unknown",
    confidence: "low",
    saasRelevance: "unknown",
    purpose: "Custom object - needs manual documentation"
  };
}

function inferEventSemantics(name: string, schema: Schema): InferredSemantics {
  // Similar logic for events
  const nameLower = name.toLowerCase();
  
  for (const [type, pattern] of Object.entries(CUSTOM_EVENT_PATTERNS)) {
    const nameMatch = pattern.namePatterns.some(p => nameLower.includes(p));
    const fieldNames = schema.fields.map(f => f.path.toLowerCase());
    const fieldMatches = pattern.fieldPatterns.filter(p => 
      fieldNames.some(f => f.includes(p.toLowerCase()))
    );
    
    if (nameMatch || fieldMatches.length >= 2) {
      return {
        inferredType: type,
        confidence: nameMatch && fieldMatches.length >= 2 ? "high" : "medium",
        saasRelevance: pattern.saasRelevance,
        purpose: pattern.purpose,
        matchedPatterns: { name: nameMatch, fields: fieldMatches }
      };
    }
  }
  
  return {
    inferredType: "unknown",
    confidence: "low",
    saasRelevance: "unknown",
    purpose: "Custom event - needs manual documentation"
  };
}
```

#### Custom Schema Documentation Generator

When semantics aren't documented in DataHub, generate documentation suggestions:

```typescript
async function generateCustomSchemaDocumentation(
  analysis: CustomObjectAnalysis | CustomEventAnalysis
): Promise<DocumentationSuggestion> {
  
  if (analysis.hasDocumentation) {
    return { needsDocumentation: false };
  }
  
  const semantics = analysis.inferredSemantics;
  
  // Generate description based on inference
  const suggestedDescription = semantics.confidence === "high"
    ? `${semantics.purpose}. Contains ${analysis.fields.length} fields including ${
        analysis.fields.slice(0, 3).map(f => f.displayName || f.path).join(", ")
      }.`
    : `Custom ${analysis.kind} with ${analysis.fields.length} fields. Purpose: [NEEDS DOCUMENTATION]`;
  
  // Generate field descriptions
  const fieldDocumentation = analysis.fields
    .filter(f => !f.description)
    .map(f => ({
      field: f.path,
      suggestedDescription: inferFieldDescription(f.path, f.dataType),
      confidence: "medium"
    }));
  
  return {
    needsDocumentation: true,
    suggestedDescription,
    fieldDocumentation,
    inferredType: semantics.inferredType,
    saasRelevance: semantics.saasRelevance,
    recommendation: semantics.saasRelevance === "critical" 
      ? "This object appears critical for SaaS use cases. Please verify and document."
      : "Consider documenting this object for future reference."
  };
}

const FIELD_DESCRIPTION_PATTERNS = {
  status: "Current status of the record",
  createdAt: "Timestamp when record was created",
  updatedAt: "Timestamp when record was last updated",
  amount: "Monetary value (currency assumed from context)",
  plan: "Subscription plan or tier name",
  startDate: "Start date of the subscription/contract",
  endDate: "End date of the subscription/contract",
  userId: "Reference to the user/contact",
  companyId: "Reference to the company/account",
  reason: "Reason or explanation for the action"
};

function inferFieldDescription(fieldPath: string, dataType: string): string {
  const fieldName = fieldPath.split(".").pop()?.toLowerCase() || "";
  
  for (const [pattern, description] of Object.entries(FIELD_DESCRIPTION_PATTERNS)) {
    if (fieldName.includes(pattern.toLowerCase())) {
      return description;
    }
  }
  
  // Generic based on type
  switch (dataType) {
    case "timestamp": return "Date/time value";
    case "boolean": return "True/false flag";
    case "number": return "Numeric value";
    case "string": return "Text value";
    default: return "[Needs description]";
  }
}
```

#### Custom Objects Report Section

Add to pre-discovery report:

```yaml
custom_objects:
  found: 3
  documented: 1
  undocumented: 2
  
  objects:
    - name: "custom-object.subscription"
      displayName: "Subscription"
      description: "Customer subscription records"  # Has docs
      records: 4521
      last_30d: 342
      associations:
        - to: crm.company
          via: companyId
      inferredType: "subscription"
      confidence: "high"
      saasRelevance: "critical"
      keyFields:
        - path: status
          values: ["active", "cancelled", "paused"]
        - path: plan
          values: ["starter", "pro", "enterprise"]
        - path: mrr
          type: number
          coverage: 98%
      documentation_status: "documented"
      
    - name: "custom-object.ticket"
      displayName: null  # No display name
      description: null  # No description
      records: 12843
      last_30d: 1205
      inferredType: "ticket"
      confidence: "medium"
      saasRelevance: "medium"
      keyFields:
        - path: status
        - path: priority
        - path: assignee
      documentation_status: "needs_documentation"
      suggested_description: "Support ticket records. Contains status, priority, and assignee tracking."
      
custom_events:
  found: 5
  documented: 2
  undocumented: 3
  
  events:
    - name: "custom-event.user-login"
      records_30d: 45230
      records_7d: 12500
      hasContactLink: true
      inferredType: "login"
      confidence: "high"
      saasRelevance: "critical"
      documentation_status: "needs_documentation"
      suggested_description: "User login events for tracking product engagement."
      recommendation: "CRITICAL: This event enables active user tracking. Document immediately."
      
    - name: "custom-event.feature-click"
      records_30d: 128400
      records_7d: 31200
      hasContactLink: true
      inferredType: "feature_usage"
      confidence: "high"
      saasRelevance: "critical"
      documentation_status: "needs_documentation"
      suggested_description: "Feature usage tracking for product adoption analysis."
```

### Web Event Semantic Analysis

Raw web events (page views, clicks) are meaningless without interpretation. Phase 0 must detect patterns and suggest behavioral segments as building blocks.

#### Page Pattern Detection

```typescript
interface PagePattern {
  pattern: string | RegExp;
  behavior: string;
  intent: string;
  saasStage: SaaSStage;
  segmentSuggestion: string;
}

const PAGE_PATTERNS: PagePattern[] = [
  // Purchase Intent
  {
    pattern: /\/(checkout|cart|payment|subscribe|upgrade|buy)/i,
    behavior: "checkout_intent",
    intent: "Ready to purchase",
    saasStage: "conversion",
    segmentSuggestion: "Showed Purchase Intent"
  },
  {
    pattern: /\/(pricing|plans|packages|compare)/i,
    behavior: "pricing_evaluation",
    intent: "Evaluating pricing",
    saasStage: "evaluation",
    segmentSuggestion: "Viewed Pricing"
  },
  
  // Product Engagement
  {
    pattern: /\/(dashboard|app|console|portal)/i,
    behavior: "product_usage",
    intent: "Using product",
    saasStage: "activation",
    segmentSuggestion: "Active Product Users"
  },
  {
    pattern: /\/(settings|account|profile|preferences)/i,
    behavior: "account_management",
    intent: "Managing account",
    saasStage: "retention",
    segmentSuggestion: "Managing Settings"
  },
  
  // Learning / Onboarding
  {
    pattern: /\/(docs|documentation|help|support|faq|guide|tutorial)/i,
    behavior: "learning",
    intent: "Learning product",
    saasStage: "onboarding",
    segmentSuggestion: "Reading Documentation"
  },
  {
    pattern: /\/(getting-started|quickstart|onboarding|setup)/i,
    behavior: "onboarding",
    intent: "Getting started",
    saasStage: "onboarding",
    segmentSuggestion: "In Onboarding Flow"
  },
  
  // Content Consumption
  {
    pattern: /\/(blog|articles?|news|updates)/i,
    behavior: "content_consumption",
    intent: "Consuming content",
    saasStage: "awareness",
    segmentSuggestion: "Blog Readers"
  },
  {
    pattern: /\/(case-stud|success-stor|testimonial|customer)/i,
    behavior: "social_proof",
    intent: "Seeking validation",
    saasStage: "consideration",
    segmentSuggestion: "Viewed Social Proof"
  },
  {
    pattern: /\/(webinar|demo|video|watch)/i,
    behavior: "demo_interest",
    intent: "Wants to see product",
    saasStage: "consideration",
    segmentSuggestion: "Watched Demo Content"
  },
  
  // Churn Signals
  {
    pattern: /\/(cancel|downgrade|close-account|unsubscribe)/i,
    behavior: "churn_intent",
    intent: "Considering leaving",
    saasStage: "churn_risk",
    segmentSuggestion: "Showed Churn Intent"
  },
  {
    pattern: /\/(competitor|alternative|vs-|compare-to)/i,
    behavior: "competitor_research",
    intent: "Evaluating alternatives",
    saasStage: "churn_risk",
    segmentSuggestion: "Researching Competitors"
  },
  
  // Feature Interest
  {
    pattern: /\/(features?|capabilities|integrations?|api)/i,
    behavior: "feature_exploration",
    intent: "Exploring capabilities",
    saasStage: "evaluation",
    segmentSuggestion: "Exploring Features"
  },
  {
    pattern: /\/(enterprise|security|compliance|soc2|gdpr)/i,
    behavior: "enterprise_evaluation",
    intent: "Enterprise buyer",
    saasStage: "evaluation",
    segmentSuggestion: "Enterprise Evaluators"
  }
];

type SaaSStage = 
  | "awareness"      // Just discovered you
  | "consideration"  // Evaluating you
  | "evaluation"     // Comparing options
  | "conversion"     // Ready to buy
  | "onboarding"     // Just signed up
  | "activation"     // Using product
  | "retention"      // Engaged customer
  | "expansion"      // Upsell opportunity
  | "churn_risk";    // May leave
```

#### Web Event Discovery

```typescript
async function discoverWebEvents(): Promise<WebEventAnalysis> {
  // Get sample of page paths
  const pagePaths = await runQuery({
    modelName: "marketing.web_metrics",
    queryAsSourceText: `
      run: web_metrics -> {
        group_by: pagePath
        aggregate: 
          views is count(),
          unique_visitors is count(distinct visitorId)
        order_by: views desc
        limit: 500
      }
    `
  });
  
  // Analyze patterns
  const patternAnalysis = analyzePagePatterns(pagePaths);
  
  // Get page titles for context
  const pageTitles = await runQuery({
    modelName: "marketing.web_metrics",
    queryAsSourceText: `
      run: web_metrics -> {
        group_by: pagePath, pageTitle
        aggregate: views is count()
        order_by: views desc
        limit: 200
      }
    `
  });
  
  // Detect custom patterns from actual data
  const customPatterns = detectCustomPatterns(pagePaths, pageTitles);
  
  return {
    totalPages: pagePaths.length,
    recognizedPatterns: patternAnalysis.recognized,
    unrecognizedPages: patternAnalysis.unrecognized,
    customPatternsDetected: customPatterns,
    suggestedSegments: generateSegmentSuggestions(patternAnalysis)
  };
}

function analyzePagePatterns(pages: PageData[]): PatternAnalysis {
  const recognized: RecognizedPage[] = [];
  const unrecognized: UnrecognizedPage[] = [];
  
  for (const page of pages) {
    let matched = false;
    
    for (const pattern of PAGE_PATTERNS) {
      if (pattern.pattern instanceof RegExp 
          ? pattern.pattern.test(page.pagePath)
          : page.pagePath.includes(pattern.pattern)) {
        recognized.push({
          ...page,
          behavior: pattern.behavior,
          intent: pattern.intent,
          saasStage: pattern.saasStage,
          suggestedSegment: pattern.segmentSuggestion
        });
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      unrecognized.push(page);
    }
  }
  
  return { recognized, unrecognized };
}
```

#### Custom Pattern Detection

Detect patterns from actual URL structure:

```typescript
function detectCustomPatterns(
  pages: PageData[], 
  titles: PageTitleData[]
): CustomPattern[] {
  const patterns: CustomPattern[] = [];
  
  // Detect URL structure patterns
  // e.g., /product/{id}, /user/{id}/settings, /workspace/{id}/dashboard
  
  const pathSegments = pages.map(p => p.pagePath.split("/").filter(Boolean));
  
  // Find common prefixes with variable segments
  const prefixCounts = new Map<string, number>();
  
  for (const segments of pathSegments) {
    if (segments.length >= 2) {
      // Look for patterns like /docs/*, /blog/*, /app/*
      const prefix = `/${segments[0]}`;
      prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
    }
  }
  
  // Identify significant prefixes (> 10 pages)
  for (const [prefix, count] of prefixCounts) {
    if (count >= 10) {
      // Check if this is a known pattern
      const isKnown = PAGE_PATTERNS.some(p => 
        p.pattern instanceof RegExp 
          ? p.pattern.test(prefix)
          : prefix.includes(p.pattern as string)
      );
      
      if (!isKnown) {
        patterns.push({
          pattern: `${prefix}/*`,
          pageCount: count,
          samplePaths: pages
            .filter(p => p.pagePath.startsWith(prefix))
            .slice(0, 5)
            .map(p => p.pagePath),
          needsClassification: true,
          suggestion: `Detected ${count} pages under ${prefix}. What do these represent?`
        });
      }
    }
  }
  
  return patterns;
}
```

### The Semantic Data Layer: Segments as Building Blocks

**Key Insight**: Raw data (events, fields) is the foundation, but **segments are the semantic layer** that gives data meaning and enables composable queries.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPOSABLE DATA ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 3: BUSINESS QUERIES (Complex Compositions)                          │
│  ─────────────────────────────────────────────────                          │
│  "Churned enterprise customers who were power users                         │
│   but showed declining engagement before churning"                          │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │ Enterprise Customers  ∩  Churned  ∩  Was Power User          │          │
│  │      ∩  Had Declining Engagement Pattern                     │          │
│  └──────────────────────────────────────────────────────────────┘          │
│                                                                             │
│  LAYER 2: BEHAVIORAL SEGMENTS (Reusable Building Blocks)                    │
│  ───────────────────────────────────────────────────────                    │
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Enterprise │ │   Churned   │ │ Power User  │ │  Declining  │          │
│  │  Customers  │ │  Customers  │ │  (last 90d) │ │ Engagement  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Active    │ │   At Risk   │ │   Showed    │ │   Viewed    │          │
│  │   Users     │ │   (score)   │ │ Churn Intent│ │   Pricing   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Blog     │ │    Docs     │ │   Demo      │ │  Checkout   │          │
│  │   Readers   │ │   Readers   │ │  Watchers   │ │  Visitors   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                                             │
│  LAYER 1: RAW DATA (Events, Objects, Fields)                               │
│  ───────────────────────────────────────────                                │
│  • web_metrics.pagePath, pageTitle, timestamp                              │
│  • custom-event.user-login: userId, timestamp                              │
│  • custom-object.subscription: status, plan, mrr                           │
│  • crm.contact: attributes.*, identifiers.*                                │
│  • crm.company: attributes.*, associations.*                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Segment Generation from Patterns

```typescript
interface BehavioralSegmentSuggestion {
  name: string;
  description: string;
  category: SegmentCategory;
  predicate: Predicate;
  saasStage: SaaSStage;
  composableWith: string[];  // Other segments this combines well with
  businessValue: string;
}

type SegmentCategory = 
  | "lifecycle"        // Customer status
  | "engagement"       // Product usage
  | "intent"           // Purchase/churn signals
  | "behavior"         // Web/app behavior
  | "demographic";     // Company/contact attributes

async function generateBehavioralSegments(
  analysis: WebEventAnalysis
): Promise<BehavioralSegmentSuggestion[]> {
  
  const suggestions: BehavioralSegmentSuggestion[] = [];
  
  // Group recognized pages by behavior
  const byBehavior = groupBy(analysis.recognizedPatterns, "behavior");
  
  for (const [behavior, pages] of Object.entries(byBehavior)) {
    const pattern = PAGE_PATTERNS.find(p => p.behavior === behavior)!;
    const totalViews = pages.reduce((sum, p) => sum + p.views, 0);
    
    if (totalViews < 100) continue; // Skip low-volume behaviors
    
    // Build predicate from page paths
    const pagePaths = pages.map(p => p.pagePath);
    const predicate = buildPageViewPredicate(pagePaths);
    
    suggestions.push({
      name: pattern.segmentSuggestion,
      description: `Contacts who ${pattern.intent.toLowerCase()} in the last 30 days`,
      category: "behavior",
      predicate,
      saasStage: pattern.saasStage,
      composableWith: getComposableSegments(pattern.saasStage),
      businessValue: getBusinessValue(behavior)
    });
  }
  
  return suggestions;
}

function buildPageViewPredicate(pagePaths: string[]): Predicate {
  // Build a predicate that matches any of these page paths
  // Using contains or regex depending on pattern complexity
  
  if (pagePaths.length === 1) {
    return {
      type: "event",
      eventType: "web_page_view",
      condition: {
        type: "string",
        attribute: "pagePath",
        operator: "contains",
        value: pagePaths[0]
      },
      timeWindow: { value: 30, unit: "days" }
    };
  }
  
  // Multiple paths - use OR
  return {
    type: "event",
    eventType: "web_page_view",
    condition: {
      type: "or",
      predicates: pagePaths.map(path => ({
        type: "string",
        attribute: "pagePath",
        operator: "contains",
        value: extractPatternFromPath(path)
      }))
    },
    timeWindow: { value: 30, unit: "days" }
  };
}

function getComposableSegments(stage: SaaSStage): string[] {
  // Suggest segments that make sense to combine
  const compositions: Record<SaaSStage, string[]> = {
    awareness: ["Enterprise Evaluators", "Blog Readers"],
    consideration: ["Viewed Pricing", "Watched Demo"],
    evaluation: ["Viewed Pricing", "Enterprise Evaluators"],
    conversion: ["Active Users", "Enterprise Customers"],
    onboarding: ["Active Users", "Reading Documentation"],
    activation: ["Power Users", "Feature Adopters"],
    retention: ["At Risk", "Declining Engagement"],
    expansion: ["Power Users", "Feature Exploration"],
    churn_risk: ["Showed Churn Intent", "Declining Engagement", "Was Power User"]
  };
  
  return compositions[stage] || [];
}

function getBusinessValue(behavior: string): string {
  const values: Record<string, string> = {
    checkout_intent: "High conversion potential - prioritize for sales follow-up",
    pricing_evaluation: "Active evaluation - nurture with comparison content",
    product_usage: "Engaged customers - monitor for expansion signals",
    learning: "Onboarding journey - ensure completion",
    content_consumption: "Top-of-funnel - nurture toward evaluation",
    churn_intent: "URGENT: Retention intervention needed",
    competitor_research: "At-risk - proactive retention outreach"
  };
  
  return values[behavior] || "Monitor for engagement patterns";
}
```

#### Segment Catalog Structure

Organize suggested segments into a catalog:

```yaml
segment_catalog:
  lifecycle:
    - name: "Active Customers"
      description: "Contacts at companies with active subscriptions"
      requires: ["custom-object.subscription"]
      predicate: { ... }
      
    - name: "Churned Customers"
      description: "Contacts at companies that cancelled"
      requires: ["custom-object.subscription", "company.churnedAt"]
      predicate: { ... }
      gap_if_missing: "Need churnedAt field on company or subscription status"
      
    - name: "Trial Users"
      description: "Contacts in trial period"
      requires: ["custom-object.subscription.status=trial OR company.trialEndsAt"]
      
  engagement:
    - name: "Active Users (Last 7 days)"
      description: "Contacts with product login in last 7 days"
      requires: ["custom-event.user-login"]
      predicate: 
        type: event
        eventType: custom-event.user-login
        timeWindow: { value: 7, unit: days }
        
    - name: "Power Users"
      description: "Contacts with 10+ sessions in last 30 days"
      requires: ["custom-event.user-login"]
      predicate:
        type: event
        eventType: custom-event.user-login
        aggregation: { function: count, operator: gte, value: 10 }
        timeWindow: { value: 30, unit: days }
        
    - name: "Declining Engagement"
      description: "Users whose activity dropped >50% vs previous period"
      requires: ["custom-event.user-login", "computed segment"]
      complexity: "advanced"
      
  intent:
    - name: "Showed Purchase Intent"
      description: "Visited checkout/pricing/upgrade pages"
      requires: ["marketing.web_metrics"]
      predicate:
        type: event
        eventType: web_page_view
        condition:
          attribute: pagePath
          operator: matches
          value: "(checkout|pricing|upgrade|subscribe)"
          
    - name: "Showed Churn Intent"
      description: "Visited cancel/downgrade pages"
      requires: ["marketing.web_metrics"]
      predicate:
        type: event
        eventType: web_page_view
        condition:
          attribute: pagePath
          operator: matches
          value: "(cancel|downgrade|close-account)"
          
  behavior:
    - name: "Documentation Readers"
      description: "Engaged with help/docs content"
      requires: ["marketing.web_metrics"]
      predicate: { ... }
      
    - name: "Blog Readers"
      description: "Consuming blog content"
      requires: ["marketing.web_metrics"]
      
    - name: "Enterprise Evaluators"
      description: "Viewing enterprise/security/compliance pages"
      requires: ["marketing.web_metrics"]
```

#### Segment Foundation Assessment

Before complex queries, assess which building blocks exist:

```typescript
async function assessSegmentFoundation(): Promise<SegmentFoundationReport> {
  const catalog = getSegmentCatalog();
  const workspaceCapabilities = await discoverCapabilities();
  
  const assessment = {
    available: [],
    creatable: [],
    blocked: []
  };
  
  for (const segment of catalog.allSegments) {
    const status = checkSegmentFeasibility(segment, workspaceCapabilities);
    
    if (status.feasible) {
      if (status.exists) {
        assessment.available.push({
          ...segment,
          existingAudienceId: status.audienceId
        });
      } else {
        assessment.creatable.push({
          ...segment,
          predicate: status.predicate,
          recommendation: "Create this segment to enable advanced queries"
        });
      }
    } else {
      assessment.blocked.push({
        ...segment,
        missingRequirements: status.missing,
        howToUnblock: status.resolution
      });
    }
  }
  
  return {
    summary: {
      available: assessment.available.length,
      creatable: assessment.creatable.length,
      blocked: assessment.blocked.length,
      foundationScore: calculateFoundationScore(assessment)
    },
    segments: assessment,
    recommendations: prioritizeSegmentCreation(assessment)
  };
}

function calculateFoundationScore(assessment: Assessment): number {
  // Score based on critical segments available
  const criticalSegments = [
    "Active Customers",
    "Churned Customers", 
    "Active Users",
    "Showed Purchase Intent",
    "Showed Churn Intent"
  ];
  
  const available = criticalSegments.filter(name => 
    assessment.available.some(s => s.name === name) ||
    assessment.creatable.some(s => s.name === name)
  );
  
  return Math.round((available.length / criticalSegments.length) * 100);
}
```

#### Interactive Segment Builder

When user wants a complex query, decompose into building blocks:

```markdown
**User**: I want to target churned enterprise customers who were power users

**Agent**: Let me break this down into building blocks:

📦 **Required Segments**

1. **Enterprise Customers** 
   - Status: ⚠️ Needs definition
   - Question: What makes a customer "enterprise"? (ACV > $X? Plan = enterprise? Employee count?)

2. **Churned Customers**
   - Status: ❌ Blocked
   - Missing: `churnedAt` field on company
   - Workaround: If you have subscription object, I can infer from `status = cancelled`

3. **Power Users**
   - Status: ✅ Can create
   - Definition: 10+ logins in 30 days (using user-login events)
   - Question: Is this the right threshold for "power user"?

🔧 **Let's build these one by one:**

First, I'll create the "Power Users" segment since we have the data.
What's your threshold for enterprise? Options:
- A) ACV > $X (need ACV field)
- B) Plan = "enterprise" (need plan field)  
- C) Employee count > X (need company.employees)
- D) Manual list (upload company IDs)
```

#### Pre-Discovery Report Addition

```yaml
behavioral_patterns:
  web_events:
    total_unique_pages: 1,247
    recognized_patterns: 834 (67%)
    unrecognized_pages: 413 (33%)
    
    by_category:
      purchase_intent:
        pages: 45
        views_30d: 12,400
        segment_suggested: "Showed Purchase Intent"
        
      product_usage:
        pages: 312
        views_30d: 89,000
        segment_suggested: "Active Product Users"
        
      learning:
        pages: 156
        views_30d: 34,500
        segment_suggested: "Documentation Readers"
        
      churn_signals:
        pages: 8
        views_30d: 890
        segment_suggested: "Showed Churn Intent"
        priority: "CRITICAL - create immediately"
        
    custom_patterns_detected:
      - pattern: "/workspace/*"
        pages: 234
        suggestion: "Appears to be product workspace pages - classify as product_usage?"
      - pattern: "/admin/*"
        pages: 45
        suggestion: "Admin pages - classify as account_management?"

  segment_foundation:
    score: 45%  # Of critical segments available/creatable
    
    available_now:
      - "Active Users (7d)" via user-login events
      - "Documentation Readers" via web events
      - "Showed Purchase Intent" via web events
      
    can_create:
      - "Power Users" (10+ logins)
      - "Blog Readers"
      - "Enterprise Evaluators"
      
    blocked:
      - "Churned Customers" - missing churnedAt
      - "Enterprise Customers" - missing tier/ACV
      - "At Risk Score" - needs engagement model
      
  recommendation: |
    Your workspace has good behavioral data but lacks lifecycle segments.
    Priority actions:
    1. Create "Showed Churn Intent" segment immediately (data available)
    2. Add subscription status to enable "Active/Churned Customers"
    3. Define "Enterprise" criteria to enable tier-based targeting
```

#### Updated Opening Message with Segments

```markdown
**Agent**:

I've scanned your workspace and analyzed your data for SaaS capabilities.

📊 **Data Foundation**
- 1.27M contacts, 258K companies (85% linked)
- Subscription data ✅ (4,521 records)
- Login events ✅ (45K/month)
- Web tracking ✅ (89K page views/month)

🧱 **Segment Building Blocks** (Foundation Score: 45%)

| Category | Available | Can Create | Blocked |
|----------|-----------|------------|---------|
| Lifecycle | 0 | 0 | 2 |
| Engagement | 1 | 2 | 0 |
| Intent | 0 | 3 | 0 |
| Behavior | 0 | 4 | 0 |

✅ **I can create these segments now:**
- Active Users (7d, 30d)
- Power Users (10+ logins)
- Showed Purchase Intent (visited pricing/checkout)
- Showed Churn Intent (visited cancel pages) ⚠️ **Priority!**
- Documentation Readers
- Blog Readers

❌ **Blocked until data is added:**
- Churned Customers (need `churnedAt` or subscription status)
- Enterprise Customers (need ACV or plan tier)

🎯 **For your goal** (target churned high-value customers):
You need these building blocks:
1. ❌ Churned Customers → needs subscription status mapping
2. ❌ Enterprise/High-Value → needs ACV field
3. ✅ Was Power User → can create from login history

**Shall I:**
1. Create the available segments now as your foundation?
2. Show you how to add the missing data for lifecycle segments?
3. Build a workaround using subscription object for "churned"?
```

```markdown
**Agent**:

I've scanned your Bird workspace. Here's what I found:

📊 **Your Data**
- 1.27M contacts, 258K companies
- Strong contact-company linkage (85%)

🔧 **Custom Objects Found**
| Object | Records | SaaS Relevance | Documented |
|--------|---------|----------------|------------|
| `subscription` | 4,521 | ✅ Critical | ✅ Yes |
| `ticket` | 12,843 | ⚠️ Medium | ❌ No |

This is great! You have a **subscription object** which means you're tracking 
customer subscriptions. I can use this for lifecycle analysis.

📡 **Custom Events Found**
| Event | Last 30d | SaaS Relevance | Documented |
|-------|----------|----------------|------------|
| `user-login` | 45,230 | ✅ Critical | ❌ No |
| `feature-click` | 128,400 | ✅ Critical | ❌ No |

Excellent! You're tracking **product usage events**. This enables:
- Active user identification
- Engagement scoring
- Churn risk detection

⚠️ **Undocumented Objects** (2 objects, 2 events)
I've inferred their purpose but recommend adding descriptions in DataHub 
for future clarity.

**With your current setup, you CAN potentially:**
- ✅ Identify active vs inactive users (via login events)
- ✅ Track subscription status (via subscription object)
- ✅ Detect declining engagement (via feature usage trends)

**Still missing for full capabilities:**
- ❌ `customerStatus` on company (subscription object has it, but not synced)
- ❌ `acv` / contract value
- ❌ `churnedAt` timestamp

Would you like me to:
1. Generate documentation for your undocumented objects/events?
2. Show how to use your subscription object for customer lifecycle?
3. Proceed with gap analysis for your priority use case?
```

### SaaS Field Detection

```typescript
const SAAS_FIELD_PATTERNS = {
  // Customer lifecycle
  customerStatus: {
    patterns: ["customerStatus", "customer_status", "accountStatus", "status"],
    type: "enum",
    category: "lifecycle"
  },
  
  // Revenue
  acv: {
    patterns: ["acv", "annual_contract_value", "annualContractValue", "contractValue"],
    type: "number",
    category: "revenue"
  },
  mrr: {
    patterns: ["mrr", "monthly_recurring_revenue", "monthlyRevenue"],
    type: "number",
    category: "revenue"
  },
  
  // Churn
  churnedAt: {
    patterns: ["churnedAt", "churned_at", "cancellation_date", "cancelledAt"],
    type: "timestamp",
    category: "churn"
  },
  churnReason: {
    patterns: ["churnReason", "cancellation_reason", "cancelReason"],
    type: "string",
    category: "churn"
  },
  
  // Subscription
  plan: {
    patterns: ["plan", "planName", "tier", "subscription_plan"],
    type: "string",
    category: "subscription"
  },
  seatCount: {
    patterns: ["seatCount", "seats", "userCount", "licenses"],
    type: "number",
    category: "subscription"
  },
  
  // Engagement
  lastLogin: {
    patterns: ["lastLogin", "last_login", "lastActive", "lastSeen"],
    type: "timestamp",
    category: "engagement"
  },
  
  // Sales
  leadStage: {
    patterns: ["lead_stage", "leadStage", "salesStage", "pipelineStage"],
    type: "enum",
    category: "sales"
  },
  accountOwner: {
    patterns: ["accountOwner", "owner", "salesRep", "accountManager"],
    type: "string",
    category: "sales"
  }
};

function detectSaaSFields(contactSchema, companySchema) {
  const found = {};
  const missing = {};
  
  for (const [fieldKey, config] of Object.entries(SAAS_FIELD_PATTERNS)) {
    const match = findFieldMatch([...contactSchema.fields, ...companySchema.fields], config.patterns);
    if (match) {
      found[fieldKey] = {
        ...config,
        actualField: match.path,
        entity: match.entity
      };
    } else {
      missing[fieldKey] = config;
    }
  }
  
  return { found, missing };
}
```

### Pre-Discovery Report Structure

```yaml
pre_discovery_report:
  # Workspace basics
  workspace:
    total_contacts: 1270862
    total_companies: 258158
    total_activities: 232960
    data_age_months: 8
    
  # Detected business model (hypothesis)
  detected_model:
    customer_type: "b2b"
    confidence: 0.92
    signals:
      - "84.5% contacts linked to companies"
      - "258k company records present"
      - "Contact fields include jobTitle, company"
      
    pricing_model: "subscription"
    confidence: 0.65
    signals:
      - "No seat/usage fields detected"
      - "Customer tier field exists (Category_Support)"
      
    sales_motion: "hybrid"
    confidence: 0.78
    signals:
      - "Lead stage field exists (0.1% populated)"
      - "233k activity records (mostly lead-related)"
      - "Account manager field exists (3.5% populated)"
  
  # Existing SaaS fields
  existing_fields:
    lifecycle:
      - field: "company.connectivityCustomer"
        purpose: "Current customer flag"
        coverage: "0.17%"
      - field: "contact.lead_stage"
        purpose: "Lead funnel position"
        coverage: "0.11%"
    
    revenue: []  # None found
    
    churn: []  # None found
    
    engagement:
      - field: "messaging_metrics.*"
        purpose: "Email engagement"
        coverage: "High"
    
    sales:
      - field: "company.accountManager"
        purpose: "Account ownership"
        coverage: "3.5%"
      - field: "company.Category_Support"
        purpose: "Customer tier"
        coverage: "0.14%"
  
  # Missing critical fields
  missing_fields:
    critical:
      - field: "customerStatus"
        purpose: "Customer lifecycle stage"
        impact: "Can't segment by customer state"
      - field: "acv"
        purpose: "Contract value"
        impact: "Can't filter by customer value"
      - field: "churnedAt"
        purpose: "Churn date"
        impact: "Can't identify churned customers"
    
    important:
      - field: "lastLogin"
        purpose: "Product engagement"
        impact: "Can't detect inactive users"
      - field: "mrr"
        purpose: "Monthly revenue"
        impact: "Can't track revenue metrics"
  
  # Data maturity assessment
  maturity:
    level: "basic"
    score: 35
    breakdown:
      volume: 80        # Good contact/company volume
      field_coverage: 20  # Most fields sparse
      integrations: 30   # Some connectors
      custom_objects: 10  # No custom objects
      events: 40         # Activity tracking exists
  
  # Initial recommendations (before business context)
  initial_recommendations:
    - priority: "critical"
      action: "Add customerStatus field to company"
      reason: "Required for any customer lifecycle segmentation"
    - priority: "critical"  
      action: "Add acv field to company"
      reason: "Required for value-based targeting"
    - priority: "important"
      action: "Improve field coverage"
      reason: "Most fields are <5% populated"
```

### Informed Opening Message

Based on Phase 0, generate an intelligent opening:

```markdown
**Agent**:

I've scanned your Bird workspace. Here's what I found:

📊 **Your Data**
- 1.27M contacts, 258K companies
- Strong contact-company linkage (85%)
- 8 months of data history

🔍 **What I Detected**
Based on your data structure, it looks like you're a **B2B SaaS company** 
with a **hybrid sales motion** (mix of self-serve and sales-assisted).

- You have lead tracking (lead_stage field, 233k activities)
- You have account management (accountManager, customer tiers)
- 427 companies are flagged as customers

⚠️ **Key Gaps I Found**
For SaaS use cases like churn analysis and value-based targeting, you're missing:

| Gap | Impact |
|-----|--------|
| `customerStatus` enum | Can't identify churned vs active |
| `acv` / contract value | Can't filter by customer value |
| `churnedAt` timestamp | Can't target recent churns |

**Let me confirm a few things about your business to give you specific guidance:**

1. Is my assessment correct - are you B2B SaaS with both self-serve and sales? 
2. What billing system do you use? (Stripe, Chargebee, etc.)
3. What's your most important use case right now?
   - Win back churned customers
   - Identify at-risk accounts
   - Expand existing customers
   - Improve lead qualification
```

## Phase 1: Business Discovery (Informed Conversation)

Phase 1 is now a **validation and refinement** conversation, not a cold start.

### Conversation Flow (Informed by Phase 0)

```markdown
**Agent**: 
I've already scanned your workspace. Based on what I found, I have a few 
hypotheses - let me confirm them with you.

**Confirmation Questions** (pre-populated from Phase 0):

1. **Business Model Confirmation**:
   I detected you're B2B SaaS (85% of contacts linked to companies, 
   258k companies, job titles present). Is that correct?
   - [x] Yes, B2B
   - [ ] Actually B2C
   - [ ] Mixed B2B and B2C

2. **Pricing Model** (couldn't detect - no pricing fields found):
   How do you charge customers?
   - [ ] Monthly/annual subscription (fixed price)
   - [ ] Seat-based (per user)
   - [ ] Usage-based (pay for what you use)
   - [ ] Hybrid

3. **Sales Motion Confirmation**:
   I found lead_stage tracking and account managers, suggesting 
   hybrid (self-serve + sales). Correct?
   - [x] Yes, hybrid
   - [ ] Mostly self-serve
   - [ ] Mostly sales-led

4. **Data Sources** (critical for setup):
   Where does your subscription/billing data live?
   - [ ] Stripe
   - [ ] Chargebee
   - [ ] Salesforce (Opportunity/Account)
   - [ ] Internal database
   - [ ] Spreadsheets
   - [ ] Other: ___

5. **Priority Use Case**:
   Based on the gaps I found, which matters most right now?
   - [ ] **Win back churned high-value customers** (needs: customerStatus, acv, churnedAt)
   - [ ] **Identify at-risk accounts** (needs: usage data, engagement signals)
   - [ ] **Expand existing customers** (needs: usage limits, seat counts)
   - [ ] **Qualify and route leads** (needs: enriched lead_stage)
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

## Workflow Summary (Updated with Phase 0)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 0: AUTOMATED PRE-DISCOVERY (Silent, ~30 seconds)                     │
│  ───────────────────────────────────────────────────────                    │
│  • Scan catalogs, models, volumes                                           │
│  • Detect business model signals (B2B/B2C, sales motion)                    │
│  • Find existing SaaS fields, calculate coverage                            │
│  • Identify gaps, assess maturity                                           │
│  → Output: pre_discovery_report + informed opening message                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  PHASE 1: BUSINESS DISCOVERY (Informed, ~2 minutes)                         │
│  ─────────────────────────────────────────────────                          │
│  • Confirm detected business model                                          │
│  • Clarify pricing/sales motion if uncertain                                │
│  • Identify data sources (billing, CRM, product)                            │
│  • Select priority use case                                                 │
│  → Output: confirmed_business_profile                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  PHASE 2: DETAILED DATA AUDIT (Already done in Phase 0, expand here)        │
│  ──────────────────────────────────────────────────────────────────         │
│  • Deep dive on priority use case requirements                              │
│  • Field-level quality analysis                                             │
│  • Association completeness                                                 │
│  → Output: detailed_data_audit                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  PHASE 3-7: (Same as before)                                                │
│  • Use Case Requirements Mapping                                            │
│  • Gap Analysis & Prioritization                                            │
│  • Data Source Mapping                                                      │
│  • Setup Guidance                                                           │
│  • Validation                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Insight: Intelligence Before Interaction

Phase 0 transforms the conversation from:

❌ **Cold Start** (Old approach):
> "What type of business are you? B2B or B2C? What's your pricing model?"

✅ **Informed Start** (New approach):
> "I see you have 258k companies with 85% of contacts linked to them, 
> suggesting B2B. You have lead tracking and account managers, suggesting 
> hybrid sales. Is that right?"

This makes the skill:
- **Faster** - Skip questions we can answer from data
- **Smarter** - Show we understand their workspace
- **More accurate** - Validate assumptions rather than guess
- **More credible** - Demonstrate value immediately

## Next Steps

1. **Round 03**: Implement Phase 0 (Pre-Discovery) + Phase 1 (Informed Business Discovery)
2. **Round 04**: Implement Phase 2-3 (Detailed Audit + Use Case Mapping)
3. **Round 05**: Implement Phase 4-5 (Gap Analysis + Source Mapping)
4. **Round 06**: Implement Phase 6-7 (Setup Guidance + Validation)
5. **Round 07**: End-to-end testing with real workspace
