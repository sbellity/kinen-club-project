# Reusable Components from websites/web

## Overview

You're absolutely right! The web app has **extensive existing components** that can be reused for the Marketing Agent UI. This dramatically reduces implementation time.

---

## Existing Components We Can Reuse

### 1. **Campaign Builder** (`features/Campaigns/`)

**What exists**:
- ✅ `CampaignBuilder/` - Full campaign builder
- ✅ `CampaignWizard/` - Step-by-step wizard (158 files!)
- ✅ `CampaignMetricsScreen/` - Performance metrics
- ✅ `CampaignsListScreen/` - Campaign list with filters
- ✅ Campaign calendar, filters, metrics cards

**What we can reuse**:
```typescript
// Campaign creation wizard
import { CampaignWizard } from '@/features/Campaigns/CampaignWizard';

// Campaign metrics display
import { CampaignMetrics } from '@/features/Campaigns/CampaignMetricsScreen';

// Campaign list/cards
import { CampaignsTable } from '@/features/Campaigns/CampaignsListScreen';
```

**For Marketing Agent**:
- Use `CampaignWizard` for campaign preview/configuration
- Use `CampaignMetrics` for dashboard display
- Use campaign cards for project view

---

### 2. **Email/Template Builder** (`features/Studio/`)

**What exists**:
- ✅ `TemplateEditorScene/` - Full template editor (250 files!)
- ✅ `ChannelTemplateProjectBuilder/` - Multi-channel templates (322 files!)
- ✅ `HtmlEmailProjectBuilder/` - HTML email builder
- ✅ `PageEditor/` - Visual page editor
- ✅ `PuckEditor/` - Block-based editor

**What we can reuse**:
```typescript
// Template editor
import { TemplateEditor } from '@/features/Studio/TemplateEditorScene';

// Email builder
import { HtmlEmailBuilder } from '@/features/Studio/HtmlEmailProjectBuilder';

// Block editor
import { PuckEditor } from '@/features/Studio/PuckEditor';
```

**For Marketing Agent**:
- Use `TemplateEditor` for email preview/editing
- Use `PuckEditor` for drag-drop blocks (Phase 2)
- Use template gallery for selecting templates

---

### 3. **Journey Builder** (`features/Journeys/`)

**What exists**:
- ✅ `JourneyVersionEditor` - Visual journey editor
- ✅ Journey templates (14 pre-built templates!)
- ✅ Journey metrics and insights
- ✅ Step configuration forms
- ✅ Trigger configuration

**What we can reuse**:
```typescript
// Journey editor
import { JourneyVersionEditor } from '@/features/Journeys/JourneyVersionScreen';

// Journey templates
import { JourneyTemplateList } from '@/features/Journeys/JourneyTemplates';

// Journey metrics
import { JourneyInsights } from '@/features/Journeys/JourneyVersionScreen';
```

**For Marketing Agent**:
- Use journey templates for campaign sequences
- Use journey editor for multi-step campaigns (Phase 3)
- Use journey metrics for performance tracking

---

### 4. **Flow Builder** (`features/Flows/`)

**What exists**:
- ✅ `FlowEditScreen/` - Visual flow editor
- ✅ `FlowTreeView/` - Tree-based flow view
- ✅ Actions editor with 94 action types
- ✅ Trigger configuration
- ✅ Conditional logic builder

**What we can reuse**:
```typescript
// Flow editor
import { FlowEditScreen } from '@/features/Flows/FlowEditScreen';

// Conditional builder
import { ConditionalBuilder } from '@/features/Flows/components';
```

**For Marketing Agent**:
- Use conditional logic for campaign rules
- Use flow templates for automation (Phase 3)

---

### 6. **Shared UI Components** (`packages/`)

**What exists**:
- ✅ `messagebird-boxkit/` - Component library (545 files!)
- ✅ `messagebird-appkit/` - App components (881 files!)
- ✅ `messagebird-editor/` - Rich text editor
- ✅ `messagebird-malloy-plugins/` - Malloy chart components
- ✅ `messagebird-icons/` - Icon library (2,634 icons!)

**What we can reuse**:
```typescript
// UI components
import { Button, Card, Modal, Input } from '@messagebird-dev/boxkit';

// App components
import { PageLayout, Header, Sidebar } from '@messagebird-dev/appkit';

// Editor
import { RichTextEditor } from '@messagebird-dev/editor';

// Malloy charts (for dashboard!)
import { MalloyChart } from '@messagebird-dev/malloy-plugins';
```

**For Marketing Agent**:
- Use boxkit for all UI components
- Use appkit for page layouts
- Use malloy-plugins for dashboard charts (living documents!)

---

### 7. **Insights Components** (`modules/insights-shared/`)

**What exists** (we already know):
- ✅ Notebook renderer (for living documents!)
- ✅ Query components
- ✅ Malloy editor
- ✅ Chart components

**What we can reuse**:
```typescript
// Notebook renderer (for dashboard!)
import { NotebookRenderer } from '@/modules/insights-shared/components/notebook';

// Query renderer
import { QueryRenderer } from '@/modules/insights-shared/components/query';

// Malloy editor
import { MalloyEditor } from '@/modules/insights-shared/components/editor';
```

**For Marketing Agent**:
- Use `NotebookRenderer` for dashboard display
- Use `QueryRenderer` for live metrics
- Use `MalloyEditor` for query editing (Phase 2)

---

## Revised Implementation Estimate

### Before (Building from Scratch)

| Phase | Estimate | Components |
|-------|----------|------------|
| Phase 1: Core UI | 12 hours | Campaign cards, preview, dashboard |
| Phase 2: Visual Builder | 16 hours | Email editor, block system |
| Phase 3: Journey Rules | 20 hours | Rules UI, orchestration |
| **Total** | **48 hours** | Everything custom |

### After (Reusing Existing Components)

| Phase | Estimate | Components |
|-------|----------|------------|
| Phase 1: Core UI | **4 hours** | Import + wire existing components |
| Phase 2: Visual Builder | **2 hours** | Already exists in Studio |
| Phase 3: Journey Rules | **2 hours** | Already exists in Journeys |
| **Total** | **8 hours** | Mostly integration work |

**Savings: 40 hours (83% reduction!)** 🎉

---

## Component Mapping

### Marketing Agent UI → Existing Components

| Marketing Agent Need | Existing Component | Location |
|----------------------|-------------------|----------|
| **Campaign preview** | `CampaignWizard` | `features/Campaigns/CampaignWizard` |
| **Campaign list** | `CampaignsTable` | `features/Campaigns/CampaignsListScreen` |
| **Campaign metrics** | `CampaignMetrics` | `features/Campaigns/CampaignMetricsScreen` |
| **Email editor** | `TemplateEditor` | `features/Studio/TemplateEditorScene` |
| **Block editor** | `PuckEditor` | `features/Studio/PuckEditor` |
| **Journey editor** | `JourneyVersionEditor` | `features/Journeys/JourneyVersionScreen` |
| **Journey templates** | `JourneyTemplateList` | `features/Journeys/JourneyTemplates` |
| **Dashboard** | `NotebookRenderer` | `modules/insights-shared/components/notebook` |
| **Malloy queries** | `QueryRenderer` | `modules/insights-shared/components/query` |
| **Conditional logic** | `ConditionalBuilder` | `features/Flows/components` |
| **UI components** | `boxkit` | `packages/messagebird-boxkit` |
| **Page layout** | `appkit` | `packages/messagebird-appkit` |

---

## Revised Architecture

### Frontend Stack

```typescript
// Marketing Agent UI (NEW)
apps/llmchain/src/frontend/
├── App.tsx                    # Main app
├── components/
│   ├── AgentChat.tsx          # Chat interface (custom)
│   ├── ProjectSelector.tsx    # Project list (custom)
│   ├── CampaignCard.tsx       # Reuse from Campaigns
│   ├── CampaignPreview.tsx    # Reuse CampaignWizard
│   ├── LaunchProgress.tsx     # Custom progress indicator
│   └── Dashboard.tsx          # Reuse NotebookRenderer
└── hooks/
    └── useSession.ts          # Session management

// Reused from web app
@/features/Campaigns/           # Campaign components
@/features/Studio/              # Template editor
@/features/Journeys/            # Journey builder
@/modules/insights-shared/      # Dashboard/notebook
@messagebird-dev/boxkit         # UI components
@messagebird-dev/appkit         # Page layouts
```

---

## Implementation Plan (Revised)

### Phase 1: Core Integration (4 hours)

**What to build** (custom):
1. Agent chat interface (2 hours)
2. Project selector (1 hour)
3. Wire existing components (1 hour)

**What to reuse** (existing):
- ✅ Campaign preview: `CampaignWizard`
- ✅ Campaign metrics: `CampaignMetrics`
- ✅ Dashboard: `NotebookRenderer`
- ✅ UI components: `boxkit`

### Phase 2: Visual Builder (2 hours)

**What to integrate**:
- Import `TemplateEditor` from Studio
- Import `PuckEditor` for blocks
- Wire to terraform generation

**Already exists**:
- ✅ Full email editor
- ✅ Drag-drop blocks
- ✅ Device preview
- ✅ Template gallery

### Phase 3: Journey Rules (2 hours)

**What to integrate**:
- Import `JourneyVersionEditor` from Journeys
- Import journey templates
- Wire to campaign schedule

**Already exists**:
- ✅ Visual journey editor
- ✅ 14 pre-built templates
- ✅ Step configuration
- ✅ Conditional logic

---

## Key Insights

### 1. **We're Not Building a UI, We're Integrating One**

The web app has **everything we need**:
- Campaign builder ✅
- Email editor ✅
- Journey editor ✅
- Dashboard/analytics ✅
- UI component library ✅

**We just need to**:
- Wire these components to the agent
- Add chat interface
- Add project context
- Connect to terraform backend

### 2. **Malloy Components Already Exist**

For living documents:
- ✅ `NotebookRenderer` - Renders markdown with malloy queries
- ✅ `QueryRenderer` - Executes and displays query results
- ✅ `MalloyEditor` - Edit queries
- ✅ `MalloyChart` - Visualize results

**No need to build dashboard from scratch!**

### 3. **Journey Templates Are Gold**

`features/Journeys/JourneyTemplates/templates/`:
- ✅ Abandoned cart
- ✅ Welcome series
- ✅ Post-purchase follow-up
- ✅ Customer winback
- ✅ Birthday campaigns
- ✅ And more...

**Agent can reference these templates when proposing campaigns!**

---

## Updated Roadmap

### Week 1: Integration (8 hours)

**Custom components** (4 hours):
- Agent chat interface
- Project selector
- Launch progress indicator

**Integration** (4 hours):
- Import campaign components
- Import dashboard components
- Wire to backend
- Test end-to-end

### Week 2: Polish (8 hours)

**Refinement**:
- Error handling
- Loading states
- Mobile responsive
- User testing

### Week 3-4: Advanced Features (8 hours)

**Already built, just integrate**:
- Visual email editor (Studio)
- Journey rules (Journeys)
- Conditional logic (Flows)

**Total: 24 hours instead of 48 hours!**

---

## Example: Using Existing Components

### Campaign Preview

```typescript
// Marketing Agent UI
import { CampaignWizard } from '@/features/Campaigns/CampaignWizard';

function CampaignPreview({ campaign, onLaunch }) {
  return (
    <Modal>
      <CampaignWizard
        initialData={campaign}
        onComplete={onLaunch}
        readOnly={false}
      />
    </Modal>
  );
}
```

### Dashboard Display

```typescript
// Marketing Agent UI
import { NotebookRenderer } from '@/modules/insights-shared/components/notebook';

function CampaignDashboard({ projectId, dashboardYaml }) {
  return (
    <NotebookRenderer
      markdown={dashboardYaml}  // Living document with malloy queries
      workspaceId={workspaceId}
      model={model}
      useQueryHook={useQueryHook}
    />
  );
}
```

### Email Editor

```typescript
// Marketing Agent UI (Phase 2)
import { TemplateEditor } from '@/features/Studio/TemplateEditorScene';

function EmailEditor({ template, onSave }) {
  return (
    <TemplateEditor
      template={template}
      onSave={onSave}
      mode="email"
    />
  );
}
```

---

## Conclusion

**We're not building a UI from scratch. We're creating a thin integration layer.**

### What We Need to Build (Custom)

1. **Agent chat interface** (2 hours)
2. **Project selector** (1 hour)
3. **Launch progress** (1 hour)
4. **Integration glue** (4 hours)

**Total: 8 hours for Phase 1**

### What We Reuse (Existing)

1. ✅ Campaign builder
2. ✅ Email editor
3. ✅ Journey editor
4. ✅ Dashboard (notebook renderer)
5. ✅ Metrics display
6. ✅ UI component library
7. ✅ Journey templates

**Total: ~5,000 files of existing code!**

### Impact

**Before**: 48 hours to build everything
**After**: 8 hours to integrate existing components

**Time savings: 40 hours (83%)** 🚀

**This changes everything! We can ship Phase 1 in 1 week instead of 4 weeks!**

---

### 5. **Query/Rule Builder** (Multiple locations)

**What exists**:
- ✅ Audience filters in `Campaigns/`
- ✅ Conditional logic in `Flows/`
- ✅ Journey conditions in `Journeys/`
- ✅ Approval flow rules in `ApprovalFlows/`

**What we can reuse**:
```typescript
// Audience builder
import { CampaignsFilters } from '@/features/Campaigns/CampaignsListScreen';

// Conditional builder
import { ConditionalConfig } from '@/features/Journeys/JourneyVersionScreen';
```

**For Marketing Agent**:
- Use for audience criteria configuration
- Use for campaign rules (Phase 2)

---

### 6. **Analytics/Insights** (Multiple locations)

**What exists**:
- ✅ `MarketingDashboard/` - Marketing analytics
- ✅ `MarketingDashboard-malloy/` - Malloy-based queries!
- ✅ `Insights/` - General insights components
- ✅ Campaign metrics in various features

**What we can reuse**:
```typescript
// Marketing dashboard
import { MarketingDashboard } from '@/features/MarketingDashboard';

// Malloy queries (perfect for living documents!)
import { MalloyQuery } from '@/features/MarketingDashboard-malloy';

// Insights components
import { InsightsChart } from '@/features/Insights';
```

**For Marketing Agent**:
- Use `MarketingDashboard` for performance view
- Use `MalloyQuery` for dashboard hydration (living documents!)
- Use insights charts for metrics visualization

---

## Shared UI Components (`packages/`)

Let me check what's in packages:

<function_calls>
<invoke name="LS">
<parameter name="target_directory">/Users/sbellity/code/nest/websites/web/packages