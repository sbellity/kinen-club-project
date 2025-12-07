---
date: 2025-12-07
artifact_type: research
session: "[[20251207-02-multi-agent-coordination]]"
tags:
  - research
  - llm
  - context-management
  - memory
---

# Research: Active Context Management and Information Density

**Status**: To explore
**Tracked**: kinen-gfy

## Problem Statement

LLM context windows are finite. As conversations grow or agents work on complex tasks:
1. Important information gets pushed out by newer content
2. Compaction/summarization may lose critical details
3. No mechanism distinguishes "must remember" from "nice to have"
4. Information density varies wildly (verbose explanations vs. dense facts)

**Observed Failure**: In this session, the agent had methodology access but failed to apply it—the methodology wasn't "active" in context even though it was "available" as a tool.

## Key Questions

1. **How do we score information importance?**
   - Recency? Frequency of reference? Explicit marking?
   - Task relevance? User emphasis?
   
2. **How do we compress without losing meaning?**
   - Extractive summarization (pull key sentences)
   - Abstractive summarization (rewrite shorter)
   - Structured extraction (convert prose to data)
   
3. **What should always be in context vs. retrievable?**
   - Active task/goal
   - Key constraints and decisions
   - Current methodology/format requirements
   
4. **How do we protect critical information from eviction?**
   - Pinned context segments?
   - Periodic refresh/re-injection?
   - Hierarchical memory tiers?

## What Kinen Already Has: LightMem-Inspired Memory System

**Important**: kinen-go already implements a sophisticated memory system (~85% parity with LightMem paper).

### Three-Stage Architecture (Already Implemented)

```
┌─────────────────┐
│ Sensory Buffer  │  ← Raw messages, windowed by token count (512 tokens)
│ + Compression   │  ← Optional LLMLingua-2 style pre-compression
│ + Segmentation  │  ← Coarse boundaries + fine-grained similarity
├─────────────────┤
│ Short-term      │  ← Accumulates topic segments (1024 tokens)
│ Buffer          │  ← Triggers extraction at threshold
├─────────────────┤
│ Long-term       │  ← Vector DB with semantic indexing
│ Memory          │  ← Sleep-time offline updates (consolidation, dedup)
└─────────────────┘
```

### Key Capabilities Already Built

- **Pre-compression**: Reduce tokens before processing
- **Topic segmentation**: Coarse + fine-grained chunking
- **Knowledge extraction**: LLM-based fact extraction
- **Sleep-time updates**: Offline consolidation, deduplication, abstraction
- **Vector retrieval**: Semantic search for relevant memories

### The Gap: Active Context vs. Long-Term Memory

The existing system handles **long-term memory storage and retrieval**. 

The problem we observed is **active context curation during a conversation**:
- Methodology was "available" (could be retrieved) but not "active" (in working context)
- No mechanism to **promote** important retrievable info into active context
- No mechanism to **protect** critical active context from being pushed out

**Question**: Can the existing LightMem architecture be extended for active context management, or is this a separate concern?

## Additional Prior Art

### MemGPT
- Virtual context management for LLMs
- Paging system inspired by OS memory management
- Main context + archival storage + recall storage
- **Relevance**: Explicit context management, not just storage

### Context Distillation
- Compress long contexts into shorter "distilled" versions
- Train models to work with compressed representations
- **Relevance**: Information density optimization

### RAG (Retrieval Augmented Generation)
- Don't keep everything in context—retrieve when needed
- **Gap**: RAG retrieves, but doesn't manage what's already in context

## Bridging LightMem to Active Context Management

### The Architectural Question

LightMem handles: **Conversation → Storage → Retrieval**
Active context needs: **Context Window → Curation → Eviction/Promotion**

These could be:
1. **Same system, different mode**: LightMem's buffers could manage active context
2. **Parallel systems**: Separate active context manager alongside LightMem
3. **Extension**: Add "working memory" tier above sensory buffer

### Potential Integration Points

**Sensory Buffer as Context Manager**:
- Already has token-based windowing (512 tokens)
- Could be extended with importance scoring
- Eviction policy could consider importance, not just age

**Short-Term Buffer for Active Context**:
- 1024 token threshold could be "active context budget"
- Extraction could be "compression for context retention"
- Instead of sending to long-term, keeps compressed in active

**Retrieval → Promotion**:
- When retrieving from long-term, promote to active context
- Track "last retrieved" to identify frequently-needed memories
- Auto-inject high-frequency retrievals into active context

### Key Design Question

> Should active context management be a new component, or an evolution of the existing buffer system?

**Option A**: New "Working Memory" component
- Separate from LightMem pipeline
- Manages LLM context window explicitly
- Interfaces with LightMem for retrieval

**Option B**: Evolve buffers for dual-purpose
- Sensory/Short-term buffers also serve as context managers
- Add importance scoring to existing eviction logic
- Unified architecture

## Potential Approaches for Kinen

### 1. Information Density Scoring

```
Score each piece of context:
- Relevance to current task (0-1)
- Criticality (can we function without it?) (0-1)  
- Freshness (recent vs. old)
- Reference frequency (how often mentioned)

Combined score determines:
- Full inclusion in context
- Compressed inclusion
- Available via retrieval only
```

### 2. Structured Context Segments

```
Context organized as segments:
[PINNED - Never evict]
- Current task goal
- Critical constraints
- Active methodology

[ACTIVE - Prefer to keep]
- Recent decisions
- Current file contents
- Working state

[AVAILABLE - Retrieve on demand]
- Historical context
- Reference documentation
- Past sessions
```

### 3. Automatic Refresh Protocol

```
Before generating output:
1. Check task type (round generation? code edit?)
2. Retrieve relevant methodology/format
3. Inject into context as "active reminder"
4. Generate output
5. Validate against requirements
```

### 4. Information Extraction Layer

```
Raw input → Extraction → Dense representation

Example:
"We discussed the round format extensively and decided that 
frontmatter should include artifact_type, date, session link,
round number, and tags. The format uses YAML between --- delimiters."

Extracted:
Round frontmatter: artifact_type, date, session, round_number, tags (YAML, --- delimited)
```

## Experiments to Run

1. **Baseline measurement**: How much context drift occurs over N turns?
2. **Refresh effectiveness**: Does re-reading methodology before generating help?
3. **Compression quality**: Can we compress methodology 50% without losing compliance?
4. **Retrieval latency**: How much does on-demand retrieval slow generation?

## Open Questions

- Is this a model problem (attention) or a system problem (context management)?
- Should the LLM manage its own context or should external systems?
- What's the right abstraction for "importance"?
- How do we evaluate "information retained" vs. "tokens used"?

## Related Work

- [[20251203-01-kinen-resources-and-indexing]] - Memory consolidation design
- [[20251206-01-kinen-beads-devx]] - Where context drift was first observed
- kinen-go memory package - Current implementation

---

*This research area emerged from observing context drift in real-time during session preparation.*

