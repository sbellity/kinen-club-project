# UI Design

User experience and interface design.

## Documents

### [`marketing-focused-ui.md`](./marketing-focused-ui.md)
**Marketing-friendly interface design**

- Marketing terminology (no technical jargon)
- User flow: Chat → Preview → Launch → Track
- Campaign cards with key metrics
- Progress indicators with marketing terms
- Error messages for marketers
- Complete UI wireframes

**Read this if**: You're designing or building the UI

---

### [`poc-analysis.md`](./poc-analysis.md)
**POC UI comparison**

- Analysis of provided POC UI (`resources/poc-ui/3.jsx`)
- Conceptual alignment with architecture
- Features in POC vs our design
- What to adopt for MVP
- What to defer to later phases

**Read this if**: You want to understand the POC

---

### [`mvp-roadmap.md`](./mvp-roadmap.md)
**Phase-by-phase UI plan**

- POC to MVP roadmap
- Phase 1: Core UX (chat, preview, launch, dashboard)
- Phase 2: Visual builder (email editor, blocks)
- Phase 3: Journey orchestration (multi-step, rules)
- Phase 4: Cross-channel (ads, social)

**Read this if**: You're planning UI phases

---

## UI Principles

### 1. Marketing-Focused Language
- ❌ "terraform apply" → ✅ "Launch Campaign"
- ❌ "resources" → ✅ "campaigns"
- ❌ "state file" → ✅ "campaign status"

### 2. Hide Technical Details
- No mention of Terraform
- No mention of resources
- No mention of state management
- Show campaign cards, not resource definitions

### 3. Clear Progress Indicators
- "Creating audience..." ✅
- "Setting up emails..." ✅
- "Scheduling campaign..." ✅
- "Your campaign is live!" 🎉

### 4. Metric-Focused
- Show open rates, click rates, revenue
- Use charts and visualizations
- Compare to targets
- Highlight wins

---

## Component Reuse Strategy

### From `websites/web/features/Campaigns/`
- `CampaignWizard` - Campaign preview
- `CampaignsTable` - Campaign list
- `CampaignMetrics` - Performance display

### From `websites/web/features/Studio/`
- `TemplateEditor` - Email editor
- `PuckEditor` - Block editor

### From `websites/web/features/Journeys/`
- `JourneyVersionEditor` - Journey builder
- `JourneyTemplateList` - 14 pre-built templates

### From `websites/web/modules/insights-shared/`
- `NotebookRenderer` - Dashboard display
- `QueryRenderer` - Malloy query execution

---

## Quick Links

- **UX Designers**: Start with `marketing-focused-ui.md`
- **Frontend Developers**: See `../03-implementation/component-reuse.md`
- **Product Managers**: Review `poc-analysis.md` and `mvp-roadmap.md`
