# Plugin Organization Plan

## Current State

```
plugins/
└── bird-marketing/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── agents/
    │   └── marketing-advisor.md
    ├── commands/
    │   ├── campaign.md
    │   └── foundation.md
    ├── skills/
    │   ├── bird-campaign-builder/
    │   ├── bird-foundation-generator/
    │   ├── bird-marketing-methodology/
    │   └── discovery/
    ├── reference/
    │   └── api-patterns.md
    └── README.md
```

**Issues**:
- Mixed concerns (platform primitives + marketing vertical)
- Hard to reuse Bird platform skills for other verticals (sales, support, etc.)
- Marketing-specific logic tightly coupled with platform operations

---

## Proposed Structure

### Two Separate Plugins

```
plugins/
├── bird-platform/              # Platform primitives (reusable)
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   ├── bird-project-context/
│   │   ├── bird-audience-creation/
│   │   ├── bird-template-management/
│   │   ├── bird-campaign-deployment/
│   │   ├── bird-data-queries/
│   │   ├── bird-knowledgebase/
│   │   ├── bird-session-tracking/
│   │   ├── bird-terraform-resources/
│   │   ├── bird-dashboard-creation/
│   │   ├── bird-contact-management/
│   │   ├── bird-flow-automation/
│   │   └── bird-performance-metrics/
│   ├── reference/
│   │   ├── api-reference.md
│   │   ├── malloy-queries.md
│   │   └── terraform-templates.md
│   └── README.md
│
└── bird-marketing/             # Marketing vertical (depends on platform)
    ├── .claude-plugin/
    │   └── plugin.json
    ├── agents/
    │   ├── marketing-manager.md      # Orchestrator, quality control
    │   ├── analyst.md                # Data expert, dashboards
    │   ├── strategist.md             # Brand guardian, strategy
    │   ├── industry-expert.md        # Vertical specialist
    │   ├── campaign-manager.md       # Execution, creative
    │   └── targetter.md              # Audience expert
    ├── skills/
    │   ├── audience-segmentation/
    │   ├── campaign-strategy/
    │   ├── email-copywriting/
    │   ├── campaign-timing/
    │   ├── performance-analysis/
    │   ├── ab-testing/
    │   ├── customer-lifecycle/
    │   ├── budget-planning/
    │   ├── compliance-privacy/
    │   └── campaign-calendar/
    ├── reference/
    │   ├── 5s-framework.md
    │   ├── benchmarks.md
    │   └── templates/
    │       ├── acquisition.md
    │       ├── retention.md
    │       └── reactivation.md
    └── README.md
```

---

## Plugin 1: bird-platform

### Purpose
**Platform primitives and API operations - reusable across all verticals**

### plugin.json
```json
{
  "name": "bird-platform",
  "description": "Core Bird platform operations including projects, audiences, campaigns, templates, and data queries. Foundation for all Bird-based agents.",
  "version": "1.0.0",
  "author": {
    "name": "Bird",
    "url": "https://bird.com"
  },
  "license": "MIT",
  "keywords": ["bird", "platform", "api", "crm", "automation"],
  "category": "platform",
  "skills": [
    "./skills/bird-project-context",
    "./skills/bird-audience-creation",
    "./skills/bird-template-management",
    "./skills/bird-campaign-deployment",
    "./skills/bird-data-queries",
    "./skills/bird-knowledgebase",
    "./skills/bird-session-tracking",
    "./skills/bird-terraform-resources",
    "./skills/bird-dashboard-creation",
    "./skills/bird-contact-management",
    "./skills/bird-flow-automation",
    "./skills/bird-performance-metrics"
  ],
  "dependencies": []
}
```

### Skills (12 total)

#### 1. **bird-project-context** ✅
```yaml
name: bird-project-context
description: Fetch Bird project metadata, foundation documents, and recent activity to establish session context
allowed-tools: [mcp__nest-api__invoke_operation]
```
**Status**: Already implemented in design session

#### 2. **bird-audience-creation**
```yaml
name: bird-audience-creation
description: Create and manage Bird audiences using segmentBuilder API with natural language criteria or structured filters
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 3. **bird-template-management**
```yaml
name: bird-template-management
description: Create, update, and manage email/SMS templates with variables, personalization, and multi-channel support
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 4. **bird-campaign-deployment**
```yaml
name: bird-campaign-deployment
description: Deploy campaigns on Bird platform including scheduling, audience targeting, and template assignment
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 5. **bird-data-queries**
```yaml
name: bird-data-queries
description: Query Bird DataHub using Malloy for customer analytics, campaign metrics, and business intelligence
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 6. **bird-knowledgebase**
```yaml
name: bird-knowledgebase
description: Store and retrieve documents in Bird Knowledgebase including foundation docs, learnings, and plans
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 7. **bird-session-tracking**
```yaml
name: bird-session-tracking
description: Track agent sessions using Bird Tasks API including task creation, comments, and status updates
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 8. **bird-terraform-resources**
```yaml
name: bird-terraform-resources
description: Generate Terraform configurations for Bird resources with proper dependencies and state management
```

#### 9. **bird-dashboard-creation**
```yaml
name: bird-dashboard-creation
description: Create dashboard.yaml files with embedded Malloy queries for real-time performance tracking
```

#### 10. **bird-contact-management**
```yaml
name: bird-contact-management
description: Query and manage contacts including search, filtering, attribute updates, and list management
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 11. **bird-flow-automation**
```yaml
name: bird-flow-automation
description: Create automated workflows using Bird Flows for triggered campaigns and multi-step sequences
allowed-tools: [mcp__nest-api__invoke_operation]
```

#### 12. **bird-performance-metrics**
```yaml
name: bird-performance-metrics
description: Fetch campaign performance metrics including opens, clicks, conversions, and revenue analytics
allowed-tools: [mcp__nest-api__invoke_operation]
```

---

## Plugin 2: bird-marketing

### Purpose
**Marketing-specific strategies, methodologies, and vertical expertise**

### plugin.json
```json
{
  "name": "bird-marketing",
  "description": "Expert marketing strategies and methodologies for Bird platform. Includes 5S framework, campaign planning, copywriting, and performance optimization.",
  "version": "3.0.0",
  "author": {
    "name": "Bird",
    "url": "https://bird.com"
  },
  "license": "MIT",
  "keywords": ["marketing", "campaigns", "strategy", "5S", "copywriting", "optimization"],
  "category": "marketing",
  "agents": [
    "./agents/marketing-manager.md",
    "./agents/analyst.md",
    "./agents/strategist.md",
    "./agents/industry-expert.md",
    "./agents/campaign-manager.md",
    "./agents/targetter.md"
  ],
  "skills": [
    "./skills/audience-segmentation",
    "./skills/campaign-strategy",
    "./skills/email-copywriting",
    "./skills/campaign-timing",
    "./skills/performance-analysis",
    "./skills/ab-testing",
    "./skills/customer-lifecycle",
    "./skills/budget-planning",
    "./skills/compliance-privacy",
    "./skills/campaign-calendar"
  ],
  "dependencies": [
    "bird-platform@^1.0.0"
  ]
}
```

### Agents (6 total - Multi-Agent Team)

#### 1. **marketing-manager** (Orchestrator)
```yaml
name: marketing-manager
model: claude-sonnet-4.5
description: Project lead ensuring goals are clear, measurable, and executed properly. Coordinates team, ensures compliance, and manages human-in-the-loop approval.
```
**Capabilities**:
- Goal setting and KPI definition
- Strategy validation
- Quality control and compliance
- Execution management
- Team coordination
- Uses: campaign-strategy, compliance-privacy, campaign-calendar, budget-planning

#### 2. **analyst** (Data Expert)
```yaml
name: analyst
model: claude-sonnet-4.5
description: Data expert who understands workspace data model, metrics, custom objects/events, and creates dashboards for team decision-making.
```
**Capabilities**:
- Data model discovery
- Metrics expertise
- Dashboard creation (living notebooks)
- Ad-hoc queries and reporting
- Uses: bird-data-queries, bird-dashboard-creation, bird-performance-metrics, performance-analysis

#### 3. **strategist** (Brand Guardian)
```yaml
name: strategist
model: claude-sonnet-4.5
description: Brand guardian who ensures consistency, understands overall marketing initiatives, and applies industry frameworks and best practices.
```
**Capabilities**:
- Brand guidelines enforcement
- Strategic context and coherence
- Framework application (5S, AIDA, etc.)
- Cross-campaign coordination
- Uses: campaign-strategy, customer-lifecycle, campaign-calendar, compliance-privacy

#### 4. **industry-expert** (Vertical Specialist)
```yaml
name: industry-expert
model: claude-sonnet-4.5
description: Vertical specialist with deep industry knowledge, competitor insights, benchmarks, and best practices for specific industries.
```
**Capabilities**:
- Industry-specific insights
- Benchmarking and competitive analysis
- Strategic consulting
- Results interpretation in industry context
- Uses: performance-analysis, campaign-strategy, customer-lifecycle

#### 5. **campaign-manager** (Creative Team)
```yaml
name: campaign-manager
model: claude-sonnet-4.5
description: Execution specialists who design campaigns, write copy, plan A/B tests, organize sequences, and adjust based on results.
```
**Capabilities**:
- Campaign design and orchestration
- Content creation and copywriting
- A/B testing
- Multi-touch sequences
- Performance optimization
- Uses: email-copywriting, campaign-timing, ab-testing, customer-lifecycle, campaign-calendar

#### 6. **targetter** (Audience Expert)
```yaml
name: targetter
model: claude-sonnet-4.5
description: Audience expert who intimately knows the user base, creates segments and cohorts, and finds optimal audiences based on attributes and behavior.
```
**Capabilities**:
- Data model mastery
- Audience segmentation
- Event analysis (semantic + custom)
- Audience recommendations
- Uses: bird-audience-creation, audience-segmentation, customer-lifecycle

### Skills (10 total)

All marketing skills from SKILLS-LIBRARY-PLAN.md (skills 1-10)

---

## Future Plugins (Extensibility)

### bird-sales
```json
{
  "name": "bird-sales",
  "description": "Sales automation and lead nurturing for Bird platform",
  "dependencies": ["bird-platform@^1.0.0"],
  "agents": ["sales-advisor.md"],
  "skills": [
    "lead-scoring",
    "sales-sequences",
    "pipeline-management"
  ]
}
```

### bird-support
```json
{
  "name": "bird-support",
  "description": "Customer support and service automation for Bird platform",
  "dependencies": ["bird-platform@^1.0.0"],
  "agents": ["support-advisor.md"],
  "skills": [
    "ticket-routing",
    "response-templates",
    "satisfaction-tracking"
  ]
}
```

### bird-analytics
```json
{
  "name": "bird-analytics",
  "description": "Advanced analytics and reporting for Bird platform",
  "dependencies": ["bird-platform@^1.0.0"],
  "agents": ["data-analyst.md"],
  "skills": [
    "cohort-analysis",
    "attribution-modeling",
    "predictive-analytics"
  ]
}
```

---

## Migration Plan

### Phase 1: Extract Platform Skills (Week 1)

1. **Create bird-platform plugin**
   ```bash
   mkdir -p plugins/bird-platform/{skills,reference}
   ```

2. **Move platform-specific skills**
   - Extract from bird-marketing
   - Create new skills per spec
   - Add reference documentation

3. **Test platform skills independently**
   - Verify API operations work
   - Test skill composition
   - Validate outputs

### Phase 2: Refactor Marketing Plugin (Week 2)

1. **Update bird-marketing**
   - Remove platform operations
   - Keep marketing methodologies
   - Add dependency on bird-platform

2. **Split agents**
   - Keep marketing-advisor
   - Create campaign-strategist
   - Create content-specialist

3. **Reorganize skills**
   - Pure marketing skills only
   - Reference platform skills via dependency

### Phase 3: Update System Prompts (Week 2)

1. **Update agent prompts**
   - Reference platform skills explicitly
   - Compose skills from both plugins
   - Update examples

2. **Update skill references**
   - Platform skills: `@bird-platform/bird-audience-creation`
   - Marketing skills: `@bird-marketing/campaign-strategy`

### Phase 4: Testing & Documentation (Week 3)

1. **Integration testing**
   - Test skill composition across plugins
   - Verify dependency resolution
   - Test all agent workflows

2. **Documentation**
   - Update READMEs
   - Document plugin architecture
   - Create migration guide

---

## Skill Composition Examples

### Example 1: New Campaign (Cross-Plugin)

```yaml
# Uses skills from BOTH plugins
workflow:
  - bird-platform/bird-project-context     # Get context
  - bird-marketing/campaign-strategy       # Design strategy
  - bird-marketing/audience-segmentation   # Define audience
  - bird-platform/bird-audience-creation   # Create audience
  - bird-marketing/email-copywriting       # Write copy
  - bird-platform/bird-template-management # Create template
  - bird-marketing/campaign-timing         # Optimize timing
  - bird-platform/bird-campaign-deployment # Deploy campaign
  - bird-platform/bird-terraform-resources # Generate terraform
```

### Example 2: Performance Analysis (Marketing-Heavy)

```yaml
workflow:
  - bird-platform/bird-project-context      # Get context
  - bird-platform/bird-performance-metrics  # Fetch metrics
  - bird-marketing/performance-analysis     # Analyze patterns
  - bird-marketing/ab-testing              # Design tests
  - [Recommendations for optimization]
```

### Example 3: Content Optimization (Content Specialist)

```yaml
workflow:
  - bird-platform/bird-project-context     # Get context
  - bird-platform/bird-data-queries        # Get engagement data
  - bird-marketing/email-copywriting       # Generate copy
  - bird-marketing/ab-testing             # Design A/B test
  - bird-platform/bird-template-management # Create variants
```

---

## Benefits of This Structure

### 1. **Separation of Concerns**
- ✅ Platform operations isolated
- ✅ Marketing logic separated
- ✅ Clear boundaries

### 2. **Reusability**
- ✅ Platform skills work for sales, support, analytics
- ✅ Marketing skills reference platform via dependency
- ✅ Easy to create new vertical plugins

### 3. **Maintainability**
- ✅ Platform changes don't affect marketing logic
- ✅ Marketing improvements don't touch platform
- ✅ Clear ownership

### 4. **Testability**
- ✅ Test platform skills independently
- ✅ Test marketing skills independently
- ✅ Test integration separately

### 5. **Extensibility**
- ✅ Add new verticals (sales, support) easily
- ✅ Share platform skills across verticals
- ✅ Compose skills flexibly

---

## Implementation Checklist

### bird-platform Plugin
- [ ] Create plugin structure
- [ ] Write plugin.json
- [ ] Implement 12 platform skills
- [ ] Add API reference docs
- [ ] Add Malloy query examples
- [ ] Add Terraform templates
- [ ] Write README
- [ ] Test independently

### bird-marketing Plugin
- [ ] Update plugin.json (add dependency)
- [ ] Remove platform operations
- [ ] Keep marketing-advisor agent
- [ ] Create campaign-strategist agent
- [ ] Create content-specialist agent
- [ ] Implement 10 marketing skills
- [ ] Add 5S framework docs
- [ ] Add benchmark reference
- [ ] Add campaign templates
- [ ] Update README
- [ ] Test with platform dependency

### Integration
- [ ] Test skill composition
- [ ] Test agent workflows
- [ ] Verify dependency resolution
- [ ] Update system prompts
- [ ] Document architecture
- [ ] Create migration guide

---

## File Structure (Complete)

```
plugins/
├── bird-platform/
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/
│   │   ├── bird-project-context/
│   │   │   └── SKILL.md
│   │   ├── bird-audience-creation/
│   │   │   ├── SKILL.md
│   │   │   └── examples/
│   │   │       └── criteria-examples.md
│   │   ├── bird-template-management/
│   │   │   ├── SKILL.md
│   │   │   └── examples/
│   │   │       └── template-examples.md
│   │   ├── bird-campaign-deployment/
│   │   │   └── SKILL.md
│   │   ├── bird-data-queries/
│   │   │   ├── SKILL.md
│   │   │   └── examples/
│   │   │       └── malloy-queries.md
│   │   ├── bird-knowledgebase/
│   │   │   └── SKILL.md
│   │   ├── bird-session-tracking/
│   │   │   └── SKILL.md
│   │   ├── bird-terraform-resources/
│   │   │   ├── SKILL.md
│   │   │   └── templates/
│   │   │       ├── audience.tf
│   │   │       ├── template.tf
│   │   │       └── campaign.tf
│   │   ├── bird-dashboard-creation/
│   │   │   ├── SKILL.md
│   │   │   └── examples/
│   │   │       └── dashboard-templates.yaml
│   │   ├── bird-contact-management/
│   │   │   └── SKILL.md
│   │   ├── bird-flow-automation/
│   │   │   └── SKILL.md
│   │   └── bird-performance-metrics/
│   │       └── SKILL.md
│   ├── reference/
│   │   ├── api-reference.md
│   │   ├── malloy-queries.md
│   │   └── terraform-templates.md
│   └── README.md
│
└── bird-marketing/
    ├── .claude-plugin/
    │   └── plugin.json
    ├── agents/
    │   ├── marketing-advisor.md
    │   ├── campaign-strategist.md
    │   └── content-specialist.md
    ├── skills/
    │   ├── audience-segmentation/
    │   │   └── SKILL.md
    │   ├── campaign-strategy/
    │   │   ├── SKILL.md
    │   │   └── templates/
    │   │       ├── acquisition.md
    │   │       ├── retention.md
    │   │       └── reactivation.md
    │   ├── email-copywriting/
    │   │   ├── SKILL.md
    │   │   └── examples/
    │   │       ├── subject-lines.md
    │   │       └── cta-examples.md
    │   ├── campaign-timing/
    │   │   └── SKILL.md
    │   ├── performance-analysis/
    │   │   └── SKILL.md
    │   ├── ab-testing/
    │   │   └── SKILL.md
    │   ├── customer-lifecycle/
    │   │   └── SKILL.md
    │   ├── budget-planning/
    │   │   └── SKILL.md
    │   ├── compliance-privacy/
    │   │   └── SKILL.md
    │   └── campaign-calendar/
    │       └── SKILL.md
    ├── reference/
    │   ├── 5s-framework.md
    │   ├── benchmarks.md
    │   └── templates/
    │       ├── acquisition.md
    │       ├── retention.md
    │       └── reactivation.md
    └── README.md
```

---

## Next Steps

1. **Review this plan** - Get feedback on structure
2. **Start with bird-platform** - Create plugin, implement core skills
3. **Refactor bird-marketing** - Remove platform ops, add dependency
4. **Test integration** - Verify skills compose correctly
5. **Document** - Update all READMEs and guides

**Estimated effort**: 3 weeks
- Week 1: bird-platform plugin (12 skills)
- Week 2: bird-marketing refactor (10 skills + 3 agents)
- Week 3: Integration testing + documentation
