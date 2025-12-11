# Implementation Guides

> Technical implementation details and guides

---

## 📚 Contents

### Skills Distribution Strategy
**See [`../skills/DISTRIBUTION-STRATEGY.md`](../skills/DISTRIBUTION-STRATEGY.md)**

Skills are bundled in the Docker image, not distributed via connectors marketplace.

Covers:
- Declarative YAML skill definitions (like connector templates)
- Skills loader service
- Prompt composer
- Agent harness integration
- Project configuration
- Docker image build

**Read this for**: Understanding how skills are packaged and loaded

---

### [`timeline.md`](./timeline.md)
**Detailed 12-week implementation timeline**

Covers:
- Week-by-week breakdown
- Task estimates
- Deliverables per phase
- Milestones
- Risk mitigation
- Prerequisites

**Read this for**: Project planning and resource allocation

---

## 🚀 Quick Start

### For Backend Engineers

1. **Week 1-2**: Skills Infrastructure
   - Read [`../skills/DISTRIBUTION-STRATEGY.md`](../skills/DISTRIBUTION-STRATEGY.md)
   - Implement SkillsLoader service
   - Implement PromptComposer service
   - Create AgentHarness

2. **Week 3**: Platform Skills
   - Create 12 platform skills as YAML + Markdown
   - Follow skill structure in [`../skills/README.md`](../skills/README.md)
   - Test each skill independently

3. **Week 4-8**: Agents
   - Implement 7 agents
   - Follow agent specs in [`../agents/README.md`](../agents/README.md)
   - Test agent collaboration

4. **Week 9-11**: Vertical Skills
   - Create marketing and vertical skills
   - Test skill composition
   - Validate workflows

5. **Week 12**: UI
   - Build project setup flow
   - Implement agent workflow UI
   - Create deployment interface

---

## 🔧 Development Workflow

### 1. Set Up Environment

```bash
# Clone repo
cd apps/llmchain

# Install dependencies
npm install

# Set up environment variables
export BIRD_API_URL="https://api.bird.com"
export BIRD_WORKSPACE_ID="your-workspace-id"
export BIRD_ACCESS_TOKEN="your-access-token"
export ANTHROPIC_API_KEY="your-anthropic-key"

# Run service
npm run dev
```

### 2. Create a Skill

```bash
# Create skill directory
cd skills/platform
mkdir bird-project-context
cd bird-project-context

# Create files
touch skill.yml prompt.md README.md
mkdir examples
touch examples/basic.yml examples/advanced.yml

# Edit skill.yml (declarative definition)
# Edit prompt.md (agent instructions)
# Add examples
```

**Example `skill.yml`**:

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
    description: Synthesized foundation document

mcpOperations:
  - operation: tasks:getProject
  - operation: content:getDocument
  - operation: tasks:listTasks

dependencies: []

promptTemplate: ./prompt.md

examples:
  - title: Basic fetch
    input:
      projectId: proj-abc-123
```

### 3. Test Skill

```bash
# Unit test
npm test -- skills/platform/bird-project-context

# Integration test with fixtures
npm test -- integration/skills

# Test with agent harness
npm run test:agent -- --skill=bird-project-context
```

### 4. Implement an Agent

```bash
# Create agent definition
cd agents
touch research-analyst.yml

# Create agent logic
cd src/agents
touch research-analyst.ts

# Write tests
cd tests/agents
touch research-analyst.test.ts

# Test agent
npm test -- research-analyst.test.ts
```

---

## 🧪 Testing Strategy

### Unit Tests
Test individual components:
- Skill YAML parsing
- Prompt template rendering
- Agent logic
- API endpoints

### Integration Tests
Test component interactions:
- Skill discovery and loading
- Agent collaboration
- Skill composition
- End-to-end workflows

### E2E Tests
Test complete user journeys:
- Project creation
- Campaign generation
- Deployment
- Performance monitoring

See [`../testing/README.md`](../testing/README.md) for comprehensive testing guide.

---

## 📊 Progress Tracking

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] SkillsLoader service implemented
- [ ] PromptComposer service implemented
- [ ] AgentHarness implemented
- [ ] Skills discoverable and loadable

### Phase 2: Platform Skills (Week 3)
- [ ] 12 platform skills created (YAML + MD)
- [ ] All skills tested
- [ ] Skills composable

### Phase 3: Core Agents (Week 4-5)
- [ ] Research Analyst implemented
- [ ] Strategist implemented
- [ ] Project Coordinator implemented
- [ ] Agent collaboration working

### Phase 4: Execution Agents (Week 6-7)
- [ ] Audience Architect implemented
- [ ] Creative Director implemented
- [ ] Campaign Engineer implemented
- [ ] Full workflow tested

### Phase 5: Analysis Agent (Week 8)
- [ ] Performance Analyst implemented
- [ ] Complete lifecycle working

### Phase 6: Marketing Skills (Week 9)
- [ ] 10 marketing skills created

### Phase 7: Vertical Skills (Week 10-11)
- [ ] E-commerce skills (6)
- [ ] SaaS skills (6)
- [ ] ABM skills (6)

### Phase 8: UI (Week 12)
- [ ] Project setup flow
- [ ] Agent workflow UI
- [ ] Deployment interface

---

## 🎯 Success Criteria

### Technical
- ✅ All skills loadable from disk
- ✅ All agents produce valid deliverables
- ✅ Terraform configs validate successfully
- ✅ 95%+ test coverage

### Performance
- ✅ Skill discovery < 100ms
- ✅ Agent response < 30s
- ✅ Prompt composition < 500ms
- ✅ Docker image < 500MB

### Quality
- ✅ All deliverables well-formatted
- ✅ No duplicate code
- ✅ Clear error messages
- ✅ Comprehensive documentation

---

## 🔗 Related

- [`../agents/README.md`](../agents/README.md) - Agent specifications
- [`../skills/README.md`](../skills/README.md) - Skill specifications
- [`../skills/DISTRIBUTION-STRATEGY.md`](../skills/DISTRIBUTION-STRATEGY.md) - Skills distribution
- [`../prompts/README.md`](../prompts/README.md) - Prompt engineering
- [`../testing/README.md`](../testing/README.md) - Testing framework
- [`../reference/README.md`](../reference/README.md) - Frameworks & patterns

---

## Next Steps

1. **Review distribution strategy** - [`../skills/DISTRIBUTION-STRATEGY.md`](../skills/DISTRIBUTION-STRATEGY.md)
2. **Review timeline** - [`timeline.md`](./timeline.md)
3. **Set up environment** - Install dependencies
4. **Start Phase 1** - Skills infrastructure
5. **Track progress** - Update checklist weekly
