# 01: Semantic Layer Architecture

## The Big Insight: A SaaS Semantic Package

We're building a **vertical-specific semantic layer** that sits on TOP of Bird's platform semantics.

Bird already provides semantic data catalogs:
- `bird:crm` → Contacts, companies, lists
- `bird:web` → Page views, sessions, visitors  
- `bird:messaging` → Email opens, clicks, deliveries

These are **platform semantics** — generic, horizontal, applicable to any business.

What's missing is **vertical semantics** — SaaS-specific concepts derived from combining platform data with customer's custom data.

## The Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      THE SAAS SEMANTIC PACKAGE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: BUSINESS QUESTIONS                                        │   │
│  │  ───────────────────────────────                                    │   │
│  │  "Churned enterprise customers who were power users"                │   │
│  │  "Trial users most likely to convert"                               │   │
│  │  "At-risk accounts by revenue tier"                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ▲                                              │
│                              │ Compose                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: SAAS VERTICAL SEMANTICS                        ◄── WE    │   │
│  │  ────────────────────────────────                            BUILD │   │
│  │                                                              THIS  │   │
│  │  LIFECYCLE        ENGAGEMENT         INTENT          VALUE         │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │   │
│  │  │ Customer │    │  Active  │    │ Purchase │    │Enterprise│     │   │
│  │  │  Status  │    │  Users   │    │  Intent  │    │ Accounts │     │   │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐     │   │
│  │  │ Churned  │    │  Power   │    │  Churn   │    │High Value│     │   │
│  │  │Customers │    │  Users   │    │  Risk    │    │ Accounts │     │   │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘     │   │
│  │                                                                    │   │
│  │  Tailored to THIS customer's business model and data              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ▲                                              │
│                              │ Enriches + Derives from                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: BIRD PLATFORM SEMANTICS (Pre-built)                       │   │
│  │  ────────────────────────────────────────────                       │   │
│  │                                                                     │   │
│  │  bird:crm          bird:web           bird:messaging                │   │
│  │  ┌──────────┐     ┌──────────┐       ┌──────────┐                  │   │
│  │  │ Contacts │     │Page Views│       │Email Open│                  │   │
│  │  │Companies │     │ Sessions │       │  Clicks  │                  │   │
│  │  │  Lists   │     │ Visitors │       │ Delivery │                  │   │
│  │  └──────────┘     └──────────┘       └──────────┘                  │   │
│  │                                                                     │   │
│  │  Generic, horizontal, works for any business                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ▲                                              │
│                              │ Built on                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: CUSTOMER'S RAW DATA                                       │   │
│  │  ────────────────────────────                                       │   │
│  │                                                                     │   │
│  │  ws:default (Custom Objects & Events)                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ subscription │  │   invoice    │  │  user-login  │              │   │
│  │  │    (obj)     │  │    (obj)     │  │   (event)    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                     │   │
│  │  Business-specific, uninterpreted, needs semantic mapping          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## What the SaaS Semantic Package Does

| Action | Example |
|--------|---------|
| **Leverage existing** | Use `bird:web` page views to detect "Pricing Page Visitors" |
| **Add intelligence** | Compute engagement scores from login frequency |
| **Derive relationships** | Link `subscription` → `company` if not already associated |
| **Identify gaps** | "You have subscriptions but no `churnedAt` field" |
| **Recommend new objects** | "Create a `health_score` computed field on company" |
| **Build segments** | Create actual Bird audiences as reusable building blocks |

## Why a Semantic Layer?

| Without Semantic Layer | With Semantic Layer |
|------------------------|---------------------|
| User must understand data model | User thinks in business concepts |
| Complex predicates for each query | Compose named segments |
| Repeated logic across campaigns | Define once, reuse everywhere |
| Tribal knowledge required | Self-documenting building blocks |
| Hard to validate correctness | Each segment is testable |
| "What does this query mean?" | "Churned ∩ Enterprise = obvious" |

## The Skill's Mission

**Transform raw DataHub data into a rich semantic layer of composable segments that encode SaaS business logic.**

The skill doesn't just *analyze* data—it **builds understanding** by:

1. **Discovering** what raw data exists (DataHub models, events, fields)
2. **Interpreting** what it means (page paths → behaviors, events → engagement)
3. **Proposing** semantic concepts (segments with business meaning)
4. **Guiding** the user to fill gaps (missing fields, new data sources)
5. **Creating** the building blocks (actual audience segments in Bird)
6. **Enabling** complex queries through composition (not raw predicates)

## Analogy: Like dbt for Customer Data

| Data Warehouse World | Bird World |
|---------------------|------------|
| Raw tables | DataHub models |
| dbt models / metrics | Audience segments |
| dbt semantic layer | Segment catalog |
| SQL queries | Predicate compositions |
| Metrics definitions | Engagement scores, lifecycle stages |
| Data tests | Segment validation |

## The Six Domains

| Domain | Concepts | Built From |
|--------|----------|------------|
| **Lifecycle** | Prospect, Trial, Customer, Churned, Paused | subscription object, customerStatus |
| **Engagement** | Active Users, Power Users, Dormant, Declining | login events (custom + bird:web) |
| **Intent** | Purchase Intent, Expansion Intent, Churn Intent | bird:web page patterns |
| **Value** | Enterprise, SMB, High Value Churned | ACV/plan/employee data |
| **Reachability** | Email/SMS/Push Reachable, Unreachable | bird:messaging + identifiers |
| **Behavioral** | Docs Readers, Blog Readers, Custom Patterns | bird:web page views |
