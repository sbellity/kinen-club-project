# Session: LLMChain Agents Crew Architecture

**Type**: Architecture  
**Created**: 2024-12-12  
**Status**: In Progress

## Goals

Design a multi-agent ("crew") architecture for the llmchain platform that enables:

1. **Specialization**: Agents with distinct roles working on different aspects of a task
2. **Coordination**: Effective handoffs and communication between specialist agents
3. **Quality**: Better outputs through division of labor and focused expertise
4. **Observability**: Clear visibility into what each agent is doing and why

## Current State

The llmchain platform currently runs a **single marketing-agent** that handles everything end-to-end:
- Discovery (API calls, schema exploration)
- Strategy (campaign planning)
- Segmentation (audience building)
- Content creation (copywriting)

Specialist agents are **defined** in plugins but **not orchestrated**:
- `research-analyst.md` - Data discovery and foundation
- `strategist.md` - Campaign strategy
- `audience-architect.md` - Segment building
- `creative-director.md` - Content creation

## Key Questions to Resolve

1. **Orchestration Model**: How do agents coordinate? (Sequential pipeline, supervisor, swarm?)
2. **State Sharing**: How do agents share context without losing focus?
3. **Handoff Protocol**: When and how does control pass between agents?
4. **Failure Handling**: What happens when one agent fails or produces poor output?
5. **SDK Constraints**: What does Claude Agent SDK support for multi-agent patterns?

## Constraints

- Must work within Claude Agent SDK capabilities
- Session isolation per conversation
- MCP server connection requirements (bird-mcp must be available)
- SSE streaming for real-time updates to clients
- Cost/latency considerations (multiple agents = more API calls)

## Success Criteria

A successful architecture will:
- Enable specialist agents to produce higher-quality outputs in their domain
- Maintain coherent campaign artifacts across agents
- Be debuggable and observable (tracing, logging)
- Be resilient to partial failures
- Not significantly increase latency or cost vs. single-agent approach

## Living Document

`technical-spec.md` - Will contain the evolving architectural specification
