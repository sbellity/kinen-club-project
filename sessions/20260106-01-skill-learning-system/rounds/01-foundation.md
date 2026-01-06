---
date: 2026-01-06
started_at: 2026-01-06T10:00:00
kinen_session: 20260106-01-skill-learning-system
artifact_type: round
kinen_round: 1
status: complete
aliases:
  - "skill-learning-system - Foundation"
  - "skill-learning-system - Round 1"
tags:
  - space/nest
  - domain/architecture
  - type/technical-architecture
  - tech/typescript
summary: "Foundational exploration of skill learning system - defining the problem space and key design decisions"
---

# Round 1: Foundation

> [!info] Building on
> This round initializes the session. See [[init|Session Initialization]] for goals and context.

## This Round Focus

- Define what "skill learning" means in llmchain context
- Explore the scope and ownership of learned skills
- Understand skill learning triggers and capture mechanisms
- Examine integration with existing systems

---

## Questions

### Q1.1: What Problem Are We Actually Solving?

**Context**: Before diving into implementation, let's sharpen our understanding of the problem. llmchain's current memory system handles:

| Memory Type | Current Support | Scope |
|-------------|-----------------|-------|
| **Declarative** | ✅ Session context, scratchpad | Session-scoped |
| **Episodic** | ✅ Contributions, artifacts | Session-scoped |
| **Procedural** | ❌ Not supported | N/A |

**Procedural memory** = knowing *how* to do something (procedures, workflows, patterns).

**Key Question**: What specific pain points do you see today that skill learning would address?

**Examples of procedural knowledge that could be captured**:
- "How to enrich CRM contacts with LinkedIn data" (multi-step workflow)
- "Pattern for building welcome journey flows" (reusable template)
- "How to debug common API integration issues" (troubleshooting procedure)

> [!note] Answer
>All of those would be relevant.
>See also all agents definitions or skills from earlier versions of the llmchain repo (see: https://github.com/messagebird-dev/llmchain/tree/feat/campaign-agents-cel/plugins/bird-marketing)

---

### Q1.2: Scope - Who Owns Learned Skills?

**Context**: This is a fundamental architectural decision that affects storage, access control, and sharing.

**Option A: Per-workspace**
- Skills belong to a workspace, shared by all users in that workspace
- Matches existing auth model (workspaceId is primary tenant)
- **Pros**: Team knowledge, natural isolation
- **Cons**: No personal skills, potential noise from others' skills

**Option B: Per-user**
- Skills belong to individual users, private by default
- Personal assistant model
- **Pros**: Personal customization, privacy
- **Cons**: No knowledge sharing, duplicate learning across users

**Option C: Hybrid (user creates, workspace promotes)**
- Users create personal skills
- Workspace admins can "promote" useful skills to workspace-wide
- **Pros**: Best of both - personal experimentation + team curation
- **Cons**: More complex, requires promotion workflow

**Questions**:
1. What's your primary use case - personal assistant or team knowledge?
2. Do different users working with similar tasks learn the same things today?
3. Is there value in a "marketplace" of skills eventually?

> [!note] Answer
>Option C
>1. Both use case are valid. But the real important one is to capture organizational procedural knowledge and encode it as actionable skills, directly usable by agents.
>   From PRAXIS Paper: 
>   "A naïve approach is a priori procedural specification: a human writes rules or standard operating procedures (SOPs) that are included in the agent’s context at inference time. This approach effectively reduces procedures to a large bundle of facts. In practice, this approach faces challenges because (1) many procedures are not fully documented, as humans are often trained by observation rather than by reading long SOPs; (2) enumerating all states and edge cases in a combinatorial space is difficult; and (3) procedures can become obsolete quickly as environments change. We argue that a more robust approach is to learn procedures a posteriori from demonstrations or experience."
> 2. Ideally Learned skills should be "discovered" by agents as they do their thing. There needs to be a discovery mechanism where agents can pick up skills from an indexed skills library at runtime. PRAXIS paper mentions indexing those skills as "state-dependent memory" but we can design different ways, either via semantic search or tools injected in the agents' context... probably something hybrid, we will need to experiment and adjust depending on the actual number of skills available on the workspace. 
> 3. yes for markeplace, skills could be registered via connectors (for example installing a saleforce or shopify connector would come with platform specific skills), created on the workspace by the admin or managers as a way to capture the organization's SOPs and/or automatically "discovered/learned" by agents.

---

### Q1.3: Trigger - When Should Skills Be Learned?

**Context**: This affects both the capture quality and user experience.

**Option A: Explicit command**
- User explicitly says "save this as a skill" or "/skill create"
- Like Letta's `/skill` command
- **Pros**: Clear intent, no noise, user control
- **Cons**: Low adoption - users forget, miss opportunities

**Option B: Agent reflection (autonomous)**
- Agent analyzes after completing complex tasks
- Proposes skill if it detects reusable patterns
- **Pros**: Higher capture rate, surfaces implicit knowledge
- **Cons**: May be noisy, requires good pattern detection

**Option C: Hybrid - agent proposes, user confirms**
- Agent suggests: "This workflow could be saved as a skill. Would you like to?"
- User approves or dismisses
- **Pros**: Balance of capture rate and quality
- **Cons**: Can feel intrusive if too frequent

**Option D: Post-session batch analysis**
- Analyze successful sessions asynchronously
- Present skill candidates in a review interface
- **Pros**: Comprehensive, non-intrusive during work
- **Cons**: Delayed, disconnected from context

**What triggers feel right for your workflow?**

> [!note] Answer
>Both C and D

---

### Q1.4: Integration - Static vs Learned Skills

**Context**: llmchain already has static skills in `packages/ai-tool/src/skills/definitions/`. How should learned skills relate to them?

**Current static skill structure**:
```
definitions/
  journey-building/
    SKILL.md          # Main instructions
    references/       # Additional docs
      PATTERNS.md
      CONDITIONS.md
```

**Option A: Same namespace, different source**
- Learned skills use same `SkillTier1/Tier2` types
- Distinguished by a `source: "static" | "learned"` field
- **Pros**: Unified runtime, consistent UX
- **Cons**: Namespace collisions possible

**Option B: Separate namespace with prefix**
- Learned skills use `ws:skill-name` or `user:skill-name` prefix
- Clear separation from static skills
- **Pros**: No collisions, clear provenance
- **Cons**: Two mental models

**Option C: Learned skills as "overlays"**
- Learned skills can extend/customize static skills
- Like inheritance: `extends: journey-building`
- **Pros**: Build on existing knowledge
- **Cons**: Complex relationship management

**How do you see these coexisting?**

> [!note] Answer
>C
>We can see if we can leverage the existing memory infrastructure introduced recenltly to "learn" and store those new skills
---

### Q1.5: Skill Content - What Gets Captured?

**Context**: The quality of captured skills depends on what we extract. Letta's SKILL.md format includes:

```yaml
---
name: Skill Name
description: When to use this skill
tools: [tool1, tool2]  # Gated tools
---
# Instructions
Step-by-step guidance...
```

**What should learned skills contain?**

| Component | Include? | Notes |
|-----------|----------|-------|
| **Name** | ✅ Required | User-editable |
| **Description** | ✅ Required | When to activate |
| **Instructions** | ✅ Required | The actual procedure |
| **Example inputs** | Maybe | Queries that trigger this skill |
| **Tool suggestions** | Maybe | Tools commonly used |
| **Provenance** | Maybe | Session/agent that created it |
| **Example outputs** | Maybe | What success looks like |

**Questions**:
1. Should learned skills be able to gate tools like static skills?
2. How important is capturing "when to use this" vs "how to do this"?
3. Should we capture negative examples (when NOT to use)?

> [!note] Answer
>AgentSkills are now a standard https://agentskills.io/home
>Discovered skills needs to respect that. 
>see: https://github.com/anthropics/skills
>https://code.claude.com/docs/en/skills
>And for best practives: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

---

### Q1.6: Discovery - How Are Skills Surfaced?

**Context**: A skill is only useful if it's activated when relevant. Current static skills are:
1. Listed in agent definition frontmatter
2. Agent sees metadata in context
3. Agent calls `skills_load` to activate

**For learned skills, discovery could work via**:

**Option A: Same as static - agent decides**
- All learned skills appear in agent's `skills` memory block
- Agent reads descriptions, decides to load
- **Pros**: Consistent with existing, agent autonomy
- **Cons**: Context bloat if many skills, agent may miss relevant ones

**Option B: Semantic matching on query**
- System matches user query to skill `example_inputs` or embeddings
- Pre-filters to most relevant skills
- **Pros**: Reduces noise, surfaces relevant skills
- **Cons**: Requires embedding infrastructure, may miss edge cases

**Option C: Explicit user invocation**
- User says "use my CRM enrichment skill"
- Skills are tools user explicitly calls
- **Pros**: Clear, no magic
- **Cons**: Requires users to remember skill names

**Option D: Hybrid - system suggests, agent/user confirms**
- System surfaces top-N relevant skills in context
- Agent or user decides which to activate
- **Pros**: Balance of automation and control
- **Cons**: Extra step in flow

**How should learned skills be discovered?**

> [!note] Answer
>I would say D. But as discussed earlier I think we will need to refine the approach and also adapt depending on the number of skills present on the workspace. 


---

### Q1.7: Quality - How to Maintain Skill Quality?

**Context**: Unlike static skills (curated at development time), learned skills could accumulate noise, become outdated, or vary in quality.

**Quality mechanisms to consider**:

| Mechanism | Description | Complexity |
|-----------|-------------|------------|
| **Usage tracking** | Track which skills are used | Low |
| **Feedback loop** | "Was this skill helpful?" | Low |
| **Decay/pruning** | Unused skills get archived after N days | Medium |
| **Versioning** | Skills can be updated, maintain history | Medium |
| **Review workflow** | Team can review before promotion | High |
| **Confidence scoring** | ML-based quality estimation | High |

**Questions**:
1. How worried are you about skill quality degrading over time?
2. Is manual curation acceptable, or does it need to be automated?
3. Should low-quality skills be auto-archived or manually deleted?

> [!note] Answer
>This probably deserves a dedicated session and adjust based on experience. 
>Maybe the background agent responsible for discovering new skills should also be responsible for maintaining their quality.
>Agents that use skills will be goal driven, so maybe measuring their success when using skills can be a way to measure skills relevance
>Also there are now best practices and guidelines for skills, we can have constant review and eval of skills against guidelines.

---

### Q1.8: UX - User Interaction Points

**Context**: The skill learning system needs clear user touchpoints for:

1. **Confirmation** - When agent proposes a skill
2. **Editing** - Modify skill name/description/instructions
3. **Management** - List, browse, archive, delete skills
4. **Feedback** - Rate skill helpfulness

**Questions**:
1. Where should skill management live in the UI?
   - Dedicated "Skills" page?
   - Inline in conversation?
   - Both?

2. How rich should the skill editor be?
   - Simple text fields?
   - Markdown editor with preview?
   - Visual flow builder?

3. How should skill proposals appear?
   - Toast/notification?
   - Inline card in conversation?
   - Deferred to review queue?

> [!note] Answer
>1. probably needs a dedicated section in UI or at least a way to list skills and let chat agent respond with list of skills when asked by user.
>2. Simple markdown editor
>3. Inline cards when skills are discovered during a session / review queue when discovered in background


---

### Q1.9: Minimum Viable Implementation

**Context**: Given the complexity, what would a useful MVP look like?

**MVP Candidate - Basic Learned Skills**:
- [ ] Database table for learned skills (per-workspace)
- [ ] `propose_skill` tool for agents to suggest skills
- [ ] Simple confirmation UI (inline in chat)
- [ ] Skills appear in agent's skill block alongside static skills
- [ ] Basic usage tracking (last_used_at, use_count)
- [ ] Simple management page (list, edit, delete)

**Not in MVP**:
- Semantic matching/embeddings
- Per-user skills
- Skill versioning
- Automated quality scoring
- Cross-workspace sharing

**Does this scope feel right? What would you add/remove?**

> [!note] Answer
>ok

---

### Q1.10: Related Systems - What Can We Learn From?

**Context**: Other systems have solved similar problems:

| System | Approach | Notes |
|--------|----------|-------|
| **Letta** | `.skills/` directory with SKILL.md files | File-based, portable, explicit |
| **Cursor Rules** | `.cursor/rules/` with markdown files | Project-scoped, always active |
| **GitHub Copilot** | Implicit learning from codebase patterns | No explicit skill capture |
| **ChatGPT Memory** | Key facts extracted from conversations | Declarative, not procedural |
| **Custom GPTs** | Instructions + files uploaded | Static, not learned |

**Key observations from Letta**:
- Skills are directories with `SKILL.md` + optional `references/`
- Two-tier: description always visible, instructions loaded on demand
- `skills_load` tool to activate
- `skills_load_resource` for reference docs
- Portable across different agent products

**What aspects of these systems resonate with you?**

> [!note] Answer
>I am curious to see how letta does this in more details and how learned skills integrate more generally with their memory system

---

## Summary

This round explores the foundational questions for a skill learning system:

1. **Problem definition**: What procedural knowledge gaps exist?
2. **Scope**: Per-workspace vs per-user ownership
3. **Trigger**: How skill learning is initiated
4. **Integration**: Relationship with static skills
5. **Content**: What's captured in a learned skill
6. **Discovery**: How skills are surfaced when relevant
7. **Quality**: Maintaining skill quality over time
8. **UX**: User interaction design
9. **MVP**: Minimum viable scope
10. **Prior art**: Learning from existing systems

**Next Steps**: After your responses, I'll synthesize decisions and move to Round 2 focusing on concrete architecture and database design.
