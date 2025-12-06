---
date: 2025-11-12
artifact_type: round_exploration
aliases:
  - "obsidian-integration - Concrete Proposals"
  - "obsidian-integration - Round 3"
tags:
  - space/p
  - domain/research
  - type/iterative-design
  - tech/obsidian
  - tech/kinen
  - tech/fam
summary: "Concrete proposals for file naming, tags, templates, plugin architecture, and FAM integration"
---

# Round 3: Concrete Proposals & Architecture

> [!success] Building on Round 2
> This round provides concrete proposals, examples, and architecture designs based on your Round 2 feedback.

This round delivers:
1. **File naming conventions** - Obsidian-idiomatic names
2. **Tag glossary & methodology** - Curated tag system
3. **Session templates** - Type-specific templates
4. **Semantic search solution** - Plugin research & proposal
5. **Kinen plugin architecture** - FAM integration design
6. **FAM + Obsidian backend** - File-based storage exploration
7. **Excalidraw diagram example** - Converting ASCII art
8. **Callout UX improvements** - Better editing experience

---

## 1. File Naming Conventions

> [!question] Your Input Needed
> Review these naming proposals and let me know what works best.

### Current Problem

Current naming: `round-01.md`, `round-02.md` - not descriptive in Obsidian's link dropdowns.

### Proposed Convention

**Option A: Descriptive Round Names**
```
round-01-linking-conventions.md
round-02-methodology-adaptation.md
round-03-concrete-proposals.md
```

**Pros**: Self-documenting, clear in link dropdowns
**Cons**: Longer names, manual naming

**Option B: Short Codes + Description**
```
r01-linking.md
r02-methodology.md
r03-proposals.md
```

**Pros**: Shorter, still descriptive
**Cons**: Less readable

**Option C: Numbered + Topic Tags**
```
01-linking-conventions.md
02-methodology-adaptation.md
03-concrete-proposals.md
```

**Pros**: Clean, sortable, descriptive
**Cons**: Need to maintain consistency

**Option D: Keep Current + Add Aliases**
```
round-01.md (alias: "Linking Conventions")
round-02.md (alias: "Methodology Adaptation")
```

**Pros**: No file rename needed, Obsidian supports aliases
**Cons**: Aliases not always shown in all contexts

### Recommendation: Option C

Use numbered prefix + descriptive topic. Example structure:

```
sessions/
  20251112-01-obsidian-integration/
    init.md
    rounds/
      01-linking-conventions.md
      02-methodology-adaptation.md
      03-concrete-proposals.md
    artifacts/
      integration-plan.md
      tag-glossary.md
      session-templates.md
```

**Q3.1**: Which option do you prefer? Or a hybrid approach?

> [!note] Answer
> Can we do Option C AND aliasing as well ? 
> I guess the aliasing will provide a better manual linking experience ?

---

## 2. Tag Glossary & Methodology

> [!tip] Tag System Design
> Creating a curated tag system with glossary and methodology guidance.

### Tag Categories

**Domain Tags** (what area of work):
- `#architecture` - System design, technical architecture
- `#product-design` - Product requirements, user experience
- `#research` - Research and analysis sessions
- `#creative-writing` - Creative writing, storytelling
- `#code-implementation` - Code implementation sessions
- `#business-strategy` - Business planning, strategy

**Session Type Tags** (methodology pattern):
- `#iterative-design` - Round-based iterative refinement (most common)
- `#requirements-refinement` - Requirements gathering and refinement
- `#research-design` - Research followed by design
- `#phased-analysis` - Multi-phase analysis
- `#simple-task` - Single-goal, straightforward tasks
- `#creative-writing` - Creative writing sessions

**Status Tags** (session state):
- `#in-progress` - Active session
- `#complete` - Completed session
- `#paused` - Temporarily paused
- `#blocked` - Blocked waiting on something

**Stakeholder Tags** (who's involved):
- `#backend` - Backend engineering focus
- `#frontend` - Frontend engineering focus
- `#product` - Product management focus
- `#design` - Design focus

**Technology Tags** (technologies involved):
- `#go` - Go language
- `#typescript` - TypeScript
- `#datahub` - DataHub platform
- `#obsidian` - Obsidian tooling

### Tag Glossary Document

Create `tag-glossary.md` in vault root:

```markdown
# Kinen Tag Glossary

This document defines standard tags for kinen sessions. Tags help discover related sessions and filter by category.

## Domain Tags
- `#architecture` - System design, technical architecture
- `#product-design` - Product requirements, user experience
...

## Usage Guidelines
- Use 2-4 tags per session (don't over-tag)
- Always include at least one Domain tag
- Include Session Type tag
- Add Status tag when session state changes
```

### Obsidian Tag Features

**Tag Pane**: Obsidian shows all tags in sidebar - helps discover related sessions
**Tag Autocomplete**: When typing `#`, Obsidian suggests existing tags
**Tag Wrangler Plugin**: Can rename tags across all files, merge tags, etc.

**Q3.2**: Should we create the tag glossary now? Any tags to add/remove?

> [!note] Answer
> YES that sounds like a good idea and good input for the assistants to do consistent tagging as well ? 


---

## 3. Session Templates

> [!important] Template System
> Templates drive methodology based on session type. Users can create custom templates.

### Template Structure

Templates use Obsidian's native template system + Templater plugin for variables.

**Base Template** (`templates/session-init.md`):
```markdown
---
date: {{date}}
artifact_type: session_init
tags: [{{tags}}]
  - space/p
summary: {{summary}}
---

# {{session_name}} - Initialization

## Session Goals
{{goals}}

## Success Criteria
{{success_criteria}}

## Methodology
{{methodology_type}}

## Key Documents
{{key_documents}}
```

### Type-Specific Templates

**Iterative Design Template** (`templates/iterative-design-init.md`):
```markdown
---
date: {{date}}
artifact_type: session_init
tags: [iterative-design, {{domain_tag}}]
  - space/p
summary: {{summary}}
---

# {{session_name}} - Initialization

## Session Goals
{{goals}}

## Success Criteria
{{success_criteria}}

## Methodology: Iterative Design
- Round-based exploration (typically 5-6 rounds)
- Progressive refinement
- Living documents evolve through rounds

## Expected Artifacts
- `rounds/` - Iterative exploration rounds
- `requirements.md` or `technical-spec.md` - Living document
- `session-summary.md` - Final summary

## Next Steps
1. Review Round 1 questions
2. Add responses using callouts
3. AI creates Round 2 based on feedback
```

**Creative Writing Template** (`templates/creative-writing-init.md`):
```markdown
---
date: {{date}}
artifact_type: session_init
tags: [creative-writing]
  - space/p
summary: {{summary}}
---

# {{session_name}} - Creative Writing Session

## Story Concept
{{story_concept}}

## Goals
{{goals}}

## Expected Artifacts
- Character sheets
- Plot outlines
- Story drafts
- World-building notes

## Methodology: Creative Writing
- Character exploration rounds
- Plot development rounds
- Scene writing rounds
- Revision rounds
```

### Template Variables

Templater plugin supports:
- `{{date}}` - Current date
- `{{time}}` - Current time
- `{{title}}` - Note title
- `{{folder_path}}` - Current folder
- Custom prompts: `{{session_name:Session Name}}` - Prompts user for input

### User Custom Templates

Users can:
1. Create custom templates in `templates/` folder
2. Reference in methodology
3. Share templates with others

**Q3.3**: Should I create templates for all session types? What variables are most important?

> [!note] Answer
> Please have a look at some of my past sessions in this kinen repo and I also have a bunch of sessions in ~/code/p/kinen-rs/research/sessions and see if you can extract good patterns and suggest relevant session templates

---

## 4. Semantic Search Solution

> [!tip] Semantic Search Research
> Exploring existing plugins and proposing solution.

### Existing Plugin Research

**Text Generator Plugin**:
- Uses OpenAI/Anthropic for semantic search
- Can search notes using natural language
- Requires API key, costs money
- **Status**: Available, actively maintained

**Smart Random Note Plugin**:
- Uses embeddings for similarity
- Can find related notes
- **Status**: Available but limited

**No Native Semantic Search**: Obsidian doesn't have built-in semantic search.

### Proposed Solution: Kinen Semantic Search Plugin

**Architecture**:
1. **Local Embeddings**: Use `sentence-transformers` (Python) or `@xenova/transformers` (JavaScript)
2. **Vector Database**: Store embeddings in SQLite (using `sqlite-vss` extension) or DuckDB
3. **Obsidian Plugin**: UI for semantic search, calls local service
4. **Background Indexing**: Automatically index new/updated notes

**Features**:
- Search: "Sessions about charging architecture"
- Related Notes: Show related sessions when viewing a note
- AI Integration: Assistant uses semantic search when preparing rounds

**Alternative: Leverage FAM/Kinen**

As you suggested, kinen could orchestrate semantic search:
- FAM/Kinen periodically analyzes vault
- Generates embeddings using local models
- Stores in DuckDB (file-based, fits Obsidian)
- Provides API for semantic search
- Obsidian plugin calls kinen API

**Q3.4**: Which approach do you prefer? Local plugin vs kinen-orchestrated?

> [!note] Answer
> Let's probably explore using fam/kinen as the driver for this as well

---

## 5. Kinen Plugin Architecture

> [!important] Plugin Design
> Designing kinen plugin with FAM integration (Option C from Round 2).

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Obsidian Vault                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Kinen Obsidian Plugin                     │  │
│  │  - Session management UI                          │  │
│  │  - Round creation/editing                         │  │
│  │  - Callout insertion helpers                      │  │
│  │  - Dashboard generation                           │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │ HTTP API                          │
└──────────────────────┼──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FAM Core (Local Daemon)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Orchestrator (LLM-powered)                │  │
│  │  - Creates rounds based on methodology            │  │
│  │  - Suggests links to related sessions             │  │
│  │  - Extracts decisions from rounds                 │  │
│  │  - Generates cross-session insights               │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │                                   │
│  ┌───────────────────▼──────────────────────────────┐  │
│  │         Repository (Obsidian Backend)             │  │
│  │  - Reads/writes Obsidian vault files              │  │
│  │  - Uses DuckDB for queries/indexing               │  │
│  │  - Manages session metadata                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Plugin Features

**1. Session Management**:
- Create new session (form-based)
- Select session type (loads template)
- View session dashboard
- Navigate rounds

**2. Round Interaction**:
- Pre-populate callout blocks for responses
- Mark round as "ready for next round"
- Visual indicators for round status

**3. AI Integration**:
- Button: "Generate Next Round"
- Button: "Suggest Links"
- Button: "Extract Decisions"
- Status: "AI is preparing Round 3..."

**4. Dashboard Generation**:
- Auto-generate session dashboard using Dataview
- Show progress, decisions, open questions
- Link to related sessions

### Obsidian Plugin API Capabilities

**What Obsidian Plugins Can Do**:
- ✅ Create/modify/delete files
- ✅ Read vault structure
- ✅ Show modals (forms, inputs)
- ✅ Add commands to command palette
- ✅ Add buttons to status bar
- ✅ Create custom views/panes
- ✅ Register hotkeys
- ❌ No native "forms" - but can create modals with HTML
- ❌ No native "buttons" in notes - but can use HTML or markdown with click handlers

**Form Alternative**: Modal with HTML form
```typescript
// Plugin can show modal
new Modal(app, (el) => {
  el.innerHTML = `
    <form>
      <input name="sessionName" placeholder="Session Name">
      <select name="sessionType">...</select>
      <button type="submit">Create</button>
    </form>
  `;
}).open();
```

**Button Alternative**: Use markdown with plugin command
```markdown
[Generate Next Round](obsidian://kinen-plugin?command=generate-next-round)
```

**Q3.5**: Does this architecture work? Should I create detailed plugin spec?

> [!note] Answer
> yes please explore further and start writing a spec for how this plugin and famkinen would integrate in practice.

---

## 6. FAM + Obsidian Backend Integration

> [!idea] Crazy Idea Exploration
> Replacing FAM's SQLite with Obsidian vault + DuckDB for queries.

### Current FAM Architecture

FAM uses SQLite for:
- Session metadata
- Turn history
- Artifact storage (content-addressable blobs)
- Event log

### Proposed: Obsidian Vault as Backend

**File Structure**:
```
vault/
  .fam/
    sessions/
      sess-001/
        metadata.json      # Session metadata
        turns/
          turn-001.json    # Turn data
          turn-002.json
        artifacts/
          artifact-001.md  # Artifact content
    duckdb/
      fam.db               # DuckDB for queries
```

**DuckDB for Queries**:
- Index session metadata
- Query turns by date, status, etc.
- Semantic search (embeddings)
- Cross-session analysis

**Benefits**:
- ✅ All data in markdown files (portable)
- ✅ DuckDB is file-based (no server needed)
- ✅ Can use Obsidian to browse/edit
- ✅ Version control friendly

**Challenges**:
- ❌ Concurrent writes (need locking)
- ❌ Performance for large datasets
- ❌ Transaction semantics

### Hybrid Approach

**Option**: Keep SQLite for FAM core, use Obsidian vault for kinen sessions

```
FAM Core (SQLite):
  - Session registry
  - Turn execution state
  - Agent registry
  - Workspace management

Obsidian Vault:
  - Kinen session files
  - Round files
  - Artifacts
  - Living documents
```

FAM reads/writes Obsidian vault files, but uses SQLite for orchestration state.

**Q3.6**: Which approach makes sense? Full Obsidian backend vs hybrid?

> [!note] Answer
> I think we indeed need to keep som kind of database for stateful agent execution... but turn state and workspace management, I would say... maybe not ?
> Would an obsidian vault correspond to a Fam workspace ?
> Turn execution state could be encoded in the metadata of our session files ? 
> Maybe let's keep a db for safe transactions and transient state, but that's it
> We should be able to rehydrate a fam db fully from the files that are in the Vault.
> Maybe we can use in memory sqlite db that holds the daemon state (with possibility of checkpointing it to a temp folder and reload it gracefully when agents restart... but the loss of a db should not be a problem)

---

## 7. Excalidraw Diagram Example

> [!experiment] Diagram Conversion
> Converting ASCII art to Excalidraw format.

### Original ASCII Art (from FAM architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    Obsidian Vault                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Kinen Obsidian Plugin                     │  │
│  └───────────────────┬──────────────────────────────┘  │
│                      │ HTTP API                          │
└──────────────────────┼──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FAM Core (Local Daemon)                    │
└─────────────────────────────────────────────────────────┘
```

### Excalidraw Format

Excalidraw uses JSON format. Here's the architecture diagram:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "type": "rectangle",
      "id": "obsidian-vault",
      "x": 100,
      "y": 100,
      "width": 400,
      "height": 200,
      "angle": 0,
      "strokeColor": "#000000",
      "backgroundColor": "#ffffff",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "seed": 12345,
      "versionNonce": 67890,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1234567890,
      "link": null,
      "locked": false
    },
    {
      "type": "text",
      "id": "vault-label",
      "x": 250,
      "y": 150,
      "width": 200,
      "height": 25,
      "angle": 0,
      "strokeColor": "#000000",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "roundness": null,
      "seed": 12346,
      "versionNonce": 67891,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1234567890,
      "link": null,
      "locked": false,
      "text": "Obsidian Vault",
      "fontSize": 20,
      "fontFamily": 1,
      "textAlign": "center",
      "verticalAlign": "middle",
      "baseline": 18,
      "containerId": null,
      "originalText": "Obsidian Vault"
    }
    // ... more elements for plugin, FAM core, arrows, etc.
  ],
  "appState": {
    "gridSize": null,
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```

**Note**: Full Excalidraw JSON is quite large. The plugin can generate these programmatically.

**Q3.7**: Should I create a full Excalidraw diagram for the architecture? Or would you prefer to see an example in an actual session file?

> [!note] Answer
> yes generate the diagram as an excalidraw file that we can embed in the next round (Is that how it's supposed to work ? 
> What about Obsidian canvas ? are they excalidraw or something else ? 
> What about mermaid ? is there support for it in Obsidian ? would it be a better option for technical diagrams ?
> Let's explore possibilities and please advise



---

## 8. Callout UX Improvements

> [!tip] Better Editing Experience
> Addressing callout editing discoverability and ease-of-use.

### Current Problem

Typing `> [!NOTE]` is:
- Hard to discover (need to know syntax)
- Easy to mistype
- Not intuitive for non-technical users

### Solutions

**Option A: Plugin Helper**
- Command: "Insert Response Callout"
- Inserts pre-formatted callout block
- Cursor positioned for typing

**Option B: Snippet/Shortcut**
- Type `:response` → expands to callout
- Or `:question`, `:note`, `:tip`, etc.

**Option C: Visual Editor**
- Use Obsidian's visual editor mode
- Click button to insert callout
- WYSIWYG editing

**Option D: Pre-populated Callouts**
- AI pre-populates empty callouts in rounds
- User just types inside
- No need to create callouts manually

### Recommended: Option D + Option A

1. **Pre-populate**: AI creates empty `> [!NOTE] Answer` blocks in round files
2. **Plugin Helper**: If user wants to add more callouts, use command/shortcut

**Example Round File**:
```markdown
## Question 1: Linking Conventions

What do you think about...

> [!NOTE] Answer
> _Your response here_

## Question 2: Tags

Another question...

> [!NOTE] Answer
> _Your response here_
```

**Q3.8**: Does pre-populating callouts solve the UX issue? Should we also add plugin helpers?

> [!note] Answer
> I think D + B + A actually... I like the snippets idea a lot. How would we set that up ? 


---

## 9. Session Completion Workflow

> [!question] Workflow Design
> How does user indicate "ready for next round"?

### Options

**Option A: Status File**
- Create `round-status.md` with checkboxes
- User checks "Round 2 complete"
- Plugin/FAM monitors file

**Option B: Plugin Button**
- Button in status bar: "Ready for Round 3"
- Click → triggers FAM to generate next round

**Option C: Command Palette**
- Command: "Kinen: Mark Round Complete"
- Command: "Kinen: Generate Next Round"

**Option D: File Metadata**
- Add frontmatter: `round_complete: true`
- FAM watches for changes

### Recommended: Option B + Option C

- **Status Bar Button**: Always visible, one-click
- **Command Palette**: For power users, keyboard shortcuts
- **Auto-detection**: FAM can also auto-detect when user stops editing

**Q3.9**: Which workflow feels most natural?

> [!note] Answer
> Agreeed B + C is a good balance
> 
> We did not really address the experience around session init though, how are you envisioning it ? As a command that the user can initiate that would create the structure of a session based on a template maybe ? Let's explore UX options for this too

---

## Summary: Concrete Deliverables

This round provides:

1. ✅ **File naming convention** - Option C recommended
2. ✅ **Tag glossary** - Ready to create
3. ✅ **Session templates** - Structure defined
4. ✅ **Semantic search** - Plugin proposal + kinen integration option
5. ✅ **Plugin architecture** - FAM integration design
6. ✅ **FAM backend** - Obsidian vault + DuckDB exploration
7. ✅ **Excalidraw example** - Format shown
8. ✅ **Callout UX** - Pre-population + plugin helpers
9. ✅ **Workflow** - Status bar button + commands

**Next Steps**: After your feedback, I'll:
- Create tag glossary document
- Create session templates
- Design detailed plugin spec
- Create Excalidraw diagram example
- Update methodology with new conventions

> [!info] Ready for Your Input
> Please review these proposals and let me know what works, what needs adjustment, and what's missing. I'll create concrete artifacts in Round 4.

