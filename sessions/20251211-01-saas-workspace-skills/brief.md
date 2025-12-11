# Session Brief: SaaS Workspace Skills

## Objective

Design and implement a comprehensive Claude skill plugin for helping Bird customers set up their workspaces for SaaS verticals.

## Scope

### Phase 1: Data Intelligence
- **Data Discovery**: Catalog exploration, model inventory, custom object identification
- **Data Quality Audit**: Field metrics (cardinality, nullity, semantics), quality scoring
- **Relationship Mapping**: Association graph, gap identification, recommendations
- **Query Analysis**: Malloy capability analysis, blocked query identification

### Phase 2: SaaS Domain Modeling  
- **Customer Lifecycle**: Lead → Trial → Customer → Churned states
- **Engagement Tracking**: Active/dormant users, usage patterns
- **Churn Detection**: Risk signals, early warning indicators
- **Segment Fragments**: Composable predicate building blocks
- **Reachability Analysis**: Channel preferences, deliverability

## Key Outcomes

1. **Plugin**: `saas-intelligence` with 9 skills
2. **Agents**: Data analyst + SaaS strategist personas
3. **Concepts**: SaaS domain knowledge documentation
4. **Task Guides**: Onboarding workflows

## Success Criteria

- Skills work with Bird's DataHub API structure
- Predicates compatible with `segmentBuilder`
- Fragments composable into complex cohorts
- Dual perspective (account + individual) supported

## Constraints

- Must use existing MCP tool patterns (`_agent`, `_intent`, `_select`)
- Query language is Malloy via `datahub.explorer:runQuery`
- Predicates via `aitools.workflows:segmentBuilder`
- Follow existing plugin structure from `bird-platform` and `bird-marketing`
