# Final Implementation Roadmap (With Component Reuse)

## Game Changer Discovery

**We don't need to build UI components - they already exist!**

- ✅ Campaign builder: `features/Campaigns/`
- ✅ Email editor: `features/Studio/`
- ✅ Journey editor: `features/Journeys/`
- ✅ Dashboard: `modules/insights-shared/notebook`
- ✅ UI library: `packages/messagebird-boxkit`

**Impact**: 83% time reduction (48 hours → 8 hours for Phase 1)

---

## Revised Timeline

### Week 1: Backend + Integration (16 hours total)

#### Backend (8 hours)
- [ ] Whitelist Bird operations (30 min)
- [ ] Update session API for projectId (2 hours)
- [ ] Context injection in prompt (2 hours)
- [ ] Agent prompt updates (2 hours)
- [ ] Living document hydration service (1.5 hours)

#### Frontend Integration (8 hours)
- [ ] Agent chat interface (2 hours) - Custom
- [ ] Project selector (1 hour) - Custom
- [ ] Import campaign components (2 hours) - Integration
- [ ] Import dashboard components (1 hour) - Integration
- [ ] Launch progress indicator (1 hour) - Custom
- [ ] Wire to backend (1 hour) - Integration

**Deliverable**: Working MVP with agent chat → campaign launch → dashboard

---

### Week 2: Polish & Testing (8 hours)

- [ ] Error handling (2 hours)
- [ ] Loading states (1 hour)
- [ ] Mobile responsive (2 hours)
- [ ] User testing (2 hours)
- [ ] Bug fixes (1 hour)

**Deliverable**: Production-ready Phase 1

---

### Week 3: Terraform Generation (8 hours)

- [ ] Agent prompt for terraform (2 hours)
- [ ] Terraform config templates (2 hours)
- [ ] Backend terraform executor (2 hours)
- [ ] Frontend deployment UI (2 hours)

**Deliverable**: One-click deployment

---

### Week 4: Advanced Features (8 hours)

**Already built, just integrate**:
- [ ] Visual email editor from Studio (2 hours)
- [ ] Journey rules from Journeys (2 hours)
- [ ] Journey templates (1 hour)
- [ ] Advanced metrics (2 hours)
- [ ] Testing (1 hour)

**Deliverable**: Feature-complete system

---

## Component Reuse Strategy

### Phase 1: Core Components

```typescript
// apps/llmchain/src/frontend/App.tsx

import { NotebookRenderer } from '@/modules/insights-shared/components/notebook';
import { CampaignWizard } from '@/features/Campaigns/CampaignWizard';
import { CampaignMetrics } from '@/features/Campaigns/CampaignMetricsScreen';
import { Button, Card, Modal } from '@messagebird-dev/boxkit';

function MarketingAgentApp() {
  return (
    <div>
      {/* Custom: Agent chat */}
      <AgentChat />
      
      {/* Custom: Project selector */}
      <ProjectSelector />
      
      {/* Reused: Campaign preview */}
      <CampaignWizard campaign={agentProposal} />
      
      {/* Reused: Dashboard */}
      <NotebookRenderer markdown={dashboardYaml} />
      
      {/* Reused: Metrics */}
      <CampaignMetrics campaignId={deployedCampaign.id} />
    </div>
  );
}
```

### Phase 2: Advanced Components

```typescript
// Add visual editor
import { TemplateEditor } from '@/features/Studio/TemplateEditorScene';
import { PuckEditor } from '@/features/Studio/PuckEditor';

// Add journey editor
import { JourneyVersionEditor } from '@/features/Journeys/JourneyVersionScreen';
import { JourneyTemplateList } from '@/features/Journeys/JourneyTemplates';
```

---

## Architecture Simplification

### Before: Build Everything

```
Marketing Agent UI (48 hours)
├── Campaign builder (12 hours)
├── Email editor (16 hours)
├── Journey editor (20 hours)
└── Dashboard (8 hours)
```

### After: Integrate Existing

```
Marketing Agent UI (8 hours)
├── Agent chat (2 hours) - Custom
├── Project selector (1 hour) - Custom
├── Component imports (2 hours) - Integration
├── Backend wiring (2 hours) - Integration
└── Launch progress (1 hour) - Custom

Reused Components (0 hours)
├── Campaign builder ✅
├── Email editor ✅
├── Journey editor ✅
├── Dashboard ✅
└── UI library ✅
```

---

## Key Reusable Components

### 1. **Campaign Management**

```typescript
// Campaign creation
import { CampaignWizard } from '@/features/Campaigns/CampaignWizard';

// Campaign list
import { CampaignsTable } from '@/features/Campaigns/CampaignsListScreen';

// Campaign metrics
import { CampaignMetrics } from '@/features/Campaigns/CampaignMetricsScreen';

// A/B testing
import { ABTestMetrics } from '@/features/Campaigns/CampaignMetricsScreen/Metrics/ABTest';
```

### 2. **Email/Template Management**

```typescript
// Template editor
import { TemplateEditor } from '@/features/Studio/TemplateEditorScene';

// HTML email builder
import { HtmlEmailBuilder } from '@/features/Studio/HtmlEmailProjectBuilder';

// Block editor
import { PuckEditor } from '@/features/Studio/PuckEditor';

// Template gallery
import { TemplateLibrary } from '@/features/Studio/ProjectsListScene';
```

### 3. **Journey Management**

```typescript
// Journey editor
import { JourneyVersionEditor } from '@/features/Journeys/JourneyVersionScreen';

// Journey templates (14 pre-built!)
import { JourneyTemplateList } from '@/features/Journeys/JourneyTemplates';

// Journey metrics
import { JourneyInsights } from '@/features/Journeys/JourneyVersionScreen';

// Journey triggers
import { TriggerConfig } from '@/features/Journeys/triggers';
```

### 4. **Analytics/Dashboard**

```typescript
// Notebook renderer (for living documents!)
import { NotebookRenderer } from '@/modules/insights-shared/components/notebook';

// Query renderer
import { QueryRenderer } from '@/modules/insights-shared/components/query';

// Malloy editor
import { MalloyEditor } from '@/modules/insights-shared/components/editor';

// Marketing dashboard
import { MarketingDashboard } from '@/features/MarketingDashboard';
```

### 5. **UI Components**

```typescript
// Component library
import { 
  Button, Card, Modal, Input, Select, 
  Badge, Alert, Progress, Tabs 
} from '@messagebird-dev/boxkit';

// App components
import { 
  PageLayout, Header, Sidebar, 
  EmptyState, ErrorBoundary 
} from '@messagebird-dev/appkit';

// Icons (2,634 icons!)
import { Sparkles, Send, Mail, Users } from '@messagebird-dev/icons';
```

---

## Migration Strategy

### Option A: Separate App (Recommended)

**Create new app in monorepo**:

```
websites/web/apps/marketing-agent/
├── src/
│   ├── App.tsx                 # Main app
│   ├── components/             # Custom components
│   │   ├── AgentChat.tsx
│   │   ├── ProjectSelector.tsx
│   │   └── LaunchProgress.tsx
│   └── hooks/
│       └── useSession.ts
├── package.json                # Dependencies
└── vite.config.ts
```

**Benefits**:
- Clean separation
- Can import from `@/features/`
- Uses existing build system
- Shares components with main app

### Option B: Embed in Main App

**Add route in main app**:

```
websites/web/apps/web/src/features/MarketingAgent/
├── AgentChat.tsx
├── ProjectSelector.tsx
└── index.tsx
```

**Benefits**:
- Single app
- Easier navigation
- Shared authentication
- Shared state management

### Option C: Keep in llmchain (Current)

**Enhance existing UI**:

```
apps/llmchain/src/frontend/
├── App.tsx
└── components/
```

**Challenges**:
- Can't easily import from websites/web
- Would need to duplicate components
- Or publish components as npm packages

**Recommendation**: **Option A** - Create new app in monorepo

---

## Implementation Steps

### Step 1: Create New App (1 hour)

```bash
cd /Users/sbellity/code/nest/websites/web/apps

# Use generator
npx plop app marketing-agent

# Or copy structure from existing app
cp -r web/ marketing-agent/
```

### Step 2: Import Components (2 hours)

```typescript
// apps/marketing-agent/src/App.tsx

// Import existing components
import { CampaignWizard } from '@/features/Campaigns/CampaignWizard';
import { NotebookRenderer } from '@/modules/insights-shared/components/notebook';
import { Button, Card } from '@messagebird-dev/boxkit';

// Build custom components
import { AgentChat } from './components/AgentChat';
import { ProjectSelector } from './components/ProjectSelector';
```

### Step 3: Wire Backend (2 hours)

```typescript
// Connect to llmchain backend
const API_URL = 'http://localhost:3000';

async function startSession(projectId, prompt) {
  const response = await fetch(`${API_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, prompt })
  });
  return response.json();
}
```

### Step 4: Test Integration (3 hours)

- Test agent chat
- Test campaign preview
- Test launch flow
- Test dashboard display

---

## Dependencies

### Shared Packages (Already Available)

```json
{
  "dependencies": {
    "@messagebird-dev/boxkit": "*",
    "@messagebird-dev/appkit": "*",
    "@messagebird-dev/icons": "*",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### New Dependencies (Minimal)

```json
{
  "dependencies": {
    "eventsource": "^2.0.2"  // For SSE streaming
  }
}
```

---

## Success Metrics

### Phase 1 Success (Week 1-2)
- ✅ Agent chat works
- ✅ Campaign preview uses existing wizard
- ✅ Launch creates resources
- ✅ Dashboard shows live metrics
- ✅ No code duplication

### Phase 2 Success (Week 3-4)
- ✅ Visual email editor integrated
- ✅ Journey templates available
- ✅ Terraform deployment works
- ✅ User can launch in <5 clicks

---

## Conclusion

**Massive time savings by reusing existing components:**

| Aspect | From Scratch | With Reuse | Savings |
|--------|-------------|------------|---------|
| Phase 1 | 12 hours | 4 hours | 8 hours (67%) |
| Phase 2 | 16 hours | 2 hours | 14 hours (88%) |
| Phase 3 | 20 hours | 2 hours | 18 hours (90%) |
| **Total** | **48 hours** | **8 hours** | **40 hours (83%)** |

**We can ship Phase 1 in 1 week instead of 4 weeks!** 🎉

---

## Next Steps

1. **Decide**: Separate app (Option A) or embed in main app (Option B)?
2. **Create**: New app structure in monorepo
3. **Import**: Existing components
4. **Build**: Custom chat interface
5. **Wire**: Backend integration
6. **Test**: End-to-end flow

**Ready to start?**
