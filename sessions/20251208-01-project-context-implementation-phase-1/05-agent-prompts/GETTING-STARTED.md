# Getting Started - V1 Implementation

> Quick start guide to build the first working version

---

## 🎯 What We're Building

A multi-agent marketing advisor with:
- **7 agents**: Coordinator, Research Analyst, Strategist, Audience Architect, Creative Director, Campaign Engineer, Performance Analyst
- **30 skills**: 12 platform + 8 marketing + 10 vertical (ABM, SaaS, E-commerce)
- **Coordinator entry point**: Main interface for user requests
- **Skills-based architecture**: Declarative YAML skills, dynamically loaded

---

## 🚀 Quick Start (Day 1)

### Step 1: Setup Project Structure (30 min)

```bash
cd apps/llmchain

# Create directories
mkdir -p skills/platform
mkdir -p skills/marketing
mkdir -p skills/verticals/{abm,saas,ecommerce}
mkdir -p prompts/agents
mkdir -p src/services
mkdir -p src/agents
mkdir -p tests/{skills,agents,integration}

# Install dependencies
npm install yaml handlebars @anthropic-ai/sdk
npm install -D @types/node vitest
```

### Step 2: Create First Skill (1 hour)

Create `skills/platform/bird-project-context/skill.yml`:

```yaml
slug: bird-project-context
name: Bird Project Context
version: 1.0.0
category: platform
description: Fetch project context from Bird Tasks API

metadata:
  author: Bird Platform Team
  tags: [platform, context]
  requiredPermissions: [tasks:read, content:read]

purpose: |
  Retrieves project foundation, recent activity, and workspace metadata.

inputs:
  - name: projectId
    type: string
    required: true
    description: Bird project ID

outputs:
  - name: foundation.md
    type: markdown
    description: Foundation document
  
  - name: metadata.json
    type: json
    description: Project metadata

mcpOperations:
  - operation: tasks:getProject
    description: Fetch project details
  
  - operation: content:getDocument
    description: Get foundation document
  
  - operation: tasks:listTasks
    description: Get recent activity

dependencies: []

examples:
  - title: Basic fetch
    input:
      projectId: proj-abc-123
```

Create `skills/platform/bird-project-context/prompt.md`:

```markdown
# Bird Project Context Skill

## Your Task
Fetch comprehensive context for project `{{inputs.projectId}}`.

## Steps

1. **Fetch Project**
   - Use MCP: `tasks:getProject`
   - Params: `{ id: "{{inputs.projectId}}" }`

2. **Get Foundation**
   - If `metadata.foundationDocumentId` exists:
     - Use MCP: `content:getDocument`
     - Params: `{ id: "{{metadata.foundationDocumentId}}" }`

3. **Get Recent Activity**
   - Use MCP: `tasks:listTasks`
   - Body: `{ projectId: "{{inputs.projectId}}", limit: 5 }`

4. **Synthesize**
   Combine into foundation document.

## Output

### foundation.md
```markdown
# {{projectName}} Foundation

## Business Context
**Company**: {{company}}
**Industry**: {{industry}}

## Customer Base
**Total Contacts**: {{contactCount}}

## Performance
**Email Open Rate**: {{emailOpenRate}}%
```

### metadata.json
```json
{
  "projectId": "{{inputs.projectId}}",
  "projectName": "{{projectName}}"
}
```
```

### Step 3: Implement SkillsLoader (2 hours)

Copy the `SkillsLoader` implementation from [`v1-implementation-plan.md`](./implementation/v1-implementation-plan.md#task-12-skillsloader-service-6h)

Save as `src/services/skills-loader.ts`

### Step 4: Test Skills Loading (30 min)

Create `tests/skills/skills-loader.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { SkillsLoader } from '../../src/services/skills-loader';

describe('SkillsLoader', () => {
  const loader = new SkillsLoader();
  
  it('loads all skills', async () => {
    const skills = await loader.loadAllSkills();
    expect(skills.length).toBeGreaterThan(0);
  });
  
  it('loads bird-project-context skill', async () => {
    const skill = await loader.getSkill('bird-project-context');
    expect(skill).toBeDefined();
    expect(skill?.slug).toBe('bird-project-context');
    expect(skill?.category).toBe('platform');
    expect(skill?.promptTemplate).toBeTruthy();
  });
  
  it('filters skills by project config', async () => {
    const skills = await loader.getSkillsForProject({
      vertical: 'ecommerce',
      enabledSkills: ['platform/*', 'ecommerce/*']
    });
    
    const categories = skills.map(s => s.category);
    expect(categories).toContain('platform');
    expect(categories).toContain('ecommerce');
    expect(categories).not.toContain('saas');
  });
});
```

Run tests:
```bash
npm test
```

---

## 📝 Day 1 Deliverables

By end of Day 1, you should have:
- ✅ Project structure created
- ✅ First skill created (bird-project-context)
- ✅ SkillsLoader service implemented
- ✅ Tests passing

---

## 🗓️ Week 1 Focus

### Day 2: PromptComposer + AgentHarness
- Implement PromptComposer service
- Implement AgentHarness with coordinator entry point
- Test prompt composition

### Day 3-5: Platform Skills
Create remaining 11 platform skills:
1. bird-task-management
2. bird-data-queries
3. bird-datahub-schema
4. bird-audience-creation
5. bird-template-management
6. bird-campaign-deployment
7. bird-terraform-resources
8. bird-journey-orchestration
9. bird-workspace-config
10. bird-performance-metrics
11. bird-content-management

**Template for each skill**:
```
skills/platform/{skill-name}/
├── skill.yml       # Declarative definition
├── prompt.md       # Agent instructions
└── examples/
    └── basic.yml   # Usage example
```

---

## 🎯 Week 2 Focus

### Day 6-7: Agent Prompts

Create complete prompts for all 7 agents:

**Priority order**:
1. **project-coordinator.md** (entry point) - MOST IMPORTANT
2. **research-analyst.md** (data gathering)
3. **strategist.md** (planning)
4. **audience-architect.md** (targeting)
5. **creative-director.md** (content)
6. **campaign-engineer.md** (deployment)
7. **performance-analyst.md** (analysis)

**Each prompt should include**:
- Role description
- Responsibilities
- Available skills
- Workflow
- Communication style
- Example interactions
- What never to do

### Day 8-10: Marketing Skills

Create 8 marketing skills:
1. campaign-strategy
2. customer-lifecycle
3. email-copywriting
4. ab-testing
5. audience-segmentation
6. performance-analysis
7. competitive-analysis
8. dashboard-creation

---

## 🔧 Development Commands

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test
npm test -- skills-loader

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Run locally
npm run dev
```

---

## 📊 Progress Tracking

### Week 1 Checklist
- [ ] Day 1: Project setup + SkillsLoader + first skill
- [ ] Day 2: PromptComposer + AgentHarness
- [ ] Day 3: Platform skills 1-4
- [ ] Day 4: Platform skills 5-8
- [ ] Day 5: Platform skills 9-12

### Week 2 Checklist
- [ ] Day 6: Coordinator + Research Analyst prompts
- [ ] Day 7: Remaining 5 agent prompts
- [ ] Day 8: Marketing skills 1-3
- [ ] Day 9: Marketing skills 4-6
- [ ] Day 10: Marketing skills 7-8

### Week 3 Checklist
- [ ] Day 11: ABM skills (3)
- [ ] Day 12: SaaS skills (4)
- [ ] Day 13: E-commerce skills (3)
- [ ] Day 14: MCP integration
- [ ] Day 15: E2E test

### Week 4 Checklist
- [ ] Day 16-17: Comprehensive testing
- [ ] Day 18-19: Documentation
- [ ] Day 20: Polish & deploy

---

## 🎓 Key Concepts

### Skills
- **Declarative**: YAML definition + Markdown prompt
- **Composable**: Skills can depend on other skills
- **Categorized**: platform, marketing, vertical
- **Versioned**: Semantic versioning

### Agents
- **Specialized**: Each agent has specific expertise
- **Collaborative**: Agents work together via coordinator
- **Skill-based**: Agents use skills to accomplish tasks
- **Prompted**: Each agent has detailed system prompt

### Coordinator
- **Entry point**: Main interface for user requests
- **Orchestrator**: Delegates to specialist agents
- **Synthesizer**: Combines deliverables
- **Quality control**: Validates outputs

---

## 💡 Tips

### Creating Skills
1. **Start with purpose** - What does this skill do?
2. **Define inputs/outputs** - Be specific
3. **List MCP operations** - What APIs are needed?
4. **Write clear prompts** - Step-by-step instructions
5. **Add examples** - Show how to use it

### Writing Agent Prompts
1. **Define role clearly** - Who is this agent?
2. **List responsibilities** - What do they do?
3. **Show workflows** - How do they work?
4. **Provide examples** - Real interactions
5. **Set boundaries** - What they never do

### Testing
1. **Unit test services** - SkillsLoader, PromptComposer
2. **Integration test skills** - Load and render
3. **E2E test workflows** - Full agent collaboration
4. **Use fixtures** - Mock MCP responses

---

## 🐛 Troubleshooting

### Skills not loading
```bash
# Check directory structure
ls -la skills/platform/bird-project-context/

# Should see:
# skill.yml
# prompt.md
# examples/
```

### YAML parse errors
```bash
# Validate YAML
npm install -g yaml-lint
yaml-lint skills/platform/*/skill.yml
```

### Tests failing
```bash
# Run with verbose output
npm test -- --reporter=verbose

# Check specific test
npm test -- skills-loader.test.ts
```

---

## 📚 Resources

### Documentation
- [`v1-implementation-plan.md`](./implementation/v1-implementation-plan.md) - Detailed 4-week plan
- [`../skills/DISTRIBUTION-STRATEGY.md`](./skills/DISTRIBUTION-STRATEGY.md) - Skills architecture
- [`../agents/README.md`](./agents/README.md) - Agent specifications
- [`../testing/README.md`](./testing/README.md) - Testing guide

### Examples
- Connector templates: `/Users/sbellity/code/nest/apps/connector-templates/templates/`
- Anthropic template: `anthropic/v1/template.yml`
- OpenAI template: `openai/v1/template.yml`

---

## 🎯 Success Criteria

By end of Week 1:
- ✅ 12 platform skills created
- ✅ SkillsLoader working
- ✅ PromptComposer working
- ✅ AgentHarness with coordinator
- ✅ Tests passing

By end of Week 2:
- ✅ 7 agent prompts complete
- ✅ 8 marketing skills created
- ✅ Agent can load skills
- ✅ Prompts compose correctly

By end of Week 3:
- ✅ 10 vertical skills created
- ✅ MCP integration working
- ✅ E2E test passing

By end of Week 4:
- ✅ 90%+ test coverage
- ✅ Documentation complete
- ✅ Docker image built
- ✅ Deployed to staging

---

## 🚀 Let's Go!

Start with Day 1:
1. Set up project structure
2. Create first skill
3. Implement SkillsLoader
4. Run tests

**Estimated time**: 4 hours

**Next**: Day 2 - PromptComposer + AgentHarness
