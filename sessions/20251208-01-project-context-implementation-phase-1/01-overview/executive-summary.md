# Executive Summary: Marketing Agent with Project Context

## Vision

**AI Marketing Agent that maintains context, generates campaigns, and deploys via Terraform - all with marketing-focused UI.**

---

## The System

### What It Does
1. **Maintains Context** - Remembers project goals, past campaigns, learnings
2. **Proposes Campaigns** - AI-generated marketing strategies with targeting
3. **Deploys Resources** - Creates audiences, templates, campaigns via Terraform
4. **Tracks Performance** - Real-time dashboards with live data

### Who It's For
- **Marketers** - Non-technical users who want AI assistance
- **Marketing Teams** - Need campaign automation and insights
- **Product Managers** - Want data-driven marketing decisions

---

## Key Innovations

### 1. Agent Client Protocol (ACP)
**No vendor lock-in** - Can switch from Claude to GPT-4, Gemini, etc.

```
llmchain Backend → ACP Agent → Claude API
                 ↓ (can swap)
                 → GPT-4 API
                 → Gemini API
```

**Benefits**:
- Standard JSON-RPC 2.0 protocol
- Built-in lifecycle hooks
- Works with any ACP-compatible agent

### 2. Living Documents
**Always fresh data** - Documents contain queries that execute on read

```markdown
## Campaign Performance

\`\`\`malloy
run: datahub.campaigns -> {
  aggregate: opens / sent * 100 as open_rate
  where: campaign_id = 'cmp-123'
}
\`\`\`

**Current**: 38% open rate (target: 35%) 🟢
```

**Benefits**:
- No stale data
- Transparent queries (visible in document)
- Reuses existing notebook renderer

### 3. Terraform Deployment
**User controls deployment** - Agent proposes, user approves

```
Agent generates → User reviews → User deploys → Resources created
  campaign.tf      terraform plan   terraform apply   in Bird platform
```

**Benefits**:
- User approval required
- Dependency tracking automatic
- State management built-in

### 4. Component Reuse
**83% time savings** - Reuse existing UI from monorepo

- Campaign builder from `features/Campaigns/`
- Email editor from `features/Studio/`
- Journey editor from `features/Journeys/`
- Dashboard from `modules/insights-shared/`

**Benefits**:
- Proven, production-ready components
- Consistent UX with main app
- 5,000+ files of existing code

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Marketing Agent UI (React)                      │
│  - Chat interface (custom)                                  │
│  - Campaign builder (reused)                                │
│  - Email editor (reused)                                    │
│  - Dashboard (reused)                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/SSE
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           llmchain Backend (ACP Client)                      │
│  - ACPClient: JSON-RPC communication                        │
│  - Session management with checkpointing                    │
│  - S3 storage for artifacts                                 │
│  - Living document hydration                                │
└────────────────────┬────────────────────────────────────────┘
                     │ JSON-RPC 2.0
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          ACP Agent (claude-code-acp)                         │
│  - Protocol adapter                                         │
│  - Tool handling                                            │
│  - File operations                                          │
└────────────────────┬────────────────────────────────────────┘
                     │ Claude SDK
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Claude API                                 │
│  - Claude Sonnet 4.5                                        │
└─────────────────────────────────────────────────────────────┘

                     ↕ MCP
┌─────────────────────────────────────────────────────────────┐
│                   Bird Platform                              │
│  - Projects & Tasks (context)                               │
│  - Knowledgebase (foundation, learnings)                    │
│  - DataHub (Malloy queries)                                 │
│  - Controlplane (terraform target)                          │
└─────────────────────────────────────────────────────────────┘

                     ↕
┌─────────────────────────────────────────────────────────────┐
│                   AWS S3                                     │
│  - Session artifacts                                        │
│  - Session checkpoints                                      │
│  - Conversation logs                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Timeline

**Total: 40 hours (4 weeks part-time)**

### Week 1: Backend + Core Integration (16 hours)
- ACP client implementation (2 hours)
- Session management (2 hours)
- S3 storage (2 hours)
- Checkpointing (2 hours)
- Chat interface (2 hours)
- Project selector (1 hour)
- Component imports (2 hours)
- Wire backend (2 hours)
- Testing (1 hour)

**Deliverable**: Working agent chat → campaign proposal → dashboard

### Week 2: Polish & Testing (8 hours)
- Error handling (2 hours)
- Loading states (1 hour)
- Mobile responsive (2 hours)
- User testing (2 hours)
- Bug fixes (1 hour)

**Deliverable**: Production-ready Phase 1

### Week 3: Terraform Deployment (8 hours)
- Terraform generation (2 hours)
- Backend executor (2 hours)
- Deployment UI (2 hours)
- Progress streaming (1 hour)
- Testing (1 hour)

**Deliverable**: One-click campaign deployment

### Week 4: Advanced Features (8 hours)
- Visual email editor (2 hours)
- Journey rules (2 hours)
- Journey templates (1 hour)
- Advanced metrics (2 hours)
- Testing (1 hour)

**Deliverable**: Feature-complete system

---

## Cost Estimate

**Monthly costs for 1,000 sessions**:

| Service | Usage | Cost |
|---------|-------|------|
| Claude API | 1M tokens/month | ~$30 |
| S3 Storage | 60 MB artifacts | $0.001 |
| S3 Requests | 15K operations | $0.07 |
| S3 Checkpoints | 60 MB | $0.001 |
| **Total** | | **~$30/month** |

**Note**: Claude API is the main cost. S3 is negligible (~$0.08/month).

---

## Success Metrics

### Phase 1 (Week 2)
- ✅ User can chat with agent
- ✅ Agent proposes campaigns
- ✅ User can preview campaign
- ✅ User can launch campaign
- ✅ Dashboard shows live metrics
- ✅ Sessions resume after restart

### Phase 2 (Week 4)
- ✅ One-click deployment
- ✅ Visual email editor
- ✅ Journey templates
- ✅ Production ready

---

## Key Benefits

### For Marketers
- **AI-Powered**: Get campaign ideas from AI
- **No Technical Skills**: Simple, marketing-focused UI
- **Real-Time Data**: Always see current performance
- **Fast Deployment**: Launch campaigns in minutes

### For Engineering
- **No Vendor Lock-in**: Can switch AI providers
- **Proven Components**: Reuse existing UI
- **Standard Protocols**: ACP, S3, Terraform
- **Low Maintenance**: Built on stable technologies

### For Business
- **Fast Time-to-Market**: 4 weeks to production
- **Low Cost**: ~$30/month operational cost
- **Scalable**: Multi-instance ready
- **Future-Proof**: Standard protocols, no lock-in

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ACP adapter issues | Test early, fallback to direct SDK |
| Component compatibility | Test imports early in monorepo |
| S3 costs | Lifecycle policies, monitor usage |
| Terraform complexity | Start simple, iterate |
| User confusion | Marketing-focused UI, clear terms |
| Session state loss | Auto-checkpoint every 5 minutes |

---

## Technology Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Agent Protocol**: ACP (JSON-RPC 2.0)
- **Agent Adapter**: `@zed-industries/claude-code-acp`
- **AI Provider**: Claude Sonnet 4.5
- **Storage**: AWS S3
- **Query Engine**: Malloy
- **Deployment**: Terraform

### Frontend
- **Framework**: React
- **UI Library**: `@messagebird-dev/boxkit`
- **Components**: Reused from `websites/web`

---

## Next Steps

1. **Read**: [`architecture-decision.md`](./architecture-decision.md) - Complete technical details
2. **Implement**: [`../02-architecture/acp-integration.md`](../02-architecture/acp-integration.md) - Start with ACP
3. **Build UI**: [`../03-implementation/component-reuse.md`](../03-implementation/component-reuse.md) - Reuse components

---

## Conclusion

**This is a production-ready architecture that:**
- Leverages standard protocols (ACP)
- Uses proven technologies (S3, Terraform)
- Reuses existing components (monorepo)
- Provides marketing-focused UX

**Total implementation: 40 hours (4 weeks part-time)**

**Ready to build! 🚀**
