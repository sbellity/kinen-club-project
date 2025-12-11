# Agent Prompts & Skills

Agent prompt engineering and skill development for the Marketing Agent.

## Overview

This section covers:
- **Agent roles** - Multi-agent team structure (6 specialized agents)
- **Plugin architecture** - Platform primitives vs vertical skills
- **System prompts** - Core agent instructions
- **Skills** - Reusable capabilities (22 skills total)
- **Prompt patterns** - Proven patterns for agent behavior
- **Testing strategies** - How to validate prompts work

---

## 🚀 Start Here

### [`AGENT-ROLES-ARCHITECTURE.md`](./AGENT-ROLES-ARCHITECTURE.md)
**Multi-agent team structure**

Six specialized agents modeling a real marketing team:
1. **Marketing Manager** - Orchestrator, quality control, human-in-the-loop
2. **Analyst** - Data expert, dashboards, metrics
3. **Strategist** - Brand guardian, strategy, frameworks
4. **Industry Expert** - Vertical specialist, benchmarks
5. **Campaign Manager** - Execution, creative, A/B testing
6. **Targetter** - Audience expert, segmentation

**Read this first** to understand the agent architecture.

---

### [`PLUGIN-ORGANIZATION-PLAN.md`](./PLUGIN-ORGANIZATION-PLAN.md)
**Plugin architecture and skills library**

- **bird-platform** plugin: 12 platform skills (reusable)
- **bird-marketing** plugin: 10 marketing skills + 6 agents
- Complete skills library (22 skills)
- Migration plan and implementation roadmap

**Read this second** to understand the technical structure.

---

### [`SKILLS-LIBRARY-PLAN.md`](./SKILLS-LIBRARY-PLAN.md)
**Complete skills library specification**

Detailed specifications for all 22 skills:
- 12 platform skills (Bird API operations)
- 10 marketing skills (vertical expertise)
- Dependencies, composition patterns
- 4-week implementation priority matrix

**Read this third** for implementation details.

---

## Documents

### [`system-prompt.md`](./system-prompt.md)
**Core agent system prompt**

- Agent identity and role
- Project context integration
- Tool usage guidelines
- Artifact generation format
- Error handling

**Read this if**: You're implementing the agent

---

### [`skills/`](./skills/)
**Reusable agent skills**

Individual skill documents for:
- `context-gathering.md` - How to fetch project context
- `campaign-generation.md` - How to generate campaigns
- `terraform-generation.md` - How to generate `.tf` files
- `dashboard-creation.md` - How to create dashboard.yaml
- `session-management.md` - How to manage sessions

**Read this if**: You're building specific capabilities

---

### [`prompt-patterns.md`](./prompt-patterns.md)
**Proven prompt engineering patterns**

- Chain-of-thought prompting
- Few-shot examples
- Constraint specification
- Error recovery patterns

**Read this if**: You're optimizing prompts

---

### [`testing-strategy.md`](./testing-strategy.md)
**How to test prompts**

- Unit tests for skills
- Integration tests for flows
- Evaluation criteria
- Test scenarios

**Read this if**: You're validating agent behavior

---

## Quick Start

### 1. Start with System Prompt
Read [`system-prompt.md`](./system-prompt.md) to understand the core agent instructions.

### 2. Understand Skills
Review [`skills/`](./skills/) to see how capabilities are broken down.

### 3. Review Patterns
Check [`prompt-patterns.md`](./prompt-patterns.md) for best practices.

### 4. Test
Use [`testing-strategy.md`](./testing-strategy.md) to validate.

---

## Implementation Order

1. **System Prompt** (2 hours)
   - Write core agent identity
   - Add project context instructions
   - Define tool usage guidelines

2. **Context Gathering Skill** (1 hour)
   - Fetch project metadata
   - Read foundation document
   - Get recent activity

3. **Campaign Generation Skill** (2 hours)
   - Analyze project goals
   - Propose campaign ideas
   - Generate targeting criteria

4. **Terraform Generation Skill** (2 hours)
   - Generate `.tf` files
   - Handle dependencies
   - Create README

5. **Dashboard Creation Skill** (1 hour)
   - Create dashboard.yaml
   - Add Malloy queries
   - Define metrics

6. **Session Management Skill** (1 hour)
   - Create/update tasks
   - Log comments
   - Track artifacts

**Total: 9 hours**

---

## Key Principles

### 1. Clear Instructions
```markdown
❌ "Help the user with campaigns"
✅ "When user requests a campaign, follow these steps:
    1. Fetch project context via tasks:getProject
    2. Read foundation document
    3. Analyze goals and constraints
    4. Generate 2-3 campaign options
    5. Present in artifact format"
```

### 2. Tool Usage Guidance
```markdown
✅ "Use tasks:getProject to fetch project metadata"
✅ "Use content:searchContent to find foundation document"
✅ "Use mcp__nest-api__invoke_operation for Bird APIs"
```

### 3. Output Format Specification
```markdown
✅ "Generate terraform configs in this structure:
    main.tf - resource definitions
    variables.tf - configuration
    outputs.tf - resource IDs
    README.md - deployment instructions"
```

### 4. Error Handling
```markdown
✅ "If project not found, ask user to create one first"
✅ "If foundation missing, offer to create it"
✅ "If API call fails, explain error and suggest retry"
```

---

## Prompt Engineering Best Practices

### Use Chain-of-Thought
```markdown
Before generating a campaign:
1. First, analyze the project goals
2. Then, review past campaign performance
3. Next, identify target audience segments
4. Finally, propose campaign strategy
```

### Provide Examples
```markdown
Example campaign proposal:

<artifact type="campaign-plan" id="vip-early-access">
name: VIP Early Access Campaign
audience: High-value customers (LTV > $1000)
goal: Drive 25% upgrade rate
...
</artifact>
```

### Set Constraints
```markdown
Constraints:
- Campaigns must target existing audiences or create new ones
- Email templates must follow brand guidelines
- Budget must be specified and realistic
- Timeline must be feasible (min 1 week lead time)
```

### Handle Edge Cases
```markdown
Edge cases to handle:
- No project context available → Ask user to create project
- Foundation document missing → Offer to create it
- No recent activity → Start fresh analysis
- API errors → Explain and suggest retry
```

---

## Testing Approach

### 1. Unit Tests (Per Skill)
Test each skill independently:
- Context gathering returns correct data
- Campaign generation follows format
- Terraform configs are valid

### 2. Integration Tests (Full Flows)
Test complete user journeys:
- New project → Context → Campaign → Deploy
- Existing project → Resume → Update campaign
- Error scenarios → Recovery

### 3. Evaluation Criteria
- **Correctness**: Does it produce valid outputs?
- **Completeness**: Does it handle all cases?
- **Clarity**: Are responses clear to marketers?
- **Efficiency**: Does it minimize API calls?

---

## Next Steps

1. **Read**: [`system-prompt.md`](./system-prompt.md)
2. **Implement**: Start with context gathering skill
3. **Test**: Validate with test scenarios
4. **Iterate**: Refine based on results
