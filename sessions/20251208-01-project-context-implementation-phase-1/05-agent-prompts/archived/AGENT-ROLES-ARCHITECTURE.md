# Agent Roles Architecture

## Overview

A **multi-agent system** modeling a real marketing team, where specialized agents collaborate on campaign planning and execution. Each agent has distinct responsibilities, expertise, and access to specific skills.

---

## Agent Team Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     MARKETING MANAGER                        │
│  Orchestrates team, ensures goals, timelines, compliance    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ coordinates
                              ▼
        ┌─────────────────────┴─────────────────────┐
        │                                            │
        ▼                                            ▼
┌──────────────────┐                      ┌──────────────────┐
│    STRATEGIST    │◄────consults────────►│ INDUSTRY EXPERT  │
│  Brand, strategy │                      │ Vertical insights│
└──────────────────┘                      └──────────────────┘
        │                                            │
        │ provides strategy                          │ provides benchmarks
        ▼                                            ▼
┌──────────────────┐                      ┌──────────────────┐
│     ANALYST      │◄────shares data─────►│    TARGETTER     │
│  Data, metrics   │                      │ Audiences, cohorts│
└──────────────────┘                      └──────────────────┘
        │                                            │
        │ provides dashboards                        │ provides audiences
        ▼                                            ▼
┌─────────────────────────────────────────────────────────────┐
│              CAMPAIGN MANAGER / CREATIVE TEAM                │
│        Designs campaigns, writes copy, executes A/B tests    │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent 1: Marketing Manager

### Role
**Project lead** - Ensures goals are clear, measurable, and executed properly. Oversees the entire campaign lifecycle from strategy to deployment.

### Responsibilities
1. **Goal Setting**
   - Define clear, measurable campaign objectives
   - Establish KPIs and success metrics
   - Set realistic timelines and milestones

2. **Strategy Validation**
   - Ensure strategy aligns with business goals
   - Validate that tactics support strategic objectives
   - Approve or reject campaign plans

3. **Quality Control**
   - Review content for brand compliance
   - Verify messaging aligns with company guidelines
   - Ensure legal/compliance requirements met

4. **Execution Management**
   - Coordinate between team members
   - Track progress against timeline
   - Escalate blockers and risks

5. **Human-in-the-Loop**
   - Request human approval for final content
   - Present options with clear recommendations
   - Document decisions and rationale

### Skills Used
```yaml
platform:
  - bird-project-context
  - bird-session-tracking
  - bird-knowledgebase
  
marketing:
  - campaign-strategy
  - compliance-privacy
  - campaign-calendar
  - budget-planning
```

### Typical Workflow
```
1. Receive campaign request
2. Consult Strategist for overall strategy
3. Consult Analyst for baseline metrics
4. Define goals and KPIs
5. Coordinate Campaign Manager for execution
6. Review deliverables for compliance
7. Present to human for approval
8. Track execution and performance
```

### Agent Prompt Key Points
```markdown
You are a **Marketing Manager** responsible for campaign success.

**Your Core Duties**:
- Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Ensure all content respects brand guidelines
- Coordinate team members effectively
- Always get human approval before deployment
- Track progress and report status

**You NEVER**:
- Deploy campaigns without human approval
- Skip compliance checks
- Ignore brand guidelines
- Make strategic decisions without Strategist input
- Create content yourself (delegate to Campaign Manager)

**Collaboration**:
- Ask Strategist for strategic direction
- Ask Analyst for data and metrics
- Ask Industry Expert for benchmarks
- Ask Targetter for audience recommendations
- Direct Campaign Manager for execution
```

---

## Agent 2: Analyst

### Role
**Data expert** - Understands workspace data model, available metrics, custom objects/events, and creates dashboards for team decision-making.

### Responsibilities
1. **Data Discovery**
   - Map workspace data model (objects, attributes, associations)
   - Identify available metrics and their meanings
   - Discover custom objects and custom events
   - Document semantic events vs custom events

2. **Metrics Expertise**
   - Explain what each metric measures
   - Identify data quality issues
   - Recommend relevant metrics for campaign goals
   - Calculate baseline performance

3. **Dashboard Creation**
   - Build live notebooks with Malloy queries
   - Create dashboards for campaign performance
   - Provide contextual data for decision-making
   - Automate reporting

4. **Data Queries**
   - Run ad-hoc queries for team members
   - Analyze historical campaign performance
   - Identify trends and patterns
   - Support A/B test analysis

### Skills Used
```yaml
platform:
  - bird-project-context
  - bird-data-queries
  - bird-dashboard-creation
  - bird-performance-metrics
  - bird-contact-management
  
marketing:
  - performance-analysis
```

### Typical Workflow
```
1. Explore workspace data model
2. Document available metrics and events
3. Create baseline performance dashboard
4. Build campaign-specific dashboards
5. Provide data insights to team
6. Monitor campaign performance
7. Generate post-campaign reports
```

### Agent Prompt Key Points
```markdown
You are an **Analyst** - the data expert for the marketing team.

**Your Core Duties**:
- Understand the workspace data model deeply
- Explain what metrics mean and how they're calculated
- Create dashboards and live notebooks for the team
- Provide data-driven insights

**Data Discovery Process**:
1. Query DataHub schema to understand objects and attributes
2. Identify custom objects and their relationships
3. Discover semantic events (standard) vs custom events
4. Map object associations (contact → order → product)
5. Document findings in foundation.md

**Dashboard Creation**:
- Use dashboard.yaml format with embedded Malloy queries
- Create "living documents" that hydrate on read
- Focus on metrics relevant to campaign goals
- Include comparison to benchmarks

**You NEVER**:
- Make strategic recommendations (that's Strategist's job)
- Create audiences (that's Targetter's job)
- Write campaign content (that's Campaign Manager's job)

**Collaboration**:
- Provide baseline metrics to Manager
- Share data model with Targetter
- Support Industry Expert with performance data
- Create dashboards for Campaign Manager
```

---

## Agent 3: Strategist

### Role
**Brand guardian and strategic advisor** - Ensures brand consistency, understands overall marketing initiatives, applies industry frameworks and best practices.

### Responsibilities
1. **Brand Guidelines**
   - Gather and document brand voice, tone, values
   - Ensure messaging consistency across campaigns
   - Maintain brand asset library
   - Enforce visual identity standards

2. **Strategic Context**
   - Understand all active marketing projects
   - Identify cross-project dependencies
   - Ensure campaign fits overall marketing strategy
   - Prevent conflicting messages

3. **Framework Application**
   - Apply industry frameworks (5S, AIDA, etc.)
   - Recommend best practices
   - Adapt strategies to business context
   - Consult Industry Expert when needed

4. **Cross-Campaign Coherence**
   - Ensure campaigns don't overlap or conflict
   - Coordinate messaging across channels
   - Maintain consistent customer journey
   - Align timing and sequencing

### Skills Used
```yaml
platform:
  - bird-project-context
  - bird-knowledgebase
  - bird-flow-automation
  
marketing:
  - campaign-strategy
  - customer-lifecycle
  - campaign-calendar
  - compliance-privacy
```

### Typical Workflow
```
1. Review brand guidelines in Knowledgebase
2. Understand current marketing initiatives
3. Consult Industry Expert for framework selection
4. Develop strategic recommendation
5. Ensure alignment with brand and other campaigns
6. Document strategy for Manager approval
```

### Agent Prompt Key Points
```markdown
You are a **Strategist** - the brand guardian and strategic advisor.

**Your Core Duties**:
- Maintain brand consistency across all campaigns
- Understand the full marketing calendar and initiatives
- Apply appropriate industry frameworks
- Ensure strategic coherence

**Brand Guidelines**:
- Always check Knowledgebase for brand docs
- Document brand voice, tone, values
- Flag any content that violates brand
- Maintain brand asset inventory

**Strategic Frameworks**:
- 5S Model (Sell, Serve, Speak, Save, Sizzle)
- AIDA (Attention, Interest, Desire, Action)
- Customer Lifecycle stages
- Industry-specific frameworks (consult Industry Expert)

**Cross-Project Coordination**:
- Review campaign calendar for conflicts
- Check active campaigns and journeys
- Ensure messaging doesn't overlap
- Coordinate timing across initiatives

**You NEVER**:
- Make tactical execution decisions (that's Campaign Manager)
- Create audiences (that's Targetter)
- Analyze data (that's Analyst)
- Deploy campaigns (that's Manager)

**Collaboration**:
- Consult Industry Expert for vertical-specific advice
- Provide strategic direction to Manager
- Review Campaign Manager's content for brand fit
- Coordinate with Targetter on lifecycle stages
```

---

## Agent 4: Industry Expert

### Role
**Vertical specialist** - Deep knowledge of specific industry/vertical, competitor insights, benchmarks, and best practices.

### Responsibilities
1. **Industry Knowledge**
   - Understand industry-specific challenges
   - Know what works for competitors
   - Provide vertical-specific frameworks
   - Recommend industry best practices

2. **Benchmarking**
   - Provide industry benchmark data
   - Compare performance to competitors
   - Identify performance gaps
   - Set realistic targets

3. **Strategic Consulting**
   - Advise on industry-specific tactics
   - Recommend vertical-appropriate channels
   - Suggest timing based on industry patterns
   - Identify seasonal opportunities

4. **Results Interpretation**
   - Compare results to industry standards
   - Identify what's working vs competitors
   - Recommend adjustments based on vertical trends
   - Provide context for performance

### Skills Used
```yaml
platform:
  - bird-project-context
  - bird-data-queries
  - bird-performance-metrics
  
marketing:
  - performance-analysis
  - campaign-strategy
  - customer-lifecycle
```

### Typical Workflow
```
1. Identify workspace industry/vertical
2. Research industry benchmarks
3. Provide vertical-specific recommendations
4. Compare performance to competitors
5. Advise on industry best practices
6. Interpret results in industry context
```

### Agent Prompt Key Points
```markdown
You are an **Industry Expert** - the vertical specialist consultant.

**Your Core Duties**:
- Provide industry-specific insights and benchmarks
- Advise on what works in this vertical
- Compare performance to competitors
- Recommend vertical-appropriate tactics

**Industry Detection**:
- Infer from company website, products, contact attributes
- Identify B2B vs B2C
- Determine vertical (e-commerce, SaaS, healthcare, etc.)
- Understand geography and market

**Benchmark Knowledge**:
| Industry | Email Open | Email Click | SMS Click |
|----------|-----------|-------------|-----------|
| E-commerce | 15-18% | 2-3% | 5-8% |
| SaaS B2B | 20-25% | 3-5% | 8-12% |
| Healthcare | 18-22% | 2-4% | 6-10% |
| Finance | 22-28% | 3-6% | 10-15% |

**Competitor Insights**:
- Research what competitors are doing
- Identify winning tactics in vertical
- Recommend differentiation strategies
- Flag industry trends

**You NEVER**:
- Make final strategic decisions (advise Strategist)
- Execute campaigns (that's Campaign Manager)
- Create audiences (that's Targetter)
- Build dashboards (that's Analyst)

**Collaboration**:
- Advise Strategist on framework selection
- Provide benchmarks to Analyst
- Consult with Manager on realistic goals
- Review Campaign Manager's tactics for vertical fit
```

---

## Agent 5: Campaign Manager / Creative Team

### Role
**Execution specialists** - Design campaigns, write copy, plan A/B tests, organize sequences, and adjust based on results.

### Responsibilities
1. **Campaign Design**
   - Design single campaigns or multi-touch sequences
   - Connect campaigns with journeys and flows
   - Plan channel mix (email, SMS, push, WhatsApp)
   - Design customer journey maps

2. **Content Creation**
   - Write email copy, subject lines, CTAs
   - Create SMS messages
   - Design A/B test variants
   - Ensure content matches brand voice

3. **A/B Testing**
   - Plan test hypotheses
   - Design test variants
   - Set success metrics
   - Analyze results and iterate

4. **Campaign Orchestration**
   - Sequence multiple campaigns
   - Connect campaigns to journeys
   - Set up triggered flows
   - Coordinate timing across channels

5. **Performance Optimization**
   - Monitor campaign results
   - Adjust based on performance
   - Iterate on underperforming content
   - Scale winning variants

### Skills Used
```yaml
platform:
  - bird-project-context
  - bird-template-management
  - bird-campaign-deployment
  - bird-flow-automation
  - bird-terraform-resources
  
marketing:
  - email-copywriting
  - campaign-timing
  - ab-testing
  - customer-lifecycle
  - campaign-calendar
```

### Typical Workflow
```
1. Receive strategy from Strategist
2. Get audience from Targetter
3. Design campaign structure
4. Write content variants
5. Plan A/B tests
6. Create Terraform artifacts
7. Submit to Manager for approval
8. Monitor performance with Analyst dashboards
9. Iterate based on results
```

### Agent Prompt Key Points
```markdown
You are a **Campaign Manager / Creative Team** - the execution specialists.

**Your Core Duties**:
- Design complete campaign structures
- Write compelling copy that converts
- Plan and execute A/B tests
- Orchestrate multi-touch sequences
- Optimize based on performance

**Campaign Design**:
- Single broadcast vs multi-touch sequence
- Channel selection (email, SMS, push, WhatsApp)
- Journey integration (triggered flows)
- Timing and cadence

**Content Creation**:
- Follow brand voice from Strategist
- Write for engagement (opens, clicks)
- Create clear CTAs
- Design A/B test variants

**A/B Testing**:
- Test one variable at a time
- Subject line, content, CTA, timing
- Set clear success metrics
- Minimum 4-hour evaluation period

**Terraform Artifacts**:
- Generate audience.tf, template.tf, campaign.tf
- Include dependencies
- Add metadata for tracking
- Document deployment steps

**You NEVER**:
- Deploy without Manager approval
- Ignore brand guidelines
- Skip A/B testing for significant campaigns
- Create audiences yourself (use Targetter's)

**Collaboration**:
- Follow strategy from Strategist
- Use audiences from Targetter
- Monitor dashboards from Analyst
- Submit deliverables to Manager
- Consult Industry Expert for vertical tactics
```

---

## Agent 6: Targetter

### Role
**Audience expert** - Intimately knows the user base, creates segments, cohorts, and finds right audiences based on attributes and behavior.

### Responsibilities
1. **Data Model Mastery**
   - Understand workspace data model deeply
   - Map object relationships (contact → order → product)
   - Identify available attributes on all objects
   - Understand object associations in DataHub

2. **Audience Segmentation**
   - Create segments based on attributes
   - Build behavioral cohorts based on events
   - Use DataHub views as query fragments
   - Apply advanced filtering logic

3. **Event Analysis**
   - Discover semantic events (standard Bird events)
   - Identify custom events
   - Understand event properties
   - Map events to user behavior

4. **Audience Recommendations**
   - Suggest audiences for campaign goals
   - Estimate audience sizes
   - Identify high-value segments
   - Recommend exclusion criteria

### Skills Used
```yaml
platform:
  - bird-project-context
  - bird-data-queries
  - bird-audience-creation
  - bird-contact-management
  
marketing:
  - audience-segmentation
  - customer-lifecycle
```

### Typical Workflow
```
1. Explore workspace data model
2. Understand available attributes and events
3. Receive campaign strategy from Manager
4. Recommend audience segments
5. Create audience definitions
6. Estimate sizes and reach
7. Generate audience.tf artifacts
8. Document segmentation logic
```

### Agent Prompt Key Points
```markdown
You are a **Targetter** - the audience expert.

**Your Core Duties**:
- Master the workspace data model
- Create precise audience segments
- Understand behavioral patterns through events
- Recommend optimal audiences for campaign goals

**Data Model Discovery**:
1. Query DataHub schema:
   ```
   datahub.explorer:runQuery with SHOW TABLES
   datahub.explorer:runQuery with DESCRIBE <table>
   ```
2. Identify objects: contact, order, product, etc.
3. Map relationships: contact.id → order.contact_id
4. Document custom objects
5. List available attributes on each object

**Event Discovery**:
1. Semantic events (standard):
   - email.sent, email.opened, email.clicked
   - sms.sent, sms.delivered, sms.clicked
   - purchase, page_view, etc.
2. Custom events:
   - Query event tables in DataHub
   - Understand event properties
   - Map to user behavior

**Segmentation Strategies**:
- **Attribute-based**: age, location, subscription_tier
- **Behavioral**: purchased_last_30d, opened_email_last_7d
- **Lifecycle**: new, active, dormant, churned
- **RFM**: recency, frequency, monetary value
- **Cohort**: signup_month, first_purchase_date

**Audience Creation**:
- Use `aitools.workflows:segmentBuilder` for natural language
- Use structured filters for complex logic
- Leverage DataHub views as query fragments
- Always estimate size before creating

**You NEVER**:
- Write campaign content (that's Campaign Manager)
- Make strategic decisions (that's Strategist)
- Analyze performance (that's Analyst)
- Deploy campaigns (that's Manager)

**Collaboration**:
- Share data model with Analyst
- Provide audiences to Campaign Manager
- Recommend segments to Manager
- Consult Strategist on lifecycle stages
```

---

## Agent Collaboration Patterns

### Pattern 1: New Campaign Request

```
User → Manager: "I want to run a re-engagement campaign"

Manager → Strategist: "What's our strategic approach for re-engagement?"
Strategist → Manager: "Focus on Serve pillar, use tiered approach"

Manager → Analyst: "What's our baseline engagement?"
Analyst → Manager: "18% open, 1.8% click, 3,200 dormant contacts"

Manager → Industry Expert: "What's good for our vertical?"
Industry Expert → Manager: "E-commerce dormant: 15% open, 2.5% click expected"

Manager → Targetter: "Create dormant audience segment"
Targetter → Manager: "Created 3 tiers: 30d, 60d, 90d dormant"

Manager → Campaign Manager: "Design re-engagement sequence"
Campaign Manager → Manager: "3-email sequence with A/B tests ready"

Manager → User: "Here are 3 options with recommendation"
User → Manager: "Approve Option B"

Manager → Campaign Manager: "Deploy Option B"
Campaign Manager → Manager: "Deployed, tracking dashboard live"
```

### Pattern 2: Performance Review

```
Manager → Analyst: "How's Campaign X performing?"
Analyst → Manager: "Dashboard shows 12% open, 1.2% click"

Manager → Industry Expert: "Is this good?"
Industry Expert → Manager: "Below benchmark, expected 15% open"

Manager → Campaign Manager: "Optimize Campaign X"
Campaign Manager → Analyst: "What's the data saying?"
Analyst → Campaign Manager: "Subject line A performing 2x better"

Campaign Manager → Manager: "Scaling variant A, pausing B"
Manager → User: "Campaign adjusted, expect 18% open now"
```

### Pattern 3: Strategic Planning

```
Manager → Strategist: "Plan Q1 marketing strategy"
Strategist → Analyst: "What's our current state?"
Analyst → Strategist: "Dashboard with Q4 performance"

Strategist → Industry Expert: "What works in our vertical?"
Industry Expert → Strategist: "Lifecycle campaigns + seasonal"

Strategist → Manager: "Q1 Strategy: 3 lifecycle + 2 seasonal campaigns"
Manager → Targetter: "Create lifecycle audiences"
Targetter → Manager: "New, Active, At-Risk, Churned segments ready"

Manager → Campaign Manager: "Design 5 campaigns per strategy"
Campaign Manager → Manager: "Campaign calendar with artifacts"

Manager → User: "Q1 Plan ready for approval"
```

---

## Implementation in Plugin Architecture

### bird-platform Plugin
**No changes** - Platform skills remain the same (12 skills)

### bird-marketing Plugin

#### Update: plugin.json
```json
{
  "name": "bird-marketing",
  "version": "3.0.0",
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

#### New Agent Files
```
plugins/bird-marketing/agents/
├── marketing-manager.md      # Orchestrator, quality control
├── analyst.md                # Data expert, dashboards
├── strategist.md             # Brand guardian, strategy
├── industry-expert.md        # Vertical specialist
├── campaign-manager.md       # Execution, creative
└── targetter.md              # Audience expert
```

---

## Agent Skill Matrix

| Skill | Manager | Analyst | Strategist | Industry Expert | Campaign Manager | Targetter |
|-------|---------|---------|------------|-----------------|------------------|-----------|
| **Platform Skills** |
| bird-project-context | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| bird-session-tracking | ✅ | | | | | |
| bird-knowledgebase | ✅ | | ✅ | | | |
| bird-data-queries | | ✅ | | ✅ | | ✅ |
| bird-dashboard-creation | | ✅ | | | | |
| bird-performance-metrics | | ✅ | | ✅ | | |
| bird-contact-management | | ✅ | | | | ✅ |
| bird-audience-creation | | | | | | ✅ |
| bird-template-management | | | | | ✅ | |
| bird-campaign-deployment | | | | | ✅ | |
| bird-flow-automation | | | ✅ | | ✅ | |
| bird-terraform-resources | | | | | ✅ | |
| **Marketing Skills** |
| campaign-strategy | ✅ | | ✅ | ✅ | | |
| audience-segmentation | | | | | | ✅ |
| email-copywriting | | | | | ✅ | |
| campaign-timing | | | | | ✅ | |
| performance-analysis | | ✅ | | ✅ | | |
| ab-testing | | | | | ✅ | |
| customer-lifecycle | | | ✅ | ✅ | ✅ | ✅ |
| budget-planning | ✅ | | | | | |
| compliance-privacy | ✅ | | ✅ | | | |
| campaign-calendar | ✅ | | ✅ | | ✅ | |

---

## Multi-Agent Orchestration

### Option 1: Manager as Orchestrator (Recommended)

**Manager** invokes other agents as needed:

```typescript
// Manager's workflow
async function handleCampaignRequest(request: string) {
  // 1. Get strategic direction
  const strategy = await invokeAgent('strategist', {
    task: 'develop_strategy',
    context: request
  });
  
  // 2. Get baseline data
  const baseline = await invokeAgent('analyst', {
    task: 'baseline_metrics',
    context: strategy
  });
  
  // 3. Get industry benchmarks
  const benchmarks = await invokeAgent('industry-expert', {
    task: 'provide_benchmarks',
    context: { strategy, baseline }
  });
  
  // 4. Get audience recommendations
  const audiences = await invokeAgent('targetter', {
    task: 'recommend_audiences',
    context: { strategy, baseline }
  });
  
  // 5. Get campaign designs
  const campaigns = await invokeAgent('campaign-manager', {
    task: 'design_campaigns',
    context: { strategy, audiences, benchmarks }
  });
  
  // 6. Present to human
  return presentOptions(campaigns);
}
```

### Option 2: Autonomous Collaboration

Agents communicate via **shared context** (Bird Tasks API):

```yaml
# Task metadata includes agent messages
task:
  id: "task-123"
  title: "Re-engagement Campaign"
  metadata:
    agent_messages:
      - from: "manager"
        to: "strategist"
        message: "Need strategic direction"
        timestamp: "2024-12-08T10:00:00Z"
      - from: "strategist"
        to: "manager"
        message: "Recommend Serve pillar, tiered approach"
        timestamp: "2024-12-08T10:05:00Z"
```

---

## Implementation Phases

### Phase 1: Core Agents (Week 1-2)
- [ ] Marketing Manager
- [ ] Analyst
- [ ] Campaign Manager

**Rationale**: Minimum viable team for campaign execution

### Phase 2: Strategic Agents (Week 3)
- [ ] Strategist
- [ ] Industry Expert

**Rationale**: Add strategic depth and benchmarking

### Phase 3: Specialist Agents (Week 4)
- [ ] Targetter

**Rationale**: Dedicated audience expertise

### Phase 4: Orchestration (Week 5)
- [ ] Multi-agent communication
- [ ] Shared context via Tasks API
- [ ] Agent collaboration patterns

---

## Testing Strategy

### Unit Testing (Per Agent)
```typescript
describe('Analyst Agent', () => {
  it('discovers data model', async () => {
    const result = await analyst.discoverDataModel();
    expect(result).toHaveProperty('objects');
    expect(result).toHaveProperty('events');
  });
  
  it('creates dashboard', async () => {
    const dashboard = await analyst.createDashboard({
      metrics: ['open_rate', 'click_rate']
    });
    expect(dashboard).toHaveProperty('malloy_queries');
  });
});
```

### Integration Testing (Agent Collaboration)
```typescript
describe('Campaign Creation Flow', () => {
  it('completes full workflow', async () => {
    const request = "Re-engagement campaign";
    
    // Manager orchestrates
    const result = await manager.handleRequest(request);
    
    // Verify each agent was invoked
    expect(strategist.invoked).toBe(true);
    expect(analyst.invoked).toBe(true);
    expect(targetter.invoked).toBe(true);
    expect(campaignManager.invoked).toBe(true);
    
    // Verify output
    expect(result).toHaveProperty('options');
    expect(result.options).toHaveLength(3);
  });
});
```

---

## Next Steps

1. **Review agent roles** - Validate responsibilities
2. **Prioritize agents** - Which to build first?
3. **Define communication protocol** - How agents collaborate
4. **Start with Manager + Analyst** - Core foundation
5. **Iterate** - Add agents incrementally

**Estimated effort**: 5 weeks
- Week 1-2: Manager, Analyst, Campaign Manager
- Week 3: Strategist, Industry Expert
- Week 4: Targetter
- Week 5: Multi-agent orchestration
