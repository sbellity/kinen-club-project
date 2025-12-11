# Agent Prompts & Skills - Implementation Plan

## Overview

Complete plan for implementing the Marketing Agent's prompts and skills, inspired by [awesome-claude-skills](https://github.com/VoltAgent/awesome-claude-skills).

---

## What We're Building

### Core Components

1. **System Prompt** - Base agent instructions
2. **Skills Library** - Modular, reusable capabilities
3. **Skill Loader** - Dynamic skill loading based on context
4. **Testing Framework** - Validate skills work correctly

### Key Innovation: Modular Skills

Instead of one massive prompt, we break capabilities into discrete **skills** that can be:
- ✅ Loaded dynamically (only what's needed)
- ✅ Tested independently
- ✅ Reused across contexts
- ✅ Updated without affecting others

---

## Implementation Timeline

### Week 1: Foundation (9 hours)

#### Day 1-2: System Prompt (2 hours)
- [x] Write core agent identity
- [x] Add project context integration
- [x] Define tool usage guidelines
- [x] Specify artifact formats
- [x] Add error handling patterns

**Deliverable**: [`system-prompt.md`](./system-prompt.md) ✅

#### Day 3: Context Gathering Skill (2 hours)
- [x] Write skill instructions
- [x] Add API call examples
- [x] Handle missing data cases
- [x] Add test cases

**Deliverable**: [`skills/context-gathering.md`](./skills/context-gathering.md) ✅

#### Day 4: Campaign Generation Skill (3 hours)
- [ ] Write skill instructions
- [ ] Add campaign templates
- [ ] Provide few-shot examples
- [ ] Add test cases

**Deliverable**: `skills/campaign-generation.md`

#### Day 5: Terraform Generation Skill (2 hours)
- [ ] Write skill instructions
- [ ] Add terraform templates
- [ ] Provide validation rules
- [ ] Add test cases

**Deliverable**: `skills/terraform-generation.md`

---

### Week 2: Enhancement (6 hours)

#### Day 1: Data Analysis Skill (2 hours)
- [ ] Customer segment analysis
- [ ] Performance benchmarking
- [ ] Pattern identification

**Deliverable**: `skills/data-analysis.md`

#### Day 2: Dashboard Creation Skill (2 hours)
- [ ] Dashboard YAML generation
- [ ] Malloy query templates
- [ ] Metric definitions

**Deliverable**: `skills/dashboard-creation.md`

#### Day 3: Session Management Skill (2 hours)
- [ ] Task creation/updates
- [ ] Comment logging
- [ ] Artifact tracking

**Deliverable**: `skills/session-management.md`

---

### Week 3: Advanced Skills (6 hours)

#### Day 1: Performance Review Skill (2 hours)
- [ ] Past campaign analysis
- [ ] Success pattern extraction
- [ ] Recommendation generation

**Deliverable**: `skills/performance-review.md`

#### Day 2: Audience Targeting Skill (2 hours)
- [ ] Segment definition
- [ ] Criteria optimization
- [ ] Size estimation

**Deliverable**: `skills/audience-targeting.md`

#### Day 3: Content Creation Skill (2 hours)
- [ ] Email copy generation
- [ ] Subject line optimization
- [ ] CTA suggestions

**Deliverable**: `skills/content-creation.md`

---

### Week 4: Testing & Optimization (6 hours)

#### Day 1-2: Skill Testing (4 hours)
- [ ] Write test scenarios
- [ ] Run integration tests
- [ ] Validate outputs
- [ ] Fix issues

**Deliverable**: Test suite passing

#### Day 3: Prompt Optimization (2 hours)
- [ ] Reduce token usage
- [ ] Improve clarity
- [ ] Add more examples
- [ ] Refine constraints

**Deliverable**: Optimized prompts

---

## Skill Priority Matrix

### Must Have (Week 1)
| Skill | Priority | Effort | Impact |
|-------|----------|--------|--------|
| System Prompt | P0 | 2h | Critical |
| Context Gathering | P0 | 2h | Critical |
| Campaign Generation | P0 | 3h | High |
| Terraform Generation | P0 | 2h | High |

### Should Have (Week 2)
| Skill | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Data Analysis | P1 | 2h | High |
| Dashboard Creation | P1 | 2h | Medium |
| Session Management | P1 | 2h | Medium |

### Nice to Have (Week 3)
| Skill | Priority | Effort | Impact |
|-------|----------|--------|--------|
| Performance Review | P2 | 2h | Medium |
| Audience Targeting | P2 | 2h | Medium |
| Content Creation | P2 | 2h | Low |

---

## Skill Dependencies

```
System Prompt (base)
    ↓
Context Gathering (always first)
    ↓
    ├─→ Data Analysis
    │      ↓
    │   Campaign Generation
    │      ↓
    │   Terraform Generation
    │
    └─→ Performance Review
           ↓
        Campaign Generation
```

**Key insight**: Context Gathering must run first, everything else depends on it.

---

## Implementation Checklist

### Phase 1: Core Skills ✅

- [x] System prompt written
- [x] Context gathering skill complete
- [ ] Campaign generation skill
- [ ] Terraform generation skill
- [ ] Basic testing

### Phase 2: Enhanced Skills

- [ ] Data analysis skill
- [ ] Dashboard creation skill
- [ ] Session management skill
- [ ] Integration testing

### Phase 3: Advanced Skills

- [ ] Performance review skill
- [ ] Audience targeting skill
- [ ] Content creation skill
- [ ] Full test coverage

### Phase 4: Optimization

- [ ] Token usage optimization
- [ ] Prompt clarity improvements
- [ ] More examples added
- [ ] Edge cases handled

---

## Testing Strategy

### Unit Tests (Per Skill)

For each skill, test:
- ✅ Happy path (everything works)
- ✅ Missing data (graceful handling)
- ✅ API errors (retry/fallback)
- ✅ Edge cases (empty data, large data)

**Example** (Context Gathering):
```typescript
describe('Context Gathering Skill', () => {
  it('fetches project metadata', async () => {
    const result = await runSkill('context-gathering', {
      projectId: 'project-123'
    });
    
    expect(result.project).toBeDefined();
    expect(result.foundation).toBeDefined();
    expect(result.recentActivity).toBeDefined();
  });
  
  it('handles missing foundation', async () => {
    const result = await runSkill('context-gathering', {
      projectId: 'project-new'
    });
    
    expect(result.foundationMissing).toBe(true);
    expect(result.offerToCreate).toBe(true);
  });
});
```

### Integration Tests (Full Flows)

Test complete user journeys:

**Test 1: New Campaign Flow**
```
1. User: "Create a VIP campaign"
2. Agent: [Runs context-gathering]
3. Agent: [Runs data-analysis]
4. Agent: [Runs campaign-generation]
5. User: "Deploy it"
6. Agent: [Runs terraform-generation]
7. Verify: Valid terraform configs created
```

**Test 2: Resume Session Flow**
```
1. Load existing session with projectId
2. Agent: [Runs context-gathering]
3. Agent: "Welcome back! Last time we discussed..."
4. Verify: Context correctly restored
```

**Test 3: Error Recovery Flow**
```
1. User: "Create campaign"
2. Agent: [Runs context-gathering]
3. API error occurs
4. Agent: Explains error, suggests retry
5. User: "Retry"
6. Agent: Successfully fetches context
7. Verify: Graceful error handling
```

### Evaluation Criteria

For each skill, evaluate:

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| **Correctness** | 95%+ | Output matches expected format |
| **Completeness** | 100% | All required fields present |
| **Clarity** | Marketer-friendly | No technical jargon |
| **Efficiency** | < 5 API calls | Minimize API usage |
| **Error Handling** | 100% | All errors handled gracefully |

---

## Skill Composition Examples

### Example 1: Simple Campaign Request

```
User: "Help me create a campaign"

Agent workflow:
1. context-gathering → Get project data
2. campaign-generation → Generate campaign plan
3. [Wait for user approval]
4. terraform-generation → Generate deployment files

Skills used: 3
Time: ~10 seconds
API calls: 5
```

### Example 2: Data-Driven Campaign

```
User: "Create a campaign based on past performance"

Agent workflow:
1. context-gathering → Get project data
2. performance-review → Analyze past campaigns
3. data-analysis → Identify patterns
4. campaign-generation → Generate optimized plan
5. [Wait for user approval]
6. terraform-generation → Generate deployment files

Skills used: 5
Time: ~15 seconds
API calls: 8
```

### Example 3: Complete Campaign with Dashboard

```
User: "Create a campaign and set up tracking"

Agent workflow:
1. context-gathering → Get project data
2. campaign-generation → Generate campaign plan
3. dashboard-creation → Create dashboard.yaml
4. [Wait for user approval]
5. terraform-generation → Generate deployment files
6. session-management → Log session activity

Skills used: 5
Time: ~12 seconds
API calls: 7
```

---

## Prompt Engineering Best Practices

### 1. Clear Instructions

❌ **Vague**:
```
"Help with campaigns"
```

✅ **Specific**:
```
"When user requests a campaign:
1. Fetch project context (context-gathering skill)
2. Analyze goals and constraints
3. Generate 2-3 campaign options
4. Present in artifact format
5. Wait for user selection"
```

### 2. Few-Shot Examples

Always provide examples:

```markdown
## Example Campaign Plan

<artifact type="campaign-plan" id="vip-upgrade">
name: VIP Upgrade Campaign
audience: 1,200 VIP customers (LTV > $1K)
goal: 25% upgrade rate
strategy: 5-email sequence over 21 days
expected_impact: $15K-25K MRR
</artifact>
```

### 3. Constraints

Be explicit about what NOT to do:

```markdown
Constraints:
- ❌ Don't generate campaigns without project context
- ❌ Don't exceed budget constraints
- ❌ Don't target audiences < 100 contacts
- ✅ Always validate terraform configs
- ✅ Always provide next steps
```

### 4. Error Handling

Provide recovery patterns:

```markdown
If API error:
1. Explain error in marketing terms
2. Suggest specific action (retry, check permissions)
3. Provide fallback option if available

Example:
"I couldn't fetch your customer data (API timeout). 
Let's retry in a moment, or I can proceed with 
general recommendations while we wait."
```

---

## Next Steps

### Immediate (This Week)
1. ✅ System prompt complete
2. ✅ Context gathering skill complete
3. [ ] Campaign generation skill
4. [ ] Terraform generation skill
5. [ ] Basic testing

### Near-term (Next Week)
1. [ ] Data analysis skill
2. [ ] Dashboard creation skill
3. [ ] Session management skill
4. [ ] Integration testing

### Future (Weeks 3-4)
1. [ ] Advanced skills
2. [ ] Full test coverage
3. [ ] Prompt optimization
4. [ ] Production deployment

---

## Success Metrics

### Week 1 Success
- ✅ System prompt written
- ✅ 1 skill complete (context-gathering)
- [ ] 2 more skills complete (campaign, terraform)
- [ ] Basic tests passing

### Week 2 Success
- [ ] 3 more skills complete
- [ ] Integration tests passing
- [ ] Agent can generate and deploy campaigns

### Week 3 Success
- [ ] 3 advanced skills complete
- [ ] Full test coverage
- [ ] Error handling validated

### Week 4 Success
- [ ] All skills optimized
- [ ] Production ready
- [ ] Documentation complete

---

## Resources

- **System Prompt**: [`system-prompt.md`](./system-prompt.md)
- **Skills Framework**: [`skills-framework.md`](./skills-framework.md)
- **Context Gathering**: [`skills/context-gathering.md`](./skills/context-gathering.md)
- **awesome-claude-skills**: https://github.com/VoltAgent/awesome-claude-skills

---

**Total Effort**: 27 hours over 4 weeks
**Status**: ✅ Week 1 started (system prompt + context gathering complete)
**Next**: Campaign generation skill
