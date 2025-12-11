# Agent Prompts

> System prompts and prompt engineering guidelines

---

## 📝 System Prompts

### [`system-prompt.md`](./system-prompt.md)
**Complete system prompt for Marketing Advisor AI**

Includes:
- Core identity and role
- Project context integration
- Tool usage guidelines (MCP operations)
- Artifact generation formats
- Communication guidelines
- Error handling
- Session management
- Best practices

**Use this as**: Base template for agent system prompts

---

## 🎯 Prompt Engineering Guidelines

### Key Principles

#### 1. Clear Instructions
```markdown
❌ "Help the user with campaigns"
✅ "When user requests a campaign:
    1. Fetch project context via tasks:getProject
    2. Read foundation document
    3. Analyze goals and constraints
    4. Generate 2-3 campaign options
    5. Present in artifact format"
```

#### 2. Tool Usage Guidance
```markdown
✅ "Use tasks:getProject to fetch project metadata"
✅ "Use content:searchContent to find foundation document"
✅ "Use mcp__nest-api__invoke_operation for Bird APIs"
```

#### 3. Output Format Specification
```markdown
✅ "Generate terraform configs in this structure:
    main.tf - resource definitions
    variables.tf - configuration
    outputs.tf - resource IDs
    README.md - deployment instructions"
```

#### 4. Error Handling
```markdown
✅ "If project not found, ask user to create one first"
✅ "If foundation missing, offer to create it"
✅ "If API call fails, explain error and suggest retry"
```

---

## 🔧 Prompt Composition

### Agent-Specific Prompts

Each agent should have a specialized prompt that includes:

1. **Base System Prompt** (from system-prompt.md)
2. **Agent Role** (from agents/README.md)
3. **Enabled Skills** (from skills/)
4. **Project Context** (if available)

### Example Composition

```typescript
// Compose prompt for Research Analyst
const prompt = `
${baseSystemPrompt}

## Your Role: Research Analyst

You are the data discovery specialist responsible for:
- Discovering workspace data model
- Identifying events and metrics
- Researching business context
- Calculating baseline performance

## Your Deliverables

You must produce:
1. foundation.md - Complete business context
2. data-model.md - Objects, attributes, associations
3. events-catalog.md - All events with properties
4. baseline-metrics.yaml - Current performance data

## Your Skills

${skills.map(skill => skill.promptTemplate).join('\n\n')}

## Current Project Context

${projectContext}
`;
```

---

## 📊 Prompt Templates

### Template: Context Gathering

```markdown
# Context Gathering

## Step 1: Fetch Project
Use: mcp__nest-api__invoke_operation
Operation: tasks:getProject
PathParams: { id: "{projectId}" }

## Step 2: Read Foundation
Use: mcp__nest-api__invoke_operation
Operation: content:getDocument
PathParams: { id: "{foundationDocumentId}" }

## Step 3: Get Recent Activity
Use: mcp__nest-api__invoke_operation
Operation: tasks:listTasks
Body: {
  projectId: "{projectId}",
  limit: 5,
  orderBy: "updatedAt"
}
```

### Template: Campaign Generation

```markdown
# Campaign Generation

## Step 1: Analyze Strategy
Review strategic brief and identify:
- Target audience criteria
- Campaign objectives
- Success metrics
- Budget constraints

## Step 2: Design Campaign
Create campaign structure:
- Audience segmentation
- Content variants (A/B testing)
- Send timing
- Holdout groups

## Step 3: Generate Artifacts
Produce:
- audience.tf
- template.tf
- campaign.tf
- deployment-plan.md
```

---

## 🧪 Testing Prompts

### Unit Tests

Test individual prompt components:

```typescript
describe('System Prompt', () => {
  it('includes project context instructions', () => {
    expect(systemPrompt).toContain('tasks:getProject');
  });
  
  it('includes artifact format specifications', () => {
    expect(systemPrompt).toContain('audience.tf');
  });
});
```

### Integration Tests

Test complete agent workflows:

```typescript
describe('Research Analyst Workflow', () => {
  it('completes discovery phase', async () => {
    const result = await agent.run({
      role: 'research-analyst',
      projectId: 'proj-123'
    });
    
    expect(result.deliverables).toContain('foundation.md');
    expect(result.deliverables).toContain('data-model.md');
  });
});
```

---

## 📋 Best Practices

### 1. Be Specific
- Provide exact API operations to use
- Specify expected output formats
- Include example inputs/outputs

### 2. Handle Edge Cases
- No project context available
- Missing foundation document
- API errors
- Invalid data

### 3. Provide Context
- Explain WHY each step is needed
- Show how outputs will be used
- Link to related documentation

### 4. Use Examples
- Include few-shot examples
- Show successful workflows
- Demonstrate error handling

### 5. Iterate
- Test prompts with real scenarios
- Refine based on results
- Document what works

---

## 🔗 Related

- [`../agents/README.md`](../agents/README.md) - Agent specifications
- [`../skills/README.md`](../skills/README.md) - Skill specifications
- [`../reference/skills-framework.md`](../reference/skills-framework.md) - Modular skills approach

---

## Next Steps

1. **Review system-prompt.md** - Understand base prompt
2. **Customize per agent** - Create agent-specific prompts
3. **Test with skills** - Verify skill composition works
4. **Iterate** - Refine based on results
