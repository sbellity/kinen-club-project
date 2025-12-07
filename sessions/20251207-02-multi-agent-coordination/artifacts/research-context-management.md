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

## Prior Art to Research

### MemGPT
- Virtual context management for LLMs
- Paging system inspired by OS memory management
- Main context + archival storage + recall storage
- Paper: "MemGPT: Towards LLMs as Operating Systems" (2023)

### Context Distillation
- Compress long contexts into shorter "distilled" versions
- Train models to work with compressed representations
- Trade-off: compression ratio vs. information loss

### Hierarchical Memory
- Different tiers: working memory, episodic, semantic
- Consolidation between tiers (like human memory)
- Kinen already has this concept in memory consolidation

### RAG (Retrieval Augmented Generation)
- Don't keep everything in context—retrieve when needed
- Challenge: knowing what to retrieve and when
- Latency vs. context size trade-off

### Attention Mechanisms
- Not all context tokens are equally important
- Sparse attention, sliding window attention
- Could inform what to keep vs. evict

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

