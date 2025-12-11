# Marketing Agent Skills Library - Complete Plan

## Overview

Based on the [Anthropic Agent Skills Spec](../resources/skills-libraries/anthropic/spec/agent-skills-spec.md), here's a comprehensive collection of simple, reusable, effective skills for our Marketing Agent.

**Two Categories**:
1. **Marketing Skills** - Procedural learnings for marketing functions
2. **Bird Platform Skills** - Interacting with Bird primitives and APIs

---

## Skill Format (Anthropic Spec)

Each skill is a folder with `SKILL.md`:

```markdown
---
name: skill-name
description: What the skill does and when to use it
allowed-tools: [optional list of pre-approved tools]
---

# Skill Instructions

Clear, step-by-step instructions...
```

---

## Marketing Skills (10 skills)

### 1. **audience-segmentation**
```yaml
name: audience-segmentation
description: Analyze customer data and define target audience segments based on behavior, demographics, and value
```

**What it teaches**:
- How to analyze customer segments
- Criteria for effective segmentation (size, reachability, actionability)
- Common segments (VIP, active, dormant, new)
- How to calculate segment sizes
- When to create new segments vs use existing

**Key procedures**:
- Minimum segment size: 100 contacts
- VIP definition: LTV > $1,000
- Active definition: Purchased last 30 days
- Dormant definition: No purchase 90+ days

---

### 2. **campaign-strategy**
```yaml
name: campaign-strategy
description: Design data-driven campaign strategies aligned with business goals, including objectives, targeting, messaging, and success metrics
```

**What it teaches**:
- Campaign objective types (acquisition, retention, upsell, reactivation)
- How to align campaigns with business goals
- Setting realistic targets based on past performance
- Multi-touch vs single-touch campaigns
- Campaign timing and frequency best practices

**Key procedures**:
- Always define clear, measurable objective
- Base targets on historical performance + 10-20%
- Consider customer journey stage
- Plan for 3-5 touchpoints for complex goals
- Allow 1-2 week lead time minimum

---

### 3. **email-copywriting**
```yaml
name: email-copywriting
description: Write effective email copy including subject lines, body content, and CTAs that drive engagement and conversions
```

**What it teaches**:
- Subject line best practices (personalization, urgency, clarity)
- Email structure (hook, value prop, CTA)
- CTA optimization (action-oriented, clear, prominent)
- Personalization techniques
- A/B testing approaches

**Key procedures**:
- Subject line: 40-50 characters
- Preview text: Complement subject, don't repeat
- Body: Lead with value, not features
- CTA: Use action verbs ("Get Started" not "Click Here")
- Test 2-3 subject line variants

---

### 4. **campaign-timing**
```yaml
name: campaign-timing
description: Determine optimal send times, frequency, and campaign duration based on audience behavior and industry best practices
```

**What it teaches**:
- Best send times by industry/audience
- Frequency caps to avoid fatigue
- Campaign duration planning
- Seasonal considerations
- Time zone handling

**Key procedures**:
- B2B: Tuesday-Thursday, 10am-2pm
- B2C: Evenings and weekends
- Max frequency: 2-3 emails/week
- Campaign duration: 2-6 weeks typical
- Always respect user time zone

---

### 5. **performance-analysis**
```yaml
name: performance-analysis
description: Analyze campaign metrics, identify patterns, and generate actionable insights for optimization
```

**What it teaches**:
- Key metrics (open rate, click rate, conversion rate, ROI)
- Benchmarking against baselines
- Pattern identification (what works, what doesn't)
- Statistical significance
- Actionable recommendations

**Key procedures**:
- Open rate baseline: 20-35%
- Click rate baseline: 2-8%
- Conversion rate baseline: 1-5%
- Need 100+ sends for statistical significance
- Always compare to past performance, not just industry averages

---

### 6. **ab-testing**
```yaml
name: ab-testing
description: Design and analyze A/B tests for subject lines, content, CTAs, and send times to optimize campaign performance
```

**What it teaches**:
- What to test (subject, CTA, timing, content)
- Test design (sample size, control/variant, duration)
- Statistical significance
- How to interpret results
- When to roll out winners

**Key procedures**:
- Test one variable at a time
- Minimum 1,000 contacts per variant
- Run for at least 24 hours
- Need 95% confidence to declare winner
- Document learnings for future campaigns

---

### 7. **customer-lifecycle**
```yaml
name: customer-lifecycle
description: Map customer journey stages and design appropriate campaigns for each stage (awareness, consideration, purchase, retention, advocacy)
```

**What it teaches**:
- Lifecycle stages and transitions
- Campaign types per stage
- Messaging for each stage
- Metrics per stage
- Progression strategies

**Key procedures**:
- New customers: Welcome series (3-5 emails)
- Active customers: Value reinforcement, upsells
- At-risk customers: Re-engagement (2-3 emails)
- Churned customers: Win-back (1-2 emails)
- Advocates: Referral programs

---

### 8. **budget-planning**
```yaml
name: budget-planning
description: Plan campaign budgets, estimate costs, calculate ROI, and optimize spend allocation across campaigns
```

**What it teaches**:
- Cost components (platform, creative, time)
- ROI calculation
- Budget allocation strategies
- Cost per acquisition targets
- Spend optimization

**Key procedures**:
- Email cost: $0.01-0.05 per send
- Target ROI: 3-5x minimum
- Allocate 70% to proven, 30% to experiments
- Track actual vs planned spend
- Adjust based on performance

---

### 9. **compliance-privacy**
```yaml
name: compliance-privacy
description: Ensure campaigns comply with email regulations (CAN-SPAM, GDPR, CCPA) and respect customer privacy preferences
```

**What it teaches**:
- Legal requirements by region
- Unsubscribe handling
- Consent management
- Data privacy best practices
- Suppression lists

**Key procedures**:
- Always include unsubscribe link
- Honor opt-outs within 10 days
- Don't email suppressed contacts
- Include physical address (CAN-SPAM)
- Document consent for GDPR

---

### 10. **campaign-calendar**
```yaml
name: campaign-calendar
description: Plan and coordinate multiple campaigns across time, avoiding conflicts and optimizing audience reach
```

**What it teaches**:
- Campaign scheduling
- Conflict avoidance (same audience, same time)
- Seasonal planning
- Campaign dependencies
- Resource allocation

**Key procedures**:
- Max 1 campaign per audience per week
- Plan 2-4 weeks ahead
- Block holiday periods
- Coordinate with product launches
- Leave buffer for urgent campaigns

---

## Bird Platform Skills (12 skills)

### 11. **bird-project-context**
```yaml
name: bird-project-context
description: Fetch and use Bird project metadata, foundation documents, and recent activity to inform campaign decisions
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- How to fetch project metadata (tasks:getProject)
- How to read foundation documents (content:getDocument)
- How to get recent activity (tasks:listTasks)
- How to synthesize context
- What to do if data is missing

**Key API calls**:
- `tasks:getProject` - Get project details
- `content:getDocument` - Read foundation
- `tasks:listTasks` - Get recent sessions
- `content:searchContent` - Find documents

---

### 12. **bird-audience-creation**
```yaml
name: bird-audience-creation
description: Create and manage Bird audiences using criteria, filters, and segments
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Audience creation API
- Criteria specification (filters, conditions)
- Size estimation
- Audience updates
- Best practices (naming, descriptions)

**Key API calls**:
- `data.audiences:createAudience`
- `data.audiences:getAudience`
- `data.audiences:updateAudience`
- `data.audiences:estimateSize`

---

### 13. **bird-template-management**
```yaml
name: bird-template-management
description: Create, edit, and manage email templates in Bird including HTML, variables, and personalization
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Template creation API
- HTML structure requirements
- Variable syntax ({{first_name}})
- Preview and testing
- Template versioning

**Key API calls**:
- `content.templates:createTemplate`
- `content.templates:getTemplate`
- `content.templates:updateTemplate`
- `content.templates:previewTemplate`

---

### 14. **bird-campaign-deployment**
```yaml
name: bird-campaign-deployment
description: Deploy campaigns on Bird platform including scheduling, audience targeting, and template assignment
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Campaign creation API
- Scheduling options
- Audience assignment
- Template assignment
- Status management

**Key API calls**:
- `campaigns:createCampaign`
- `campaigns:getCampaign`
- `campaigns:updateCampaign`
- `campaigns:scheduleCampaign`

---

### 15. **bird-data-queries**
```yaml
name: bird-data-queries
description: Query Bird DataHub using Malloy to analyze customer data, campaign performance, and business metrics
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Malloy query syntax
- DataHub schema (contacts, campaigns, conversions)
- Aggregations and grouping
- Filtering and conditions
- Performance optimization

**Key API calls**:
- `datahub.explorer:runQuery`
- `datahub.explorer:getSchema`

---

### 16. **bird-knowledgebase**
```yaml
name: bird-knowledgebase
description: Store and retrieve documents in Bird Knowledgebase including foundation docs, learnings, and campaign plans
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Document creation/updates
- Folder structure
- Search and retrieval
- Versioning
- Metadata management

**Key API calls**:
- `content:createDocument`
- `content:getDocument`
- `content:updateDocument`
- `content:searchContent`

---

### 17. **bird-session-tracking**
```yaml
name: bird-session-tracking
description: Track agent sessions using Bird Tasks including creating tasks, logging comments, and updating status
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Task creation for sessions
- Comment logging
- Status updates
- Metadata tracking
- Session history

**Key API calls**:
- `tasks:createTask`
- `tasks:updateTask`
- `tasks:createComment`
- `tasks:listTasks`

---

### 18. **bird-terraform-resources**
```yaml
name: bird-terraform-resources
description: Generate Terraform configurations for Bird resources including audiences, templates, campaigns, and dependencies
```

**What it teaches**:
- Terraform syntax for Bird provider
- Resource types (bird_audience, bird_template, bird_campaign)
- Dependency management (depends_on)
- Variable usage
- Output definitions

**Key patterns**:
```hcl
resource "bird_audience" "name" {
  name = "..."
  criteria = { ... }
}

resource "bird_campaign" "name" {
  audience_id = bird_audience.name.id
  depends_on = [bird_audience.name]
}
```

---

### 19. **bird-dashboard-creation**
```yaml
name: bird-dashboard-creation
description: Create dashboard.yaml files with Malloy queries for real-time campaign performance tracking
```

**What it teaches**:
- Dashboard YAML structure
- Malloy query embedding
- Metric definitions
- Alert configuration
- Visualization hints

**Key structure**:
```yaml
metrics:
  - name: Open Rate
    query: |
      ```malloy
      run: datahub.campaigns -> { ... }
      ```
alerts:
  - metric: open_rate
    condition: "< 30%"
```

---

### 20. **bird-contact-management**
```yaml
name: bird-contact-management
description: Query and manage contacts in Bird including searching, filtering, and updating contact attributes
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Contact queries
- Attribute updates
- List management
- Suppression handling
- Bulk operations

**Key API calls**:
- `data.contacts:searchContacts`
- `data.contacts:getContact`
- `data.contacts:updateContact`
- `data.contacts:addToList`

---

### 21. **bird-flow-automation**
```yaml
name: bird-flow-automation
description: Create automated workflows using Bird Flows for triggered campaigns, conditional logic, and multi-step sequences
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Flow creation API
- Trigger types (event, schedule, manual)
- Action types (send email, wait, condition)
- Conditional logic
- Flow testing

**Key API calls**:
- `flows:createFlow`
- `flows:updateFlow`
- `flows:testFlow`

---

### 22. **bird-performance-metrics**
```yaml
name: bird-performance-metrics
description: Fetch and analyze campaign performance metrics from Bird including opens, clicks, conversions, and revenue
allowed-tools: [mcp__nest-api__invoke_operation]
```

**What it teaches**:
- Metrics API
- Time-series data
- Aggregations
- Comparison queries
- Export options

**Key API calls**:
- `analytics:getCampaignMetrics`
- `analytics:getAudienceMetrics`
- `analytics:getConversionMetrics`

---

## Skill Dependencies

```
Marketing Skills (standalone, no dependencies)
├── audience-segmentation
├── campaign-strategy
├── email-copywriting
├── campaign-timing
├── performance-analysis
├── ab-testing
├── customer-lifecycle
├── budget-planning
├── compliance-privacy
└── campaign-calendar

Bird Platform Skills (depend on platform access)
├── bird-project-context (ALWAYS FIRST)
│   └── Used by all other Bird skills
├── bird-data-queries
│   └── Used by: audience-segmentation, performance-analysis
├── bird-audience-creation
│   └── Depends on: audience-segmentation
├── bird-template-management
│   └── Depends on: email-copywriting
├── bird-campaign-deployment
│   └── Depends on: campaign-strategy, audience-creation, template-management
├── bird-terraform-resources
│   └── Depends on: audience-creation, template-management, campaign-deployment
├── bird-dashboard-creation
│   └── Depends on: data-queries, performance-analysis
├── bird-knowledgebase
├── bird-session-tracking
├── bird-contact-management
├── bird-flow-automation
└── bird-performance-metrics
```

---

## Skill Composition Patterns

### Pattern 1: New Campaign (Marketing → Platform)

```
1. campaign-strategy (marketing)
   ↓
2. audience-segmentation (marketing)
   ↓
3. bird-audience-creation (platform)
   ↓
4. email-copywriting (marketing)
   ↓
5. bird-template-management (platform)
   ↓
6. campaign-timing (marketing)
   ↓
7. bird-campaign-deployment (platform)
   ↓
8. bird-terraform-resources (platform)
```

### Pattern 2: Campaign Optimization (Analysis → Action)

```
1. bird-project-context (platform)
   ↓
2. bird-performance-metrics (platform)
   ↓
3. performance-analysis (marketing)
   ↓
4. ab-testing (marketing)
   ↓
5. [Update campaign based on insights]
```

### Pattern 3: Audience Analysis (Data → Insights)

```
1. bird-project-context (platform)
   ↓
2. bird-data-queries (platform)
   ↓
3. audience-segmentation (marketing)
   ↓
4. customer-lifecycle (marketing)
   ↓
5. [Recommend campaigns for each segment]
```

---

## Implementation Priority

### Phase 1: Core Skills (Week 1) - 6 skills
**Must have for basic functionality**

1. ✅ **bird-project-context** - Context gathering (COMPLETE)
2. **campaign-strategy** - Campaign planning
3. **bird-terraform-resources** - Deployment
4. **audience-segmentation** - Targeting
5. **email-copywriting** - Content
6. **bird-audience-creation** - Audience API

### Phase 2: Enhanced Skills (Week 2) - 6 skills
**Improve quality and insights**

7. **performance-analysis** - Metrics analysis
8. **bird-performance-metrics** - Metrics API
9. **bird-dashboard-creation** - Tracking
10. **campaign-timing** - Optimization
11. **bird-data-queries** - Data access
12. **bird-template-management** - Template API

### Phase 3: Advanced Skills (Week 3) - 5 skills
**Sophisticated capabilities**

13. **ab-testing** - Experimentation
14. **customer-lifecycle** - Journey mapping
15. **bird-campaign-deployment** - Campaign API
16. **bird-flow-automation** - Automation
17. **budget-planning** - Financial planning

### Phase 4: Supporting Skills (Week 4) - 5 skills
**Nice to have**

18. **compliance-privacy** - Legal compliance
19. **campaign-calendar** - Planning
20. **bird-knowledgebase** - Documentation
21. **bird-session-tracking** - Session management
22. **bird-contact-management** - Contact API

---

## Skill File Structure

```
05-agent-prompts/skills/
├── marketing/
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
│   └── ... (7 more)
│
└── bird-platform/
    ├── bird-project-context/
    │   └── SKILL.md (✅ COMPLETE)
    ├── bird-audience-creation/
    │   ├── SKILL.md
    │   └── examples/
    │       └── criteria-examples.md
    ├── bird-terraform-resources/
    │   ├── SKILL.md
    │   └── templates/
    │       ├── audience.tf
    │       ├── template.tf
    │       └── campaign.tf
    └── ... (9 more)
```

---

## Success Metrics

### Per Skill
- **Clarity**: Agent understands when to use it
- **Completeness**: Covers all necessary procedures
- **Correctness**: Produces valid outputs
- **Reusability**: Works across different scenarios

### Overall Library
- **Coverage**: All marketing functions covered
- **Composition**: Skills work well together
- **Performance**: Agent completes tasks efficiently
- **Quality**: Outputs meet marketing standards

---

## Next Steps

1. **Week 1**: Implement 6 core skills
   - Start with `campaign-strategy`
   - Then `audience-segmentation`
   - Then platform integration skills

2. **Week 2**: Add 6 enhanced skills
   - Focus on analysis and optimization
   - Add data query capabilities

3. **Week 3**: Build 5 advanced skills
   - Sophisticated marketing capabilities
   - Advanced platform features

4. **Week 4**: Complete 5 supporting skills
   - Polish and refinement
   - Documentation and testing

---

## Skill Template (Anthropic Format)

```markdown
---
name: skill-name
description: Clear description of what this skill does and when Claude should use it
allowed-tools: [optional list of pre-approved tools]
---

# Skill Name

## When to Use This Skill

[Clear trigger conditions]

## Prerequisites

- [Required context]
- [Required tools]
- [Required data]

## Instructions

### Step 1: [First Step]
[Detailed instructions with examples]

### Step 2: [Second Step]
[Detailed instructions with examples]

### Step 3: [Third Step]
[Detailed instructions with examples]

## Examples

### Example 1: [Success Case]
**Input**: ...
**Process**: ...
**Output**: ...

### Example 2: [Edge Case]
**Input**: ...
**Process**: ...
**Output**: ...

## Best Practices

- ✅ [Do this]
- ✅ [Do that]
- ❌ [Don't do this]
- ❌ [Don't do that]

## Common Mistakes

1. [Mistake 1] → [How to avoid]
2. [Mistake 2] → [How to avoid]

## Related Skills

- [Skill that runs before]
- [Skill that runs after]
- [Alternative skill]
```

---

**Total: 22 skills (10 marketing + 12 platform)**
**Timeline: 4 weeks**
**Outcome: Complete, reusable skills library**
