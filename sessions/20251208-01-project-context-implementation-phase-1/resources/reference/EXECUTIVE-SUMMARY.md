# Executive Summary: Marketing Agent with Project Context

## Vision

**AI Marketing Agent that maintains context, generates campaigns, and deploys via Terraform - all with marketing-focused UI.**

---

## Four Revolutionary Ideas

### 1. **Agent Autonomy**
Agent retrieves its own context from project metadata (no harness pre-fetching).

### 2. **Living Documents**
Foundation and dashboard documents hydrate with live Malloy queries when read.

### 3. **Terraform Deployment**
Agent generates `.tf` files, user launches campaigns (backend runs terraform).

### 4. **Component Reuse**
Leverage existing web app components (saves 40 hours / 83% time).

---

## Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Marketing Agent UI (New App)                    │
│                                                              │
│  Custom Components (8 hours):                               │
│  • Agent chat interface                                     │
│  • Project selector                                         │
│  • Launch progress indicator                                │
│                                                              │
│  Reused Components (0 hours):                               │
│  • Campaign builder (from Campaigns/)                       │
│  • Email editor (from Studio/)                              │
│  • Journey editor (from Journeys/)                          │
│  • Dashboard (from insights-shared/)                        │
│  • UI library (from boxkit/)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              llmchain Backend (8 hours)                      │
│                                                              │
│  • Session API (projectId support)                          │
│  • Context injection (minimal)                              │
│  • Living document hydration                                │
│  • Terraform execution                                      │
│  • Agent prompt updates                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Marketing Agent                            │
│                                                              │
│  • Retrieves project context via MCP                        │
│  • Reads living documents (hydrated)                        │
│  • Proposes campaigns                                       │
│  • Generates terraform configs                              │
│  • Tracks deployments                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Bird Platform                              │
│                                                              │
│  • Projects (metadata, goals)                               │
│  • Tasks (sessions)                                         │
│  • Knowledgebase (foundation, dashboard, learnings)         │
│  • DataHub (live queries for hydration)                     │
│  • Controlplane (terraform deployment target)               │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flow

### 1. **Start Session**

```
User: "Help me create a VIP campaign"
↓
Agent: [Fetches project context, reads foundation]
↓
Agent: "I recommend targeting 1,200 VIP customers..."
```

### 2. **Review Campaign**

```
Agent generates campaign plan
↓
UI shows: Campaign preview (using CampaignWizard)
↓
User reviews: Audience, emails, schedule, impact
```

### 3. **Launch Campaign**

```
User clicks: "Launch Campaign"
↓
Backend: Runs terraform apply (hidden from user)
↓
UI shows: "Creating audience... ✅ Setting up emails... ✅"
↓
Success: "Your campaign is live!"
```

### 4. **Track Performance**

```
User: "How's my campaign doing?"
↓
Agent: [Reads dashboard.yaml - hydrated with live data]
↓
UI shows: NotebookRenderer with live metrics
↓
Agent: "38% open rate (target: 35%) 🟢"
```

---

## Implementation Timeline

### Week 1: Backend + Core UI (16 hours)
- Backend: Session API, context injection, hydration
- Frontend: Chat, project selector, component imports
- **Deliverable**: Working agent chat → campaign launch

### Week 2: Polish & Testing (8 hours)
- Error handling, loading states, mobile
- **Deliverable**: Production-ready MVP

### Week 3: Terraform Deployment (8 hours)
- Terraform generation, execution, UI
- **Deliverable**: One-click deployment

### Week 4: Advanced Features (8 hours)
- Visual editor, journey rules (already built!)
- **Deliverable**: Feature-complete

**Total: 4 weeks to production** 🚀

---

## Key Benefits

### 1. **Massive Time Savings**
- 83% reduction in UI development (reuse existing)
- 1 week to MVP instead of 4 weeks

### 2. **Proven Components**
- Campaign builder already in production
- Email editor already in production
- Journey editor already in production
- Dashboard already in production

### 3. **Consistent UX**
- Same UI patterns as main app
- Same component library
- Same design system
- Users already familiar

### 4. **Simple Architecture**
- Agent is autonomous (fetches own context)
- Dashboard is living document (always fresh)
- Deployment via terraform (infrastructure as code)
- Marketing-focused UI (no technical jargon)

---

## What Makes This Special

### ✅ **Agent Autonomy**
Agent decides what context it needs, when to fetch it.

### ✅ **Always Fresh Data**
Living documents with Malloy queries execute on read.

### ✅ **User Control**
User reviews campaign before launch (terraform plan).

### ✅ **Infrastructure as Code**
Terraform manages dependencies, state, rollback.

### ✅ **Component Reuse**
Leverage 5,000+ files of existing UI code.

### ✅ **Marketing-Focused**
No terraform, resources, or technical terms visible.

---

## Documents Created

### Architecture
1. **MASTER-PLAN.md** - Complete vision and roadmap
2. **architecture-summary.md** - High-level architecture
3. **simplified-architecture.md** - Core flow

### Concepts
4. **living-documents-concept.md** - Foundation/dashboard hydration
5. **dashboard-as-living-doc.md** - Dashboard as YAML
6. **terraform-deployment-concept.md** - Deployment via terraform
7. **session-outputs-to-resources.md** - Artifact lifecycle

### UI/UX
8. **marketing-focused-ui.md** - Marketing language, no jargon
9. **POC-UI-ANALYSIS.md** - POC comparison
10. **POC-TO-MVP-ROADMAP.md** - Phase planning

### Implementation
11. **REUSABLE-COMPONENTS-ANALYSIS.md** - Existing components
12. **FINAL-IMPLEMENTATION-ROADMAP.md** - Updated timeline
13. **rounds/01-backend-foundation.md** - Implementation steps

---

## Next Actions

### Immediate (This Week)
1. **Decide**: New app in monorepo or embed in main app?
2. **Start**: Backend implementation (whitelist operations)
3. **Create**: App structure
4. **Import**: First components (CampaignWizard, NotebookRenderer)

### Near-term (Next Week)
1. **Build**: Agent chat interface
2. **Build**: Project selector
3. **Wire**: Backend to frontend
4. **Test**: End-to-end flow

### Future (Weeks 3-4)
1. **Add**: Terraform deployment
2. **Integrate**: Visual editor
3. **Integrate**: Journey rules
4. **Polish**: Production ready

---

## Success Criteria

### Phase 1 (Week 2)
- ✅ User can chat with agent
- ✅ Agent proposes campaigns
- ✅ User can preview campaign (using existing wizard)
- ✅ User can launch campaign
- ✅ Dashboard shows live metrics (using notebook renderer)

### Phase 2 (Week 4)
- ✅ One-click deployment
- ✅ Visual email editor integrated
- ✅ Journey templates available
- ✅ Production ready

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Component compatibility | Test imports early |
| Monorepo complexity | Use existing app structure |
| Backend integration | Start with simple API |
| Terraform execution | Test with mock configs |
| User confusion | Marketing-focused language |

---

## Conclusion

**We can build this in 4 weeks by reusing existing components.**

### Time Breakdown
- Backend: 8 hours
- Custom UI: 8 hours
- Integration: 8 hours
- Polish: 8 hours
- Deployment: 8 hours

**Total: 40 hours = 1 week of focused work**

### Key Advantages
1. Reuse 5,000+ files of existing code
2. Proven, production-ready components
3. Consistent UX with main app
4. Simple terraform backend
5. Marketing-focused language

**This is achievable and exciting!** 🚀
