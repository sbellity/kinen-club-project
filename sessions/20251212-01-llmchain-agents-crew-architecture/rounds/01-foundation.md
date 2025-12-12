# Round 1: Foundation

## This Round Focus

Establishing the foundational understanding of:
- Why a multi-agent architecture (what problem are we solving?)
- What orchestration patterns exist and their tradeoffs
- SDK constraints and capabilities
- Current pain points with single-agent approach

---

## Evidence from Session History (30+ sessions reviewed)

Before diving into questions, here's what I found analyzing your actual sessions:

### Session Quality Spectrum

| Session | Agent Type | Outcome | Key Issues |
|---------|-----------|---------|------------|
| `019b0e65` | saas-semantic | **16 errors** | jq syntax, Malloy regex, entityType mapping, MRN format |
| `019b0e93` | saas-semantic | **7 errors** (improved) | Wrong predicate schema, still inventing format |
| `019b0fb2` | saas-semantic | **Good** - reached Round 2 | Multi-hop join challenge identified |
| `cc-1` | ~~marketing~~ | **Manual Claude Code** | ⚠️ Human-guided, not autonomous agent |
| `0001-*` reference | marketing | **Reference quality** | May also be manually curated |

**Critical insight**: The "best" artifacts were human-guided Claude Code sessions, not autonomous agents. No autonomous session has achieved comparable quality.

### Documented Multi-Agent Issues

**From `MCP-TOOL-ACCESS-ISSUE.md`** (session `019b0c8a`):
> When the **project-coordinator** delegates to **research-analyst** via the `Task` tool, the subagent does **not inherit MCP tool access** from the parent session.

This is a **critical SDK constraint** - subagents lose tool access when delegated.

**From `CONTRADICTORY-INSTRUCTIONS.md`** (session `019b0cf4`):
> The agent receives **contradictory instructions** from three sources:
> 1. Agent definition - Says create PROJECT.md first
> 2. Runtime CLAUDE.md - Says delegate first
> 3. Initial prompt - Says delegate first

Instruction priority conflicts cause inconsistent behavior.

### Observed Error Patterns (from mcp.log files)

| Error Type | Frequency | Root Cause |
|------------|-----------|------------|
| jq `_select` escaping | High | Agent escapes quotes unnecessarily |
| Malloy syntax (`~` regex) | Medium | Malloy doesn't support SQL-style regex |
| entityType mapping | High | `crm.company` → `account` not learned |
| MRN format | Medium | Events need full MRN, not short names |
| Predicate schema | **Very High** | Agent invents schema instead of using docs |

### What Works Well

- **Discovery phase**: Catalog/model enumeration works reliably
- **Round-based interaction**: Sessions with `rounds/` produce better outcomes
- **Artifact tracking**: `PROJECT.md` pattern is effective when used
- **segmentBuilder tool**: Knows correct formats, generates valid predicates

---

## Questions

### Q1.1: Problem Statement - What's Actually Broken?

**Context**: Based on session analysis, the issues are more specific than "single agent limitations."

**Observed Issues** (from actual sessions):
1. **Schema/format knowledge doesn't stick**: Agent repeatedly invents wrong predicate schemas despite documentation
2. **MCP tool inheritance fails**: Subagents via `Task` lose API access (blocking issue for multi-agent)
3. **Instruction priority conflicts**: Agent follows runtime instructions over plugin definitions
4. **Error recovery weak**: 16 errors in one session, no automatic retry or fallback
5. **Context-switching cost**: Same session handles data analysis, strategy, and copywriting

**Questions for you**:
1. The predicate schema issue persists across sessions - is this a prompt engineering problem or fundamental limitation?
2. Given MCP tool inheritance is broken, should we fix the SDK issue or design around it?
3. What's your priority: reliability (fewer errors) or capability (more complex tasks)?
4. ~~Have the "good" sessions been manually guided?~~ **ANSWERED: Yes, `cc-1` was manual Claude Code**

>> 1. I am not sure I need your help to figure this our and maybe produce a bench harness to test different options ?
>> 2. this is already fixed actualls
>> 3. reliabiity and speed. Also composability. I want to be able to add skills declaratively and avoid having to define to much workflows... agents should be able to autonomously make their pllans accordgint to the understanding of what the users wants. Agents need to be goal driven and have clarity into what they have to deliver exactly. Beyond that what makes the whole thing difficult is that it's difficult to control which instructions are loaded by which agents and have reliable behaviour and outcomes
>> 4. We had a few ok-ish sessions but difficult to reproduce and way to slow to be realistic.


### Q1.1b: The Human-Guidance Gap

**New critical question**: What makes human-guided sessions succeed where autonomous sessions fail?

**Hypotheses**:
- **Course correction**: Human catches errors early, agent doesn't compound mistakes
- **Context injection**: Human provides implicit knowledge agent lacks
- **Goal clarity**: Human refines vague requests in real-time
- **Quality bar**: Human rejects bad output, forces retry

**If human guidance is essential**:
- Multi-agent may not help (more agents = more errors to catch)
- The design should optimize for **human checkpoints**, not full autonomy
- "Crew" could mean **human + agent team**, not agent + agent

**Questions**:
1. When you guided `cc-1`, what kinds of interventions did you make?
2. Were they mostly error corrections, or directional guidance?
3. What would you need to trust an autonomous session to run without you?
4. Is "fully autonomous campaign creation" actually the goal, or is "AI-assisted with human review" acceptable?

>> I think the agents need first to get good alingment with user before committing too much work It needs to be aware of the fact that some tasks are expensive and needs to make sure that time is kept and things happen in a timely manner. 
>> All this without constraning workflows. Main agent (or unique agent maybe) needs to be autonimously tracking tasks and project. 
>> Maybe uysing an explicit task management tool like beads would help ? 


---

### Q1.2: Orchestration Pattern Selection

**Context**: You've already experimented with patterns. Let's analyze what was tried.

**What Was Attempted** (from `project-coordinator.md`):
```
project-coordinator
     ↓ (Task delegation)
[research-analyst] → [strategist] → [audience-architect] → [creative-director]
                         ↓                   ↓                    ↓
                    artifacts            artifacts            artifacts
```

**Why It Failed** (from session analysis):
1. **MCP tools not inherited** - subagents can't call Bird APIs
2. **Instruction conflicts** - coordinator vs runtime prompts disagreed
3. **No quality gates** - bad output passed downstream

**Option A: Sequential Pipeline (Current Design Intent)**
```
[Research] → [Strategy] → [Segments] → [Content]
```
- **Evidence**: This is what `project-coordinator.md` describes
- **Blocker**: MCP tool inheritance broken via `Task`
- **Would work if**: We fix SDK or use different delegation mechanism

**Option B: Single Agent with Persona Switching**
```
[marketing-agent]
   ↓ mode: research
   ↓ mode: strategy  
   ↓ mode: content
```
- **Evidence**: This is what `marketing-agent.md` actually does today
- **Status**: Tools work, but quality is poor without human guidance
- **Tradeoff**: One agent must be good at everything (and currently isn't)

**Option C: Sequential Sessions (No SDK Task)**
```
Session 1: [research-analyst] → artifacts/foundation/
                                      ↓
Session 2: [strategist] reads foundation → artifacts/strategy/
                                                 ↓
Session 3: [content-agent] reads strategy → artifacts/content/
```
- **Pros**: Each agent has full tool access, clear boundaries
- **Cons**: Loses conversation context, user must trigger each step
- **Would work for**: Async/human-in-the-loop workflows

**Option D: Tool-Based Handoff (New Pattern)**
```
[marketing-agent]
   ↓ calls handoff_to_specialist("research", brief)
      → internally spawns research session
      → waits for artifacts
      → continues with results
```
- **Pros**: Single user-facing session, specialist execution
- **Cons**: Complex to implement, nested session management
- **Key question**: Can we build this within SDK constraints?

**Questions for you**:
1. ~~Option B produces good results~~ **Correction**: No autonomous option produces good results yet
2. If we pursue multi-agent, is **human-in-the-loop** (Option C) acceptable, or must it be fully autonomous?
3. Would you invest in **fixing the SDK** (MCP inheritance) vs. designing around it?
4. Should we focus on **reducing the human-guidance gap** before adding multi-agent complexity?
5. What if "crew" means **human + single agent** rather than **multiple agents**?

>> We need flexibility the agents need to be able to ask clarification questions to the user and perform very specific analysis for the
>> I think we need to define the fundamentals of the interaction. 
>> Agents main responsibilty should maybe to make sure that it knows what user wants, that he has clarity of execution path, and that he keeps track of what he is doing and has to do and can sirfacet that explicitly to the user.

---

### Q1.3: Claude Agent SDK Capabilities

**Context**: Based on actual code and documented issues, here are the real SDK constraints.

**What Works Today** (from `agent-runner.ts`, `session.ts`):
- `query()` - Start new session with streaming
- `resume()` - Continue existing session with history replay
- `plugins` - Load agent definitions from markdown files
- `mcpServers` - Connect MCP servers at session start
- `allowedTools` - Whitelist tools (includes `mcp__bird-mcp__*`)

**What's Broken** (documented in `MCP-TOOL-ACCESS-ISSUE.md`):

```typescript
// Parent session has MCP tools
allowedTools: ["mcp__bird-mcp__*", ...]

// But when Task creates subagent:
subagent.tools = ["Read", "Write"]  // MCP tools NOT inherited!
```

**Root Cause**: The SDK `Task` tool creates a nested session without propagating:
- `mcpServers` configuration
- `allowedTools` list
- MCP server connection context

**Tested Patterns**:

| Pattern | Status | Evidence |
|---------|--------|----------|
| Single agent | ✅ Works | `cc-1`, references |
| Task delegation | ❌ Broken | MCP tools lost |
| Resume | ✅ Works | Session continuation works |
| Plugins | ✅ Works | Agent definitions load |

**Potential Fixes**:

**Fix 1: Patch Task Tool Behavior**
```typescript
// In agent-runner.ts - wrap Task to inject MCP config
function createSubagentOptions(parent, subagent) {
  return {
    ...subagent,
    mcpServers: parent.mcpServers,  // Inherit
    allowedTools: [...subagent.tools, ...parent.mcpTools]
  };
}
```
- **Feasibility**: Requires SDK modification or wrapper
- **Risk**: SDK internals may change

**Fix 2: Custom Delegation Tool**
```typescript
// New tool: delegate_to_specialist
// Spawns separate session, not nested Task
async function delegateToSpecialist(agentName, input) {
  const session = await createSession({ agent: agentName, mcpServers: current.mcpServers });
  return await session.run(input);
}
```
- **Feasibility**: Implementable in user code
- **Tradeoff**: Loses shared conversation context

**Fix 3: Don't Use Multi-Agent**
- Accept single-agent with mode switching
- Focus on improving single-agent quality
- **Evidence**: `marketing-agent.md` already does this

**Questions for you**:
1. Is fixing the SDK/Task tool worth the investment, or should we design around it?
2. If we build custom delegation, should it be sync (wait for result) or async (artifact-based)?
3. What's the actual value of "specialist" agents if a single agent (with good prompts) can do it all?
4. Should we focus on **rounds-based refinement** instead of multi-agent? (Sessions with rounds/ produced better output)

>> 1. I think it's already fixed. Athgou the task delegation in Claude code is opaque and it's difficult to understand exactly what's going on behind the scenes... Or maybe it's not and we are not lookin in the right place ?
>> 2. I don't know, it just needs to work well
>> 3. not sure. the idea was to avoid overloading his context. but that may be adding too much unnecessary complexity
>> 4. Let's explore this idea. Rounds force alignement so they are good but we need to find the right balance so that the agent does not need to feel that it absolutely has to ask quesions if he already has clarity

---

### Q1.4: State & Context Management

**Context**: Agents need shared context to produce coherent outputs. How context is managed affects quality and consistency.

**Current State Management**:
- `brief.md` - User's original request
- `metadata.json` - Session metadata
- `artifacts/` directory - Agent outputs
- SQLite session store - Status tracking
- `mcp.log` - Tool call history

**Context Challenge**:
Each agent needs:
1. **User intent** - What the user actually wants
2. **Domain knowledge** - Schema, channels, brand info
3. **Previous decisions** - What earlier agents concluded
4. **Constraints** - Budget, timeline, audience size requirements

**State Sharing Options**:

**Option A: Artifact-Based (Current)**
- Each agent writes markdown/JSON artifacts
- Next agent reads artifacts as context
- **Pros**: Simple, human-readable, debuggable
- **Cons**: Agents must parse artifacts, potential misinterpretation

**Option B: Structured Handoff Document**
- Define formal handoff schema (JSON/YAML)
- Includes: decisions, constraints, open questions
- **Pros**: Explicit contract between agents
- **Cons**: Schema maintenance overhead

**Option C: Shared Memory/Vector Store**
- Embed artifacts + conversation in vector store
- Agents query for relevant context
- **Pros**: Dynamic retrieval, handles large context
- **Cons**: Retrieval complexity, potential irrelevant results

**Questions for you**:
1. How much context does each agent actually need from predecessors?
2. Are current artifacts sufficient, or do agents frequently miss context?
3. Should agents be able to "query" previous work, or receive it explicitly?
4. How do you handle conflicting decisions between agents?

>> 1. Probably quite a few. Depending of the tasks, they might complement each other and we need a way to track dependencies (like in our marketing example, the campaign engineer needs to have the strategic brief to execute on)
>> 2. They still very frequently miss context and don't produce the artifacts they are asked to created
>> 3. Yes
>> 4. right now nothing is in place but that's a good question to explore

---

### Q1.5: Failure Modes & Recovery

**Context**: With multiple agents, failure scenarios multiply. Need clear recovery strategies.

**Current Failure Handling** (from `session.ts`):
- MCP server connection check at init
- Abort controller for cancellation
- Session status tracking (active/completed/error)
- Basic error propagation to client

**Multi-Agent Failure Scenarios**:

| Scenario | Impact | Current Handling |
|----------|--------|------------------|
| Agent produces low-quality output | Downstream agents work with bad data | None - no quality gates |
| Agent fails mid-execution | Session stops | Error status, no retry |
| Agent times out | User waits forever | Abort controller timeout |
| Inter-agent conflict | Incoherent campaign | None - single agent |

**Recovery Options**:

**Option A: Checkpoint & Retry**
- Save state after each agent
- On failure, retry from last checkpoint
- User can resume from known-good state

**Option B: Quality Gates**
- After each agent, validate outputs
- Block progression if quality below threshold
- Alert user for review

**Option C: Graceful Degradation**
- If specialist fails, fallback to generalist
- Partial results better than no results
- Log degradation for debugging

**Questions for you**:
1. What's worse: slow but reliable, or fast but sometimes fails?
2. Should users be able to intervene between agents?
3. How would you implement quality gates? (LLM-as-judge, rules, human review?)
4. Is partial campaign output useful, or is it all-or-nothing?


>> 1. it's a balance. ultimately user needs to also be able to intervene and express his preferences or course correct.
>> 2. yes
>> 3. all are possible and probably necessary
>> 4. it's useful for the user to have somethig to course correct on, but ultimately the output needs to be complete

---

### Q1.6: Observability & Debugging

**Context**: Multi-agent systems are notoriously hard to debug. Need observability from day one.

**Current Observability** (from `tracing/`):
- OpenTelemetry integration
- Per-session spans
- Per-turn spans within sessions
- Tool call spans with timing
- Artifact creation events
- Cost tracking per session

**Multi-Agent Observability Needs**:
- Which agent is currently active?
- What context did it receive?
- How long did each agent take?
- Where did quality degrade?
- What was the handoff payload?

**Tracing Design Question**:
How should agent spans nest?

```
Option A: Flat
[session]
├── [research-agent]
├── [strategy-agent]
└── [content-agent]

Option B: Hierarchical
[session]
└── [coordinator]
    ├── [research-agent]
    ├── [strategy-agent]
    └── [content-agent]

Option C: Linked Traces
[session-1: research] → [session-2: strategy] → [session-3: content]
(linked via trace context)
```

**Questions for you**:
1. What debugging scenarios keep you up at night?
2. Is current tracing sufficient for understanding session behavior?
3. How do you currently identify where a session went wrong?
4. Should agent transitions be visible to users, or implementation detail?

>> 1. Mainly long unexplaninable traces and behaviours
>> 2. No
>> 3. We have the logs and a few skills to analyze mcp.log and session.log but that's not great.

---

### Q1.7: Cost & Latency Implications

**Context**: Multiple agents means multiple LLM calls. Need to understand cost/latency tradeoffs.

**Current Costs** (estimated):
- Single session: 5-15 turns
- Average turn: ~4K input tokens, ~1K output tokens
- Cost per session: $0.10-$0.50 (Sonnet pricing)

**Multi-Agent Cost Factors**:
- **Handoff overhead**: Each agent needs context loading (~2K tokens)
- **Redundant discovery**: Agents may repeat similar queries
- **Coordinator tax**: Extra LLM calls for routing/coordination

**Rough Estimates**:

| Pattern | Agents | Est. Tokens | Est. Cost | Est. Latency |
|---------|--------|-------------|-----------|--------------|
| Single Agent | 1 | 50K | $0.30 | 3 min |
| Pipeline (4 agents) | 4 | 80K | $0.50 | 5 min |
| Coordinator + 4 | 5 | 100K | $0.60 | 6 min |
| Parallel (4 agents) | 4 | 80K | $0.50 | 3 min* |

*Parallel assumes concurrent execution

**Questions for you**:
1. What's the acceptable cost increase for better quality?
2. Is latency or cost more important for your use case?
3. Would users pay premium for multi-agent campaigns?
4. Can we cache/reuse discovery across sessions to reduce overhead?

>> 1. cost is not really the main concern, except that the more tokens are used the onger it takes obviously.
>> 2. First correctness then Latency 100%
>> 3. yes
>> 4. Yes that is the plan but beyond today's discussion


---

## Summary

Based on session history analysis, the picture is clearer:

### What the Data Shows

| Finding | Implication |
|---------|-------------|
| **MCP tool inheritance broken** | Multi-agent via Task is blocked without SDK work |
| **No autonomous session achieved high quality** | `cc-1` was human-guided, not autonomous |
| **Rounds pattern helps but doesn't solve** | Sessions with rounds/ had better outcomes, still errors |
| **Error patterns are predictable** | Same mistakes repeat (predicate schema, entityType) |
| **Documentation isn't read** | Agent invents formats instead of following docs |
| **Human guidance is the difference** | Best artifacts came from manual Claude Code sessions |

### The Real Question

Given that **no autonomous session has achieved the quality of human-guided Claude Code**, is the goal:

1. **Multi-agent architecture** - Multiple specialist agents coordinating (adding complexity to a system that doesn't work well yet)?
2. **Fix single-agent first** - Get one agent to work reliably before adding coordination?
3. **Embrace human-in-the-loop** - Design for human guidance at key decision points?
4. **Different paradigm** - Something other than "agents" (e.g., structured workflows, scripts)?

### Key Decision Points

1. **SDK Investment**: Fix MCP inheritance (~days of work) or design around it?
2. **Quality vs. Complexity**: Single-agent-done-well vs. multi-agent-done-partially?
3. **Human-in-the-loop**: Is autonomous multi-agent required, or are checkpoints acceptable?
4. **Rounds Pattern**: Should we optimize the iterative refinement pattern instead?

## Next Round Preview

Based on your answers, Round 2 could go several directions:

**If multi-agent is the priority**:
- SDK modification plan
- Custom delegation tool design
- Inter-agent communication protocol

**If single-agent optimization is the priority**:
- Error pattern mitigation (predicate schema, etc.)
- Rounds/iteration workflow optimization
- Quality gates and validation

**If hybrid approach**:
- When to spawn specialists vs. stay in single agent
- Async vs. sync specialist execution
- Artifact-based vs. context-based handoffs

---

**Please answer the questions that matter most.** The session history suggests the biggest wins might be in single-agent optimization with rounds - but you may have strategic reasons for multi-agent. Help me understand your priorities.
