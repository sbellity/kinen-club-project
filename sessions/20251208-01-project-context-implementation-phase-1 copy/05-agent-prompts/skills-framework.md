# Skills Framework (Inspired by awesome-claude-skills)

## Overview

Based on [VoltAgent/awesome-claude-skills](https://github.com/VoltAgent/awesome-claude-skills), we can structure our Marketing Agent capabilities as modular, reusable **Skills**.

**Key Insight**: Skills are specialized modules containing instructions, scripts, and resources that enable Claude to perform specific tasks efficiently. They can be loaded dynamically without impacting performance.

---

## What We Can Learn

### 1. **Modular Skill Structure**

From awesome-claude-skills, each skill typically contains:
- **Instructions**: Clear, step-by-step guidance
- **Examples**: Few-shot examples of expected outputs
- **Resources**: Templates, schemas, or reference data
- **Constraints**: What to do and what NOT to do

**Applied to Marketing Agent**:
```
skills/
├── context-gathering/
│   ├── instructions.md      # How to fetch project context
│   ├── examples.md          # Example API calls and responses
│   └── schema.json          # Expected data structure
├── campaign-generation/
│   ├── instructions.md      # How to generate campaigns
│   ├── examples.md          # Example campaign plans
│   └── templates/           # Campaign templates
└── terraform-generation/
    ├── instructions.md      # How to generate .tf files
    ├── examples.md          # Example terraform configs
    └── templates/           # Terraform templates
```

---

### 2. **Dynamic Skill Loading**

**From awesome-claude-skills**: Skills are loaded dynamically based on context, not all at once.

**Applied to Marketing Agent**:
```typescript
// In system prompt
const basePrompt = getBaseAgentPrompt();

// Load skills based on session context
if (hasProjectContext) {
  prompt += loadSkill('context-gathering');
  prompt += loadSkill('campaign-generation');
}

if (needsDeployment) {
  prompt += loadSkill('terraform-generation');
}

if (needsDashboard) {
  prompt += loadSkill('dashboard-creation');
}
```

**Benefits**:
- Smaller prompts (better performance)
- Only load what's needed
- Easier to maintain individual skills

---

### 3. **Skill Categories**

**From awesome-claude-skills**, skills are organized by category:
- Document Creation
- Creative and Design
- Development
- Branding and Communication
- Meta (creating new skills)

**Applied to Marketing Agent**:

#### **Category 1: Context & Analysis**
- `context-gathering` - Fetch project data
- `data-analysis` - Analyze customer segments
- `performance-review` - Review past campaigns

#### **Category 2: Campaign Creation**
- `campaign-generation` - Generate campaign strategies
- `audience-targeting` - Define audience criteria
- `content-creation` - Create email copy

#### **Category 3: Technical Generation**
- `terraform-generation` - Generate .tf files
- `dashboard-creation` - Create dashboard.yaml
- `template-generation` - Generate email templates

#### **Category 4: Session Management**
- `session-tracking` - Create/update tasks
- `artifact-management` - Manage session outputs
- `error-recovery` - Handle errors gracefully

#### **Category 5: Meta**
- `skill-creation` - Create new skills
- `prompt-optimization` - Improve prompts

---

### 4. **Skill Template Structure**

**From awesome-claude-skills**, each skill follows a consistent structure:

```markdown
# Skill Name

## Purpose
What this skill does and when to use it

## Prerequisites
- Required context
- Required tools
- Required permissions

## Instructions
Step-by-step process

## Examples
Few-shot examples

## Constraints
What NOT to do

## Testing
How to validate the skill works
```

**Applied to Marketing Agent** - Example:

```markdown
# Context Gathering Skill

## Purpose
Fetch and consolidate project context at session start

## Prerequisites
- projectId provided in initial prompt
- MCP access to Bird APIs
- tasks:getProject permission

## Instructions

### Step 1: Fetch Project Metadata
```typescript
mcp__nest-api__invoke_operation({
  operation: "tasks:getProject",
  pathParams: { id: projectId }
})
```

### Step 2: Read Foundation Document
```typescript
// Get foundation doc ID from project metadata
const foundationId = project.metadata.foundation.documentId;

mcp__nest-api__invoke_operation({
  operation: "content:getDocument",
  pathParams: { id: foundationId }
})
```

### Step 3: Get Recent Activity
```typescript
mcp__nest-api__invoke_operation({
  operation: "tasks:listTasks",
  body: {
    projectId: projectId,
    limit: 5,
    orderBy: "updatedAt",
    orderDirection: "desc"
  }
})
```

## Examples

### Example 1: Successful Context Gathering
[Show complete example with API responses]

### Example 2: Missing Foundation
[Show how to handle missing foundation]

## Constraints
- ❌ Don't proceed without project context
- ❌ Don't cache stale data (foundation is live)
- ❌ Don't fetch more than needed (limit API calls)

## Testing
- [ ] Can fetch project metadata
- [ ] Can read foundation document
- [ ] Can get recent activity
- [ ] Handles missing foundation gracefully
```

---

## Skill Composition Patterns

### Pattern 1: Sequential Skills

Skills that must run in order:

```
context-gathering → data-analysis → campaign-generation → terraform-generation
```

**Implementation**:
```markdown
When user requests a campaign:
1. Run context-gathering skill
2. Run data-analysis skill
3. Run campaign-generation skill
4. If user approves, run terraform-generation skill
```

---

### Pattern 2: Conditional Skills

Skills that run based on conditions:

```
IF hasProjectContext THEN context-gathering
IF needsAnalysis THEN data-analysis
IF needsDashboard THEN dashboard-creation
```

**Implementation**:
```markdown
At session start:
- Check if projectId provided
  → YES: Load context-gathering skill
  → NO: Load standalone-advice skill

During session:
- User asks for dashboard
  → Load dashboard-creation skill
```

---

### Pattern 3: Parallel Skills

Skills that can run independently:

```
campaign-generation ∥ dashboard-creation ∥ template-generation
```

**Implementation**:
```markdown
When generating complete campaign:
- Generate campaign strategy (campaign-generation)
- Generate dashboard config (dashboard-creation)
- Generate email templates (template-generation)

These can be done in any order.
```

---

## Skill Development Process

### 1. **Identify Need**
```
User needs: "Generate campaigns based on past performance"
Skill needed: performance-review
```

### 2. **Define Scope**
```markdown
# Performance Review Skill

**In scope**:
- Fetch past campaign metrics
- Calculate success rates
- Identify patterns
- Provide recommendations

**Out of scope**:
- Generating new campaigns (that's campaign-generation)
- Deploying campaigns (that's terraform-generation)
```

### 3. **Write Instructions**
```markdown
## Instructions

1. Fetch past campaigns for this project
2. Calculate key metrics (open rate, click rate, conversion)
3. Identify top performers (>40% open rate)
4. Identify underperformers (<30% open rate)
5. Extract patterns (timing, audience, content)
6. Generate recommendations
```

### 4. **Create Examples**
```markdown
## Example Output

Based on 12 past campaigns:

**Top Performers** (3 campaigns):
- VIP Welcome Series: 45% open, 12% click, 8% conversion
- Product Launch: 42% open, 10% click, 6% conversion
- Re-engagement: 41% open, 9% click, 5% conversion

**Patterns**:
- VIP segment: 2x better performance
- Tuesday/Thursday sends: 1.5x better opens
- Personalized subject lines: 1.3x better opens

**Recommendations**:
1. Focus on VIP segment for high-value campaigns
2. Schedule sends for Tuesday/Thursday 10am
3. Use personalization in subject lines
```

### 5. **Test & Iterate**
```markdown
## Testing

Test cases:
- [ ] Works with 0 past campaigns (new project)
- [ ] Works with 1-5 campaigns (limited data)
- [ ] Works with 10+ campaigns (good data)
- [ ] Handles missing metrics gracefully
- [ ] Provides actionable recommendations
```

---

## Skill Library Structure

```
05-agent-prompts/
├── README.md
├── system-prompt.md
├── skills-framework.md (this doc)
├── skills/
│   ├── 01-context/
│   │   ├── context-gathering.md
│   │   ├── data-analysis.md
│   │   └── performance-review.md
│   ├── 02-campaign/
│   │   ├── campaign-generation.md
│   │   ├── audience-targeting.md
│   │   └── content-creation.md
│   ├── 03-technical/
│   │   ├── terraform-generation.md
│   │   ├── dashboard-creation.md
│   │   └── template-generation.md
│   ├── 04-session/
│   │   ├── session-tracking.md
│   │   ├── artifact-management.md
│   │   └── error-recovery.md
│   └── 05-meta/
│       ├── skill-creation.md
│       └── prompt-optimization.md
└── templates/
    ├── skill-template.md
    └── test-template.md
```

---

## Key Takeaways from awesome-claude-skills

### 1. **Modularity is Key**
✅ Break capabilities into discrete skills
✅ Each skill has clear purpose and scope
✅ Skills can be composed and reused

### 2. **Dynamic Loading**
✅ Load skills based on context
✅ Don't load everything at once
✅ Better performance, clearer prompts

### 3. **Consistent Structure**
✅ Every skill follows same template
✅ Makes skills easier to write and maintain
✅ Easier for agent to understand

### 4. **Examples Matter**
✅ Provide few-shot examples
✅ Show both success and error cases
✅ Include edge cases

### 5. **Testing is Essential**
✅ Define test cases for each skill
✅ Validate inputs and outputs
✅ Handle errors gracefully

---

## Implementation Plan

### Phase 1: Core Skills (Week 1)
1. **context-gathering** - Essential for project work
2. **campaign-generation** - Core functionality
3. **terraform-generation** - Deployment capability

### Phase 2: Enhanced Skills (Week 2)
4. **data-analysis** - Better recommendations
5. **performance-review** - Learn from past
6. **dashboard-creation** - Performance tracking

### Phase 3: Advanced Skills (Week 3)
7. **audience-targeting** - Sophisticated segmentation
8. **content-creation** - AI-generated copy
9. **template-generation** - Custom templates

### Phase 4: Meta Skills (Week 4)
10. **session-tracking** - Better session management
11. **error-recovery** - Graceful error handling
12. **skill-creation** - Self-improvement

---

## Skill Template

```markdown
# [Skill Name]

## Purpose
[What this skill does and when to use it]

## Prerequisites
- [Required context]
- [Required tools]
- [Required permissions]

## Instructions

### Step 1: [First Step]
[Detailed instructions]

### Step 2: [Second Step]
[Detailed instructions]

### Step 3: [Third Step]
[Detailed instructions]

## Examples

### Example 1: [Success Case]
**Input**: [Example input]
**Process**: [What the agent does]
**Output**: [Expected output]

### Example 2: [Edge Case]
**Input**: [Example input]
**Process**: [How to handle]
**Output**: [Expected output]

## Constraints
- ❌ [What NOT to do]
- ❌ [Common mistakes to avoid]
- ✅ [What TO do instead]

## Testing
- [ ] [Test case 1]
- [ ] [Test case 2]
- [ ] [Test case 3]

## Related Skills
- [Skill that runs before this]
- [Skill that runs after this]
- [Alternative skill for similar purpose]
```

---

## Next Steps

1. **Create skill templates** - Use the template above
2. **Write core skills** - Start with context-gathering
3. **Add examples** - Provide few-shot examples
4. **Test skills** - Validate each skill works
5. **Compose skills** - Build complete workflows

---

## References

- **awesome-claude-skills**: https://github.com/VoltAgent/awesome-claude-skills
- **Claude Skills Documentation**: https://docs.anthropic.com/claude/docs/skills
- **Our System Prompt**: [`system-prompt.md`](./system-prompt.md)
