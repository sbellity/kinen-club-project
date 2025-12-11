# Refined Agent Roles & Project Lifecycle

## 🎯 Design Principles

### 1. Clear Deliverables
Each agent must produce **specific, measurable outputs** that other agents or humans can consume.

### 2. Single Responsibility
Each agent owns **one clear area** - no overlap, no ambiguity.

### 3. Lifecycle Coverage
Agents must cover the **full project lifecycle**: Ideation → Planning → Implementation → Operation → Learning.

### 4. Handoff Points
Clear **inputs and outputs** between agents for smooth collaboration.

---

## 🔄 Project Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

Phase 1: IDEATION (Discovery & Strategy)
├─ Discover business context, data, opportunities
├─ Define strategic direction
└─ Output: Foundation document, Strategic brief

Phase 2: PLANNING (Design & Specification)
├─ Design campaign structure
├─ Define audiences and content
└─ Output: Campaign plan, Audience specs, Content briefs

Phase 3: IMPLEMENTATION (Build & Review)
├─ Create artifacts (audiences, templates, campaigns)
├─ Review for quality and compliance
└─ Output: Terraform configs, Deployment plan

Phase 4: OPERATION (Deploy & Monitor)
├─ Deploy to production
├─ Monitor performance
└─ Output: Live campaigns, Performance dashboards

Phase 5: LEARNING (Analyze & Document)
├─ Analyze results
├─ Document learnings
└─ Output: Performance report, Learnings document
```

---

## 🤖 Refined Agent Roles (7 Agents)

### Agent 1: **Research Analyst** (Discovery Specialist)

**Lifecycle Phase**: IDEATION

**Core Responsibility**: Discover and document everything about the workspace and business context.

#### What They Do
1. **Data Model Discovery**
   - Map all objects (contact, order, product, etc.)
   - Document attributes on each object
   - Identify object relationships and associations
   - Discover DataHub views

2. **Event Discovery**
   - Identify semantic events (standard Bird events)
   - Discover custom events
   - Document event properties
   - Map events to user behavior

3. **Business Context Research**
   - Identify company, industry, vertical
   - Understand products/services
   - Determine B2B vs B2C
   - Document brand voice and guidelines

4. **Baseline Metrics**
   - Calculate current performance (open rates, click rates, etc.)
   - Identify trends (growth, decline)
   - Flag data quality issues
   - Document available channels

#### Deliverables
```yaml
Primary Outputs:
  - foundation.md: Complete business context
  - data-model.md: Objects, attributes, associations
  - events-catalog.md: All events with properties
  - baseline-metrics.yaml: Current performance data

Format:
  - Living documents with embedded Malloy queries
  - Auto-hydrates with latest data on read
  
Success Criteria:
  - 100% data model documented
  - All events cataloged
  - Business context validated by human
```

#### Skills Used
- bird-project-context
- bird-data-queries
- bird-contact-management
- bird-performance-metrics

#### Never Does
- Make strategic recommendations
- Create audiences
- Write campaign content
- Deploy anything

---

### Agent 2: **Strategist** (Strategic Planner)

**Lifecycle Phase**: IDEATION → PLANNING

**Core Responsibility**: Define strategic direction and ensure brand consistency.

#### What They Do
1. **Strategic Analysis**
   - Apply frameworks (5S, AIDA, Customer Lifecycle)
   - Identify opportunities based on data
   - Prioritize initiatives
   - Define success metrics

2. **Brand Governance**
   - Document brand guidelines
   - Enforce brand consistency
   - Maintain brand asset library
   - Review content for brand fit

3. **Strategic Planning**
   - Develop multi-week roadmaps
   - Coordinate across initiatives
   - Prevent campaign conflicts
   - Align with business goals

4. **Benchmarking**
   - Compare to industry standards
   - Identify performance gaps
   - Set realistic targets
   - Recommend improvements

#### Deliverables
```yaml
Primary Outputs:
  - strategic-brief.md: Strategic direction and priorities
  - brand-guidelines.md: Brand voice, tone, visual identity
  - campaign-roadmap.md: Multi-week plan with priorities
  - success-metrics.yaml: KPIs and targets

Format:
  - Markdown documents with clear sections
  - YAML for structured data
  
Success Criteria:
  - Strategy aligns with business goals
  - Brand guidelines documented
  - Roadmap approved by human
  - Metrics are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
```

#### Skills Used
- campaign-strategy
- customer-lifecycle
- compliance-privacy
- campaign-calendar

#### Never Does
- Execute campaigns
- Create audiences
- Write copy
- Analyze performance data (consults Research Analyst)

---

### Agent 3: **Audience Architect** (Segmentation Specialist)

**Lifecycle Phase**: PLANNING

**Core Responsibility**: Design and create audience segments based on strategy.

#### What They Do
1. **Segmentation Strategy**
   - Translate strategic goals into audience criteria
   - Design segmentation logic
   - Recommend targeting approach
   - Estimate audience sizes

2. **Audience Creation**
   - Use segmentBuilder for natural language criteria
   - Build complex filters with boolean logic
   - Leverage DataHub views as query fragments
   - Create cohorts based on behavior

3. **Audience Validation**
   - Verify audience sizes are realistic
   - Check for overlaps
   - Validate exclusion criteria
   - Document assumptions

4. **Audience Documentation**
   - Explain segmentation logic
   - Document expected behavior
   - Provide size estimates
   - Flag data dependencies

#### Deliverables
```yaml
Primary Outputs:
  - audience-specs.yaml: Detailed audience definitions
  - segmentation-logic.md: Explanation of criteria
  - audience-estimates.yaml: Size and reach projections
  - audience.tf: Terraform configs for deployment

Format:
  - YAML for structured audience definitions
  - Terraform for infrastructure-as-code
  
Success Criteria:
  - Audiences align with strategy
  - Size estimates within 10% accuracy
  - No unintended overlaps
  - Terraform configs valid
```

#### Skills Used
- bird-audience-creation
- bird-data-queries
- audience-segmentation
- customer-lifecycle
- bird-terraform-resources

#### Never Does
- Make strategic decisions (follows Strategist's direction)
- Write campaign content
- Deploy audiences
- Analyze campaign performance

---

### Agent 4: **Creative Director** (Content Specialist)

**Lifecycle Phase**: PLANNING → IMPLEMENTATION

**Core Responsibility**: Design campaign content and creative assets.

#### What They Do
1. **Content Strategy**
   - Translate strategic brief into content approach
   - Design multi-touch sequences
   - Plan channel mix (email, SMS, push, WhatsApp)
   - Define content variants for A/B testing

2. **Copywriting**
   - Write email subject lines and body copy
   - Create SMS messages
   - Design CTAs
   - Ensure brand voice consistency

3. **A/B Test Design**
   - Formulate test hypotheses
   - Design test variants
   - Define success metrics
   - Plan evaluation criteria

4. **Template Creation**
   - Create email templates
   - Design SMS templates
   - Add personalization variables
   - Ensure multi-channel consistency

#### Deliverables
```yaml
Primary Outputs:
  - content-brief.md: Content strategy and approach
  - copy-variants.md: All copy with A/B test variants
  - template-specs.yaml: Template definitions
  - template.tf: Terraform configs for templates

Format:
  - Markdown for copy and briefs
  - YAML for template structure
  - Terraform for deployment
  
Success Criteria:
  - Copy follows brand guidelines
  - A/B tests have clear hypotheses
  - Templates valid for all channels
  - Human approval on final copy
```

#### Skills Used
- email-copywriting
- ab-testing
- bird-template-management
- campaign-timing
- bird-terraform-resources

#### Never Does
- Create audiences (uses Audience Architect's specs)
- Make strategic decisions (follows Strategist's brief)
- Deploy campaigns
- Analyze performance (provides input to Performance Analyst)

---

### Agent 5: **Campaign Engineer** (Implementation Specialist)

**Lifecycle Phase**: IMPLEMENTATION

**Core Responsibility**: Assemble all pieces into deployable campaign artifacts.

#### What They Do
1. **Campaign Assembly**
   - Combine audiences, templates, and strategy
   - Configure campaign settings
   - Set up scheduling and timing
   - Define holdout groups

2. **Flow Orchestration**
   - Design multi-touch sequences
   - Connect campaigns to journeys
   - Set up triggered flows
   - Configure automation rules

3. **Terraform Generation**
   - Generate complete Terraform configs
   - Define resource dependencies
   - Add metadata and tags
   - Create deployment documentation

4. **Quality Assurance**
   - Validate all configurations
   - Check dependencies
   - Verify settings
   - Test deployment plan

#### Deliverables
```yaml
Primary Outputs:
  - campaign-config.yaml: Complete campaign configuration
  - campaign.tf: Terraform configs for campaigns
  - flows.tf: Journey and flow configurations
  - deployment-plan.md: Step-by-step deployment guide
  - terraform-plan.txt: Output of `terraform plan`

Format:
  - Terraform for infrastructure-as-code
  - YAML for configuration
  - Markdown for documentation
  
Success Criteria:
  - All dependencies resolved
  - Terraform configs valid
  - Deployment plan clear
  - Ready for human approval
```

#### Skills Used
- bird-campaign-deployment
- bird-flow-automation
- bird-terraform-resources
- campaign-calendar
- campaign-timing

#### Never Does
- Create content (uses Creative Director's templates)
- Create audiences (uses Audience Architect's specs)
- Deploy without approval
- Make strategic changes

---

### Agent 6: **Performance Analyst** (Monitoring Specialist)

**Lifecycle Phase**: OPERATION → LEARNING

**Core Responsibility**: Monitor performance and provide insights for optimization.

#### What They Do
1. **Dashboard Creation**
   - Build campaign-specific dashboards
   - Create living notebooks with Malloy queries
   - Define key metrics and visualizations
   - Set up automated reporting

2. **Performance Monitoring**
   - Track campaign metrics in real-time
   - Identify anomalies
   - Flag underperforming campaigns
   - Alert on critical issues

3. **A/B Test Analysis**
   - Analyze test results
   - Determine statistical significance
   - Recommend winning variants
   - Document test outcomes

4. **Optimization Recommendations**
   - Identify improvement opportunities
   - Suggest tactical adjustments
   - Recommend scaling decisions
   - Provide data-driven insights

#### Deliverables
```yaml
Primary Outputs:
  - dashboard.yaml: Living dashboard with Malloy queries
  - performance-report.md: Real-time performance summary
  - ab-test-results.yaml: Test outcomes and recommendations
  - optimization-recommendations.md: Actionable insights

Format:
  - dashboard.yaml (living document)
  - Markdown for reports
  - YAML for structured data
  
Success Criteria:
  - Dashboards update in real-time
  - Metrics accurate
  - Recommendations actionable
  - Statistical rigor in A/B analysis
```

#### Skills Used
- bird-dashboard-creation
- bird-performance-metrics
- bird-data-queries
- performance-analysis
- ab-testing

#### Never Does
- Make strategic decisions (provides data to Strategist)
- Create campaigns
- Deploy changes
- Write content

---

### Agent 7: **Project Coordinator** (Orchestrator & Governance)

**Lifecycle Phase**: ALL PHASES

**Core Responsibility**: Orchestrate the team, ensure quality, and manage human-in-the-loop.

#### What They Do
1. **Project Management**
   - Coordinate agent activities
   - Track progress and milestones
   - Manage timelines
   - Escalate blockers

2. **Quality Assurance**
   - Review all deliverables
   - Ensure compliance
   - Verify brand consistency
   - Check completeness

3. **Human-in-the-Loop**
   - Present options to human
   - Request approvals
   - Incorporate feedback
   - Document decisions

4. **Session Management**
   - Track session state
   - Log all activities
   - Manage artifacts
   - Update project metadata

5. **Learning Capture**
   - Document learnings
   - Update foundation with insights
   - Track what worked/didn't work
   - Build institutional knowledge

#### Deliverables
```yaml
Primary Outputs:
  - project-status.md: Current state and progress
  - approval-requests.md: Items needing human review
  - session-log.md: Complete activity log
  - learnings.md: Documented insights and outcomes
  - updated-foundation.md: Foundation with new learnings

Format:
  - Markdown for documentation
  - Bird Tasks API for session tracking
  - Bird Knowledgebase for learnings
  
Success Criteria:
  - All phases completed
  - Human approvals obtained
  - Quality standards met
  - Learnings documented
```

#### Skills Used
- bird-project-context
- bird-session-tracking
- bird-knowledgebase
- campaign-calendar
- budget-planning
- compliance-privacy

#### Never Does
- Create content (delegates to Creative Director)
- Make strategic decisions (delegates to Strategist)
- Create audiences (delegates to Audience Architect)
- Analyze data (delegates to Research/Performance Analysts)

---

## 🔄 Complete Lifecycle Flow

### Phase 1: IDEATION (Week 1)

```
User Request
    ↓
Project Coordinator: Initiates project
    ↓
Research Analyst: Discovers context
    ├→ Data model exploration
    ├→ Event discovery
    ├→ Business research
    └→ Baseline metrics
    ↓
Deliverables:
    ├─ foundation.md
    ├─ data-model.md
    ├─ events-catalog.md
    └─ baseline-metrics.yaml
    ↓
Strategist: Develops strategy
    ├→ Analyzes foundation
    ├→ Applies frameworks
    ├→ Defines priorities
    └→ Sets metrics
    ↓
Deliverables:
    ├─ strategic-brief.md
    ├─ brand-guidelines.md
    ├─ campaign-roadmap.md
    └─ success-metrics.yaml
    ↓
Project Coordinator: Presents to human for approval
```

### Phase 2: PLANNING (Week 2)

```
Approved Strategy
    ↓
Audience Architect: Designs audiences
    ├→ Translates strategy to criteria
    ├→ Creates segmentation logic
    ├→ Estimates sizes
    └→ Generates Terraform
    ↓
Deliverables:
    ├─ audience-specs.yaml
    ├─ segmentation-logic.md
    ├─ audience-estimates.yaml
    └─ audience.tf
    ↓
Creative Director: Designs content
    ├→ Develops content strategy
    ├→ Writes copy variants
    ├→ Designs A/B tests
    └→ Creates templates
    ↓
Deliverables:
    ├─ content-brief.md
    ├─ copy-variants.md
    ├─ template-specs.yaml
    └─ template.tf
    ↓
Project Coordinator: Reviews for quality
```

### Phase 3: IMPLEMENTATION (Week 2-3)

```
Approved Plan
    ↓
Campaign Engineer: Assembles campaign
    ├→ Combines audiences + templates
    ├→ Configures campaign settings
    ├→ Sets up flows/journeys
    └→ Generates Terraform
    ↓
Deliverables:
    ├─ campaign-config.yaml
    ├─ campaign.tf
    ├─ flows.tf
    ├─ deployment-plan.md
    └─ terraform-plan.txt
    ↓
Project Coordinator: Final review
    ├→ Validates configurations
    ├→ Checks compliance
    └→ Presents to human
    ↓
Human: Approves deployment
```

### Phase 4: OPERATION (Week 3-6)

```
Approved Deployment
    ↓
Campaign Engineer: Deploys (terraform apply)
    ↓
Performance Analyst: Creates dashboard
    ├→ Builds living dashboard
    ├→ Defines metrics
    └→ Sets up monitoring
    ↓
Deliverables:
    └─ dashboard.yaml (live)
    ↓
Performance Analyst: Monitors performance
    ├→ Tracks metrics
    ├→ Analyzes A/B tests
    ├→ Identifies issues
    └→ Recommends optimizations
    ↓
Deliverables (ongoing):
    ├─ performance-report.md (daily)
    ├─ ab-test-results.yaml (as tests complete)
    └─ optimization-recommendations.md
    ↓
Project Coordinator: Coordinates adjustments
    ├→ Reviews recommendations
    ├→ Requests human approval
    └→ Delegates to Campaign Engineer
```

### Phase 5: LEARNING (Week 6+)

```
Campaign Completed
    ↓
Performance Analyst: Final analysis
    ├→ Analyzes full campaign results
    ├→ Compares to benchmarks
    ├→ Identifies patterns
    └→ Documents outcomes
    ↓
Deliverables:
    ├─ final-performance-report.md
    └─ campaign-outcomes.yaml
    ↓
Strategist: Extracts learnings
    ├→ Reviews results
    ├→ Identifies what worked/didn't
    ├→ Updates best practices
    └→ Refines strategy
    ↓
Deliverables:
    ├─ learnings.md
    └─ strategy-updates.md
    ↓
Project Coordinator: Updates foundation
    ├→ Incorporates learnings
    ├→ Updates benchmarks
    ├→ Documents patterns
    └→ Closes project
    ↓
Deliverables:
    ├─ updated-foundation.md
    ├─ project-summary.md
    └─ session-closed (Bird Tasks API)
```

---

## 📊 Agent Deliverables Matrix

| Agent | Phase | Primary Deliverables | Format | Consumer |
|-------|-------|---------------------|--------|----------|
| **Research Analyst** | Ideation | foundation.md, data-model.md, events-catalog.md, baseline-metrics.yaml | Markdown + YAML | Strategist, Audience Architect |
| **Strategist** | Ideation → Planning | strategic-brief.md, brand-guidelines.md, campaign-roadmap.md, success-metrics.yaml | Markdown + YAML | All agents, Human |
| **Audience Architect** | Planning | audience-specs.yaml, segmentation-logic.md, audience.tf | YAML + Terraform | Campaign Engineer, Human |
| **Creative Director** | Planning → Implementation | content-brief.md, copy-variants.md, template-specs.yaml, template.tf | Markdown + YAML + Terraform | Campaign Engineer, Human |
| **Campaign Engineer** | Implementation | campaign-config.yaml, campaign.tf, flows.tf, deployment-plan.md, terraform-plan.txt | YAML + Terraform + Markdown | Project Coordinator, Human |
| **Performance Analyst** | Operation → Learning | dashboard.yaml, performance-report.md, ab-test-results.yaml, optimization-recommendations.md | YAML + Markdown | Strategist, Project Coordinator, Human |
| **Project Coordinator** | All Phases | project-status.md, approval-requests.md, session-log.md, learnings.md, updated-foundation.md | Markdown | Human, All agents |

---

## 🎯 Key Improvements from Original Design

### 1. **Split Analyst Role**
**Original**: Single "Analyst" doing both discovery and performance
**Refined**: 
- **Research Analyst** (discovery, data model, baseline)
- **Performance Analyst** (monitoring, optimization, learning)

**Rationale**: Discovery is a one-time activity at project start, while performance monitoring is ongoing. Different skills, different phases.

### 2. **Renamed "Manager" → "Project Coordinator"**
**Original**: "Marketing Manager"
**Refined**: "Project Coordinator"

**Rationale**: 
- "Manager" implies decision-making authority
- "Coordinator" better reflects orchestration role
- Emphasizes facilitation over control
- Clearer that human is the actual decision-maker

### 3. **Split "Campaign Manager" Role**
**Original**: Single "Campaign Manager" doing content + assembly
**Refined**:
- **Creative Director** (content, copy, templates)
- **Campaign Engineer** (assembly, configuration, deployment)

**Rationale**: Creative work (writing copy) vs technical work (Terraform, configuration) are very different skills.

### 4. **Renamed "Targetter" → "Audience Architect"**
**Original**: "Targetter"
**Refined**: "Audience Architect"

**Rationale**:
- More professional title
- Emphasizes design/architecture aspect
- "Targetter" sounds tactical, "Architect" sounds strategic
- Better reflects the sophistication of the role

### 5. **Removed "Industry Expert"**
**Original**: Separate "Industry Expert" agent
**Refined**: Capabilities absorbed into **Strategist**

**Rationale**:
- Benchmarking is part of strategy
- Reduces agent count (7 instead of 8)
- Strategist can consult external knowledge (web search, docs)
- Avoids coordination overhead

### 6. **Added Explicit Learning Phase**
**Original**: Implicit learning
**Refined**: Explicit Phase 5 with clear deliverables

**Rationale**:
- Learning is critical for improvement
- Foundation documents should evolve
- Institutional knowledge must be captured
- Enables continuous improvement

---

## 🔍 Challenges & Questions

### Challenge 1: Agent Count (7 agents)
**Question**: Is 7 agents too many? Should we consolidate further?

**Options**:
- **Option A**: Keep 7 (current design)
- **Option B**: Merge Research + Performance Analyst → "Data Analyst" (6 agents)
- **Option C**: Merge Creative Director + Campaign Engineer → "Campaign Manager" (6 agents)

**Recommendation**: Start with 7, consolidate later if needed. Better to have clear separation initially.

### Challenge 2: Human Approval Points
**Question**: Where exactly should humans approve?

**Proposed Approval Gates**:
1. ✅ **After Ideation**: Approve strategic brief
2. ✅ **After Planning**: Approve campaign plan (audiences + content)
3. ✅ **Before Deployment**: Approve final Terraform configs
4. ⚠️ **During Operation**: Approve optimization changes?

**Recommendation**: Gates 1-3 mandatory, Gate 4 optional (agent can make minor optimizations autonomously).

### Challenge 3: Agent Communication
**Question**: How do agents communicate? Direct invocation or shared context?

**Options**:
- **Option A**: Project Coordinator invokes agents sequentially
- **Option B**: Agents communicate via Bird Tasks API (comments)
- **Option C**: Hybrid (Coordinator orchestrates, agents share context)

**Recommendation**: Option C - Coordinator orchestrates phases, agents share deliverables via Knowledgebase.

### Challenge 4: Deliverable Storage
**Question**: Where do deliverables live?

**Proposed Structure**:
```
Bird Knowledgebase:
  /projects/{project-id}/
    ├─ foundation.md (Research Analyst)
    ├─ data-model.md (Research Analyst)
    ├─ strategic-brief.md (Strategist)
    ├─ brand-guidelines.md (Strategist)
    ├─ audience-specs.yaml (Audience Architect)
    ├─ content-brief.md (Creative Director)
    ├─ campaign-config.yaml (Campaign Engineer)
    ├─ dashboard.yaml (Performance Analyst)
    ├─ learnings.md (Project Coordinator)
    └─ artifacts/
        ├─ audience.tf
        ├─ template.tf
        └─ campaign.tf
```

**Recommendation**: Use Knowledgebase for all deliverables, S3 for Terraform state.

### Challenge 5: Agent Autonomy vs Control
**Question**: How much autonomy should agents have?

**Proposed Levels**:
- **Level 1 (Discovery)**: Fully autonomous (Research Analyst)
- **Level 2 (Planning)**: Autonomous with review (Strategist, Audience Architect, Creative Director)
- **Level 3 (Implementation)**: Requires approval (Campaign Engineer)
- **Level 4 (Operation)**: Monitored autonomy (Performance Analyst)

**Recommendation**: Different levels for different phases, with Project Coordinator as safety net.

---

## 🚀 Implementation Priority

### Phase 1: Core Discovery & Strategy (Week 1-2)
**Agents**: Research Analyst, Strategist, Project Coordinator
**Goal**: Establish foundation and strategic direction

### Phase 2: Planning & Content (Week 3)
**Agents**: + Audience Architect, Creative Director
**Goal**: Design complete campaign plan

### Phase 3: Implementation (Week 4)
**Agents**: + Campaign Engineer
**Goal**: Assemble and deploy campaigns

### Phase 4: Operation & Learning (Week 5)
**Agents**: + Performance Analyst
**Goal**: Monitor, optimize, and learn

---

## 📋 Next Steps

1. **Review refined roles** - Validate responsibilities and deliverables
2. **Approve agent count** - 7 agents or consolidate?
3. **Define approval gates** - Where does human review happen?
4. **Choose communication model** - How do agents collaborate?
5. **Start implementation** - Begin with Phase 1 agents

**Questions for you**:
1. Do these 7 roles make sense, or should we consolidate?
2. Are the deliverables clear and actionable?
3. Should "Industry Expert" be separate or part of Strategist?
4. Any other roles or phases we're missing?
