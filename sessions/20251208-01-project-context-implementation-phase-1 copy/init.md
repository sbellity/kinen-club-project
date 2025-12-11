# Session: Project Context Implementation - Phase 1

## Type
Implementation

## Goal
Implement Phase 1 (MVP) of the Project Context Integration for Marketing Agent:
- Backend API endpoints for project/task management
- Context preparation and injection
- Agent prompt updates
- Basic frontend project selector
- Artifact rendering

## Context

This session implements the design from `scratch/20251204-01-project-context-marketing-agent/`.

**Key Design Decisions:**
- Projects represent marketing initiatives/functions
- Tasks represent individual agent sessions
- Foundation documents stored in Knowledgebase
- Artifacts embedded as HTML-like tags in markdown
- Project creation by harness (not LLM)
- No deletion operations exposed to agent

**Reference Documents:**
- Design session: `scratch/20251204-01-project-context-marketing-agent/`
- Technical spec: `scratch/20251204-01-project-context-marketing-agent/artifacts/technical-spec.md`
- Implementation spec: `scratch/20251204-01-project-context-marketing-agent/rounds/03-implementation-spec.md`

## Constraints

- Must respect agent sandboxing rules
- Single-file frontend (public/index.html) - minimize complexity
- No breaking changes to existing session flow
- Operations must be whitelisted in config/bird-operations.yaml

## Success Criteria

1. ✅ Bird operations whitelisted
2. ✅ API endpoints implemented and tested
3. ✅ Context preparation logic working
4. ✅ Agent prompt updated with project instructions
5. ✅ Frontend can list and select projects
6. ✅ Frontend can create new projects
7. ✅ Sessions can start with project context
8. ✅ Artifacts render as cards in UI
9. ✅ Manual end-to-end flow works

## Implementation Phases

### Phase 1A: Backend Foundation (This Session)
- Whitelist Bird operations
- Implement API endpoints
- Context preparation logic
- Agent prompt updates

### Phase 1B: Frontend Integration (Next Session)
- Project selector UI
- Create project modal
- Artifact rendering
- Session state management

### Phase 2: Memory & Learning (Future)
- KB folder auto-creation
- Session summaries
- Semantic search integration

### Phase 3: Dashboards & Digests (Future)
- Dashboard creation by agent
- Daily digest automation
- Performance tracking

## Open Questions

1. **Context Size**: How much context is too much? Need token budget strategy
2. **Artifact Parsing**: Will HTML tags survive markdown rendering?
3. **Task Naming**: What should initial task name be? User prompt truncated?
4. **Foundation Timing**: Generate during project creation or first session?
5. **Session End Detection**: How does agent know session is complete?

## Related Work

- Marketing Agent: `plugins/bird-marketing/`
- Agent prompt: `plugins/bird-marketing/agents/marketing-advisor.md`
- Server: `src/server.ts`
- Session service: `src/services/session.ts`
- Frontend: `public/index.html`
