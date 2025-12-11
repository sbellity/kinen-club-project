# Final Architecture Decision: ACP Integration

## Executive Summary

**Recommendation**: Use **Agent Client Protocol (ACP)** instead of direct Claude SDK integration.

**Impact**: Better architecture, less vendor lock-in, faster implementation, lower maintenance.

---

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Marketing Agent UI (React)                      │
│  - Reuses existing components from websites/web             │
│  - Campaign builder, email editor, journey editor           │
│  - Dashboard (notebook renderer)                            │
│  - Project selector, chat interface                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/SSE
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           llmchain Backend (ACP Client)                      │
│  - ACPClient: JSON-RPC 2.0 communication                    │
│  - ACPSessionService: Session management                    │
│  - CheckpointService: S3 checkpointing                      │
│  - ArtifactStorageService: S3 artifact storage              │
│  - LivingDocumentService: Malloy query hydration            │
└────────────────────┬────────────────────────────────────────┘
                     │ JSON-RPC 2.0 (stdio)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          ACP Agent (claude-code-acp)                         │
│  - Protocol adapter for Claude Code                         │
│  - Handles tool calls, file ops, terminals                  │
│  - Manages conversation lifecycle                           │
└────────────────────┬────────────────────────────────────────┘
                     │ Claude SDK
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Claude API                                 │
│  - Claude Sonnet 4.5                                        │
│  - Streaming responses                                      │
│  - Tool use                                                 │
└─────────────────────────────────────────────────────────────┘

                     ↕ MCP
┌─────────────────────────────────────────────────────────────┐
│                   Bird Platform                              │
│  - Projects & Tasks API (context, sessions)                 │
│  - Knowledgebase (foundation, learnings)                    │
│  - DataHub (Malloy queries for hydration)                   │
│  - Controlplane Resources (terraform target)                │
└─────────────────────────────────────────────────────────────┘

                     ↕
┌─────────────────────────────────────────────────────────────┐
│                   AWS S3                                     │
│  - Session artifacts (terraform configs, etc.)              │
│  - Session checkpoints (conversation history)               │
│  - Conversation logs (JSONL)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### 1. **ACP Integration** ⭐⭐⭐

**Decision**: Use Agent Client Protocol instead of direct Claude SDK

**Why**:
- ✅ No vendor lock-in (can switch to GPT-4, Gemini, etc.)
- ✅ Standard protocol (well-documented, maintained)
- ✅ Built-in lifecycle hooks (no custom implementation)
- ✅ Less code (protocol handles complexity)
- ✅ Future-proof (works with any ACP agent)

**Implementation**: 6 hours
**Reference**: `artifacts/acp-integration-strategy.md`

---

### 2. **S3 Artifact Storage** 💾

**Decision**: Store all session artifacts in S3 (not local volumes)

**Why**:
- ✅ Durable (survives container restarts)
- ✅ Accessible from anywhere
- ✅ Versioning built-in
- ✅ Multi-instance ready
- ✅ Cheap (~$0.05/month for 1,000 sessions)

**Implementation**: 4 hours
**Reference**: `artifacts/s3-artifact-storage.md`

---

### 3. **Session Checkpointing** 🔄

**Decision**: Checkpoint conversation state to S3 for resumption

**Why**:
- ✅ Resume sessions after restart
- ✅ Conversation history preserved
- ✅ Can restore from any point
- ✅ Automatic (every 10 messages, 5 minutes, or on pause)

**Implementation**: 6 hours
**Reference**: `artifacts/session-checkpointing.md`

---

### 4. **Living Documents** 📊

**Decision**: Foundation and dashboard documents contain Malloy queries that execute on read

**Why**:
- ✅ Always fresh data (no staleness)
- ✅ Transparent queries (visible in document)
- ✅ Reuses notebook renderer (already exists)
- ✅ Version controlled (in Knowledgebase)

**Implementation**: 4 hours
**Reference**: `artifacts/living-documents-concept.md`

---

### 5. **Terraform Deployment** 🚀

**Decision**: Agent generates `.tf` files, user deploys via terraform

**Why**:
- ✅ User controls deployment (reviews plan first)
- ✅ Dependency tracking (terraform handles)
- ✅ State management (terraform.tfstate)
- ✅ Reuses existing Bird Terraform provider

**Implementation**: 8 hours
**Reference**: `artifacts/terraform-deployment-concept.md`

---

### 6. **Component Reuse** 🎯

**Decision**: Reuse existing components from `websites/web` monorepo

**Why**:
- ✅ 83% time savings (48 hours → 8 hours for UI)
- ✅ Proven, production-ready components
- ✅ Consistent UX with main app
- ✅ 5,000+ files of existing code

**Implementation**: 8 hours
**Reference**: `artifacts/REUSABLE-COMPONENTS-ANALYSIS.md`

---

### 7. **Agent Autonomy** 🤖

**Decision**: Agent retrieves its own context (no harness pre-fetching)

**Why**:
- ✅ Simpler harness (just passes projectId)
- ✅ Flexible agent (decides what to fetch)
- ✅ No proxy endpoints needed

**Implementation**: 2 hours
**Reference**: `artifacts/simplified-architecture.md`

---

### 8. **Marketing-Focused UI** 🎨

**Decision**: Hide all technical details (terraform, resources, etc.) from UI

**Why**:
- ✅ Target audience is marketers (not developers)
- ✅ Use marketing terminology ("Launch Campaign" not "terraform apply")
- ✅ Show campaign cards with metrics (not resource definitions)

**Implementation**: Included in UI work
**Reference**: `artifacts/marketing-focused-ui.md`

---

## Implementation Timeline

### Week 1: Backend + Core Integration (16 hours)

**Backend (8 hours)**:
- Install `claude-code-acp` (1 min)
- Implement `ACPClient` (2 hours)
- Implement `ACPSessionService` (2 hours)
- Implement `CheckpointService` (2 hours)
- Implement `ArtifactStorageService` (2 hours)

**Frontend (8 hours)**:
- Create new app in monorepo (1 hour)
- Agent chat interface (2 hours)
- Project selector (1 hour)
- Import campaign components (2 hours)
- Import dashboard components (1 hour)
- Wire to backend (1 hour)

**Deliverable**: Working agent chat → campaign launch → dashboard

---

### Week 2: Polish & Testing (8 hours)

- Error handling (2 hours)
- Loading states (1 hour)
- Mobile responsive (2 hours)
- User testing (2 hours)
- Bug fixes (1 hour)

**Deliverable**: Production-ready Phase 1

---

### Week 3: Terraform Deployment (8 hours)

- Agent terraform generation (2 hours)
- Backend terraform executor (2 hours)
- Frontend deployment UI (2 hours)
- Progress streaming (1 hour)
- Testing (1 hour)

**Deliverable**: One-click deployment

---

### Week 4: Advanced Features (8 hours)

- Visual email editor (2 hours) - From Studio
- Journey rules (2 hours) - From Journeys
- Journey templates (1 hour) - 14 templates exist!
- Advanced metrics (2 hours) - From Campaigns
- Testing (1 hour)

**Deliverable**: Feature-complete system

**Total: 40 hours = 1 week of focused work (or 4 weeks part-time)**

---

## Technology Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Agent Protocol**: ACP (JSON-RPC 2.0)
- **Agent Adapter**: `@zed-industries/claude-code-acp`
- **AI Provider**: Claude Sonnet 4.5 (via ACP)
- **Storage**: AWS S3
- **Query Engine**: Malloy (for living documents)
- **Infrastructure**: Terraform (for deployment)

### Frontend
- **Framework**: React
- **UI Library**: `@messagebird-dev/boxkit`
- **Campaign Builder**: Reused from `features/Campaigns/`
- **Email Editor**: Reused from `features/Studio/`
- **Journey Editor**: Reused from `features/Journeys/`
- **Dashboard**: Reused from `modules/insights-shared/notebook`

### Infrastructure
- **Container**: Docker
- **Orchestration**: Docker Compose
- **Storage**: S3
- **Deployment**: Terraform

---

## Cost Estimation

### Monthly Costs (1,000 sessions)

| Service | Usage | Cost |
|---------|-------|------|
| **Claude API** | 1M tokens/month | ~$30 |
| **S3 Storage** | 60 MB artifacts | $0.001 |
| **S3 Requests** | 15K ops | $0.07 |
| **S3 Checkpoints** | 60 MB | $0.001 |
| **Total** | | **~$30/month** |

**Note**: Claude API is the main cost. S3 is negligible.

---

## Success Metrics

### Phase 1 (Week 2)
- ✅ User can chat with agent
- ✅ Agent proposes campaigns
- ✅ User can preview campaign (using existing wizard)
- ✅ User can launch campaign
- ✅ Dashboard shows live metrics (using notebook renderer)
- ✅ Sessions resume after restart

### Phase 2 (Week 4)
- ✅ One-click deployment
- ✅ Visual email editor integrated
- ✅ Journey templates available
- ✅ Production ready

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **ACP adapter issues** | Test early, fallback to direct SDK if needed |
| **Component compatibility** | Test imports early in monorepo |
| **S3 costs** | Implement lifecycle policies, monitor usage |
| **Terraform complexity** | Start with simple configs, iterate |
| **User confusion** | Marketing-focused UI, clear terminology |
| **Session state loss** | Automatic checkpointing every 5 min |

---

## Comparison: Direct SDK vs ACP

| Aspect | Direct Claude SDK | ACP Integration |
|--------|------------------|-----------------|
| **Vendor lock-in** | ❌ Tight coupling | ✅ Provider agnostic |
| **Lifecycle hooks** | ❌ Custom implementation | ✅ Built-in protocol |
| **Tool handling** | ❌ Manual | ✅ Automatic |
| **File operations** | ❌ Custom | ✅ Standard protocol |
| **Terminal support** | ❌ Custom | ✅ Built-in |
| **Checkpointing** | ❌ Custom | ✅ session/load support |
| **Permission requests** | ❌ Custom | ✅ Built-in |
| **Implementation** | 8 hours | 6 hours |
| **Maintenance** | High | Low |
| **Future-proof** | ❌ Claude only | ✅ Any ACP agent |

**Winner: ACP Integration** 🏆

---

## Documentation Index

### Core Architecture
1. **MASTER-PLAN.md** - Complete vision and roadmap
2. **EXECUTIVE-SUMMARY.md** - High-level overview
3. **FINAL-ARCHITECTURE-DECISION.md** (this doc) - Architecture decisions

### Implementation Guides
4. **acp-integration-strategy.md** ⭐⭐⭐ - ACP implementation (RECOMMENDED)
5. **s3-artifact-storage.md** - S3 storage design
6. **session-checkpointing.md** - Session resumption
7. **claude-sdk-lifecycle-hooks.md** - Alternative approach (not recommended)

### Concepts
8. **living-documents-concept.md** - Malloy query hydration
9. **dashboard-as-living-doc.md** - Dashboard design
10. **terraform-deployment-concept.md** - Deployment approach
11. **session-outputs-to-resources.md** - Artifact lifecycle

### UI/UX
12. **marketing-focused-ui.md** - Marketing language
13. **REUSABLE-COMPONENTS-ANALYSIS.md** - Existing components
14. **POC-UI-ANALYSIS.md** - POC comparison
15. **POC-TO-MVP-ROADMAP.md** - Phase planning
16. **FINAL-IMPLEMENTATION-ROADMAP.md** - Updated timeline

---

## Next Steps

### Immediate (This Week)
1. ✅ Design complete
2. [ ] Install `claude-code-acp`
3. [ ] Implement `ACPClient`
4. [ ] Implement `ACPSessionService`
5. [ ] Create new app in monorepo
6. [ ] Import first components

### Near-term (Next Week)
1. [ ] Build agent chat interface
2. [ ] Build project selector
3. [ ] Wire backend to frontend
4. [ ] Test end-to-end flow
5. [ ] Add S3 storage
6. [ ] Add checkpointing

### Future (Weeks 3-4)
1. [ ] Add Terraform deployment
2. [ ] Integrate visual editor
3. [ ] Integrate journey rules
4. [ ] Polish for production

---

## Final Recommendation

**Use ACP Integration with:**
- ✅ S3 artifact storage
- ✅ S3 session checkpointing
- ✅ Living documents (Malloy hydration)
- ✅ Terraform deployment
- ✅ Component reuse from monorepo
- ✅ Marketing-focused UI

**This gives you:**
- No vendor lock-in
- Durable storage
- Session resumption
- Always-fresh data
- User-controlled deployment
- Proven UI components
- Marketing-friendly experience

**Total implementation: 40 hours (4 weeks part-time)**

**Let's build this! 🚀**
