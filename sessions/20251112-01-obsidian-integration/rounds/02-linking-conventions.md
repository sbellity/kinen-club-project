---
date: 2025-11-12
artifact_type: round_exploration
aliases:
  - "obsidian-integration - Linking Conventions"
  - "obsidian-integration - Round 2"
tags:
  - space/p
  - domain/research
  - type/iterative-design
  - tech/obsidian
  - tech/kinen
summary: "Deep dive into linking conventions, methodology adaptation, semantic search, and plugin opportunities"
---

# Round 2: Linking Conventions, Methodology Adaptation & Plugin Exploration

> [!note] Format Experiment
> This round uses Obsidian callouts for annotations instead of `>>` markers. Let me know if this format works better for you!


> [!note] Answer
> Maybe you should insert the empty callouts where you expect the user to provide answers


Building on Round 1 responses, this round dives deeper into:
1. **Linking vs Tags conventions** - When to use each
2. **Option B methodology adaptation** - What Obsidian-native structure looks like
3. **Semantic search** - Plugin possibilities
4. **Plugin opportunities** - Based on existing session patterns
5. **Kinen plugin & FAM integration** - Native AI collaboration
6. **Non-technical user UX** - Making kinen accessible

---

## 1. Linking Conventions: When Links vs Tags?

You mentioned needing a hybrid approach with clear conventions. Let's explore what that looks like.

### Q2.1: What should links represent?

**Hypothesis**: Links represent **explicit relationships** - when one thing directly references, builds on, or relates to another.

**Link Use Cases**:
- **Round progression**: `round-02.md` → `round-01.md` (builds on)
- **Cross-session references**: Session A explicitly references concept from Session B
- **Living document connections**: `requirements.md` → `round-03.md` (where decision was made)
- **Concept definitions**: Link to where a concept was first defined or explored
- **Related artifacts**: `technical-spec.md` → `research.md` (spec builds on research)

**Example from your sessions**:
```
round-02.md contains:
"Building on [[round-01#Q1.2|the graph view discussion]], we should explore..."

requirements.md contains:
"This decision was made in [[round-03#Decision-3.2]]"
```

**Q2.1a**: Does this match your mental model? What other link relationships matter?


> [!NOTE] Answer
> That's a good start. We probably need to think of better naming convention for our files though, as linking files UX mainly show file names  in the link search drowpdown... thought ? 

### Q2.2: What should tags represent?

**Hypothesis**: Tags represent **themes, topics, or categories** - grouping by similarity rather than direct relationship.

**Tag Use Cases**:
- **Domain areas**: `#architecture`, `#product-design`, `#research`
- **Session types**: `#iterative-design`, `#requirements-refinement`, `#creative-writing`
- **Status**: `#complete`, `#in-progress`, `#blocked`
- **Stakeholders**: `#backend`, `#frontend`, `#product`
- **Technologies**: `#go`, `#typescript`, `#datahub`

**Key Difference**: Tags are **many-to-many** (many sessions can have same tag), links are **specific relationships** (this round builds on that round).

**Q2.2a**: What tags would you want to use? Looking at your sessions, I see patterns like:
- Domain: `#datahub`, `#accounting`, `#charging`, `#invoicing`
- Type: `#architecture-review`, `#prd`, `#technical-spec`
- Status: `#complete`, `#in-progress`

Are these the right categories?

 > [!NOTE] Answer
 > would be good to curate a list of tags and have a glossary somewhere that the user and assistant could curate together
 > maybe obsidian already has such a feature that would guide the user and assistant to use tags consistently
 > the methodology should describe best practives
 > user preferences should be captured somewhere
 > 
 > we probably also should have session templates that drive the methodology according to the type of work the user wants to du duting the session... let's explore this and also allow users to write their own templates... IIRC we explored similar ideas for fam
 
### Q2.3: Hybrid System Design

**Proposed Convention**:

1. **Links for explicit relationships**:
   - Round progression: Always link `round-NN.md` → `round-(N-1).md`
   - Cross-session: When explicitly referencing another session
   - Concept definitions: Link to canonical definition
   - Decision tracking: Link from decision to discussion

2. **Tags for discovery and filtering**:
   - Domain tags: Find all sessions about a topic
   - Type tags: Find all PRDs or architecture reviews
   - Status tags: Filter by completion state

3. **Both together**:
   - A session can be tagged `#architecture` AND link to specific related sessions
   - Tags help discovery, links show specific relationships

**Q2.3a**: Does this distinction make sense? Should we document this as part of the methodology?


 >[!NOTE] Answer
 >  we can start with that. Would be good to go back to all previous sessions in this kinen repository and analyze what tags and links we could use
 >  also consider naming convention for files as just using the same conventional "round-XX" name does not feel very idiomatic to Obsidian. explore alternatives.
---

## 2. Option B: Obsidian-Native Methodology Adaptation

You want to explore Option B - adapting structure to Obsidian patterns. Let me show what this could look like.

### Current Structure (File-Based)

```
session-folder/
  round-01.md
  round-02.md
  round-03.md
  requirements.md
  init.md
```

**Limitations**:
- Hierarchy is flat (all rounds equal)
- Relationships implicit (folder structure only)
- Cross-session connections hard to see

### Option B: Link-Centric Structure

**Core Idea**: Use links as primary organization, folders become secondary.

**Structure**:
```
sessions/
  session-name/
    init.md              # Session initialization
    rounds/
      round-01.md       # Links to init.md
      round-02.md       # Links to round-01.md
      round-03.md       # Links to round-02.md
    artifacts/
      requirements.md   # Links to relevant rounds
      technical-spec.md # Links to research, rounds
    research/
      exploration-01.md # Links to init.md
```

**Key Changes**:
1. **Rounds explicitly link**: Each round links to previous round
2. **Artifacts link to sources**: Requirements link to rounds where decisions made
3. **Graph view shows flow**: Can visualize round progression, artifact dependencies
4. **Tags for filtering**: Tag by domain, type, status

**Example Round Structure**:
```markdown
---
date: 2025-11-12
tags: [round-02, obsidian, methodology]
  - space/p
---

# Round 2: Linking Conventions

> [!info] Building on
> This round builds on [[round-01#Q1.1|Round 1's linking discussion]]

## Previous Round Summary
- [[round-01]] explored bi-directional linking
- Key insight: Need hybrid links + tags system

## This Round Focus
- Defining link vs tag conventions
- Exploring Option B structure
```

**Q2.4**: Does this link-centric approach feel right? What would you change?

### Option B Variant: MOC (Map of Content) Pattern

**MOC Pattern**: Create index notes that organize by theme, not just by session.

**Structure**:
```
sessions/
  MOCs/
    architecture-sessions.md    # Links to all architecture sessions
    product-design-sessions.md  # Links to all product sessions
    research-sessions.md        # Links to all research sessions
  
  session-name/
    (same structure as above)
```

**MOC Example**:
```markdown
# Architecture Sessions

## DataHub
- [[20251111-01-datahub-pages-api]]
- [[20251111-02-product-charging-architecture]]

## Charging Systems
- [[20251111-03-wallet-charging-correctness]]
- [[20251111-04-charging-client-integrations]]
```

**Q2.5**: Would MOCs help with cross-session discovery? Or is graph view + tags enough?


>[!NOTE] Answer
>  I am not sure, I will need your help to try both.... are they mutually exclusive though ?
---

## 3. Semantic Search: Plugin Possibilities

You asked about semantic search - this is a key feature for cross-session knowledge discovery.

### Q2.6: Semantic Search Options

**Option A: Text Generator Plugin**
- Uses OpenAI/Anthropic APIs for semantic search
- Can search across all notes using embeddings
- Pros: Powerful, understands meaning
- Cons: Requires API key, costs money, needs internet

**Option B: Local Embeddings Plugin**
- Uses local models (e.g., sentence-transformers)
- Generates embeddings locally
- Pros: Privacy, no API costs, works offline
- Cons: Requires local model, slower, more setup

**Option C: Hybrid Approach**
- Use local embeddings for search
- Use AI for query understanding/expansion
- Pros: Balance of privacy and intelligence
- Cons: More complex setup

**Option D: Obsidian's Native Search + Tags**
- Use full-text search with smart tags
- Pros: No setup, works immediately
- Cons: Not semantic, keyword-based only

**Q2.6a**: Which approach aligns with your priorities? Privacy vs. capability tradeoff?

> [!NOTE] Answer
>  are there plugins that do this already or should we consider creating one ?
### Q2.7: Semantic Search Use Cases

**What would you search for?**
- "Sessions about charging architecture" (finds related sessions even if they don't use exact term)
- "Decisions about wallet model" (finds where wallet decisions were made)
- "Sessions using iterative-design methodology" (finds similar approaches)

**Q2.7a**: Are these the right use cases? What else would you want to search semantically?

>[!NOTE] Answer
>yes that's exactly what I have in mind. 
>those search queries would be leveraged by the assistant to navigate to other notes when it's preparing a round, and suggest connections to other notes for the user to consider reading himself during the answering round

---

## 4. Plugin Opportunities: Learning from Existing Sessions

Looking at your existing sessions, here are plugin opportunities:

### Q2.8: Session Template Plugin

**Current**: Manual creation of `init.md`, `round-01.md`, etc.

**With Templater Plugin**:
- Template with variables: `{{session_name}}`, `{{date}}`, `{{goals}}`
- Auto-generate folder structure
- Pre-populate frontmatter

**Example Template**:
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
```

**Q2.8a**: Would templating help? What variables would you want?

>[!NOTE] Answer
>I will let you adapt the kinen methodology to adapt and write templates
>We can, as discussed previously also consider templating the sessions themselves depending on the type of work we are doing (brainstorming ideas, architecture, creative writing, code implementation etc...)

### Q2.9: Session Dashboard Plugin

**Current**: Manual tracking of round progress, decisions made

**With Dataview Plugin**:
- Auto-generate session dashboard showing:
  - Rounds completed
  - Decisions made (extracted from rounds)
  - Open questions
  - Related sessions

**Example Dashboard**:
```markdown
# Session Dashboard: {{session_name}}

## Progress
- Rounds: 3/6 completed
- Decisions: 12 made
- Open Questions: 5 remaining

## Decisions Made
- [[round-02#Decision-2.1]]: Use hybrid links + tags
- [[round-03#Decision-3.2]]: Adopt Option B structure

## Related Sessions
- [[20251111-01-datahub-pages-api]] (similar domain)
```

**Q2.9a**: Would this dashboard be valuable? What else should it show?

>[!NOTE] Answer
>I think that would be absolutely amazing !!!
### Q2.10: Cross-Session Analysis Plugin

**Current**: Hard to see patterns across sessions

**With Custom Plugin**:
- Analyze all sessions for:
  - Common patterns (what methodologies used most?)
  - Decision evolution (how did architecture decisions change?)
  - Knowledge gaps (what topics haven't been explored?)

**Q2.10a**: Would cross-session analysis help? What insights would be most valuable?

>[!NOTE] Answer
>do you mean that such plugins already exist ? 
>I was thinking that kinen (see ~/code/p/famkinen, ~/code/p/kinen-go, ~/code/p/kinen-rs) could serve as an orchstrator for producing those insights periodically
>Leveraging Obsidian existing features or existing plugins is something we can consider as well

### Q2.11: Diagramming Integration

**Current**: Diagrams in separate files or images

**With Excalidraw Plugin**:
- Create diagrams inline in notes
- Link diagrams to concepts
- Update diagrams as understanding evolves

**Q2.11a**: Do you create many diagrams? Would inline diagramming help?

>[!NOTE] Answer
>Absolutely !!
>Right now the assistants (you) are mostly producing ASCI-ART diagrams, I don't really like them, they are very often skewed and difficult to read and impossible for me to edit. 
>If you (the assistant) can write escalidraw diagrams then this is the dream !
> Let's try to see if you can find diagrams in a previous kinen session in this kinen repo and see what it would look like to translate them into excalidraw



---

## 5. Kinen Plugin: Native AI Collaboration

You mentioned exploring a kinen plugin for native Obsidian integration. Let's think through this.

### Q2.12: What Would Kinen Plugin Do?

**Core Functions**:
1. **Round Generation**: AI creates next round based on previous rounds
2. **Link Suggestions**: AI suggests links to related sessions/concepts
3. **Decision Extraction**: AI extracts decisions from rounds into living documents
4. **Cross-Session Insights**: AI identifies patterns across sessions
5. **Methodology Guidance**: AI enforces methodology (ensures rounds follow pattern)

**Q2.12a**: Which functions are most valuable? What's missing?

>[!NOTE] Answer
>All of those. it would be in the driver seat. I want to maybe be here to initiate sessions, set the topic and agenda and answer questions... like we are doing now.

### Q2.13: Plugin Architecture

**Option A: Obsidian Plugin + External API**
- Plugin is UI layer in Obsidian
- Calls kinen API (could be FAM-based) for AI operations
- Pros: Separation of concerns, can use existing kinen infrastructure
- Cons: Requires external service

**Option B: Self-Contained Plugin**
- Plugin includes AI client (OpenAI/Anthropic)
- All logic in plugin
- Pros: No external dependencies, works offline (for some features)
- Cons: API keys in plugin, harder to update

**Option C: Hybrid**
- Plugin for UI and file operations
- FAM integration for orchestration
- AI calls through FAM
- Pros: Leverages FAM architecture, clean separation
- Cons: Requires FAM setup

**Q2.13a**: Which architecture makes sense? Given FAM integration interest, Option C seems promising?


>[!NOTE] Answer
>Probably option C
>We could package the easy installation of FAM to on the user's machine and be in the driver seat to drive sessions. We would need to have a plugin in Obsidian to talk to Fam API I guess ? 
>I am not familiar with Obsidian APIs and plugin capabilties, please do a bit of research (see famkinen ~/code/p/famkinen apis) and try to come up with a good architecture (maybe also the occasion to draw this architecture in excalidraw to see what you are capable of ?)

### Q2.14: FAM Integration Within Obsidian

You mentioned the "crazy idea" of FAM completely within Obsidian. Let's explore this.

**Vision**: FAM orchestrates kinen sessions, and sessions live in Obsidian vault.

**How It Could Work**:
1. **FAM as Obsidian Plugin**: FAM runs as plugin, manages sessions
2. **Sessions as Obsidian Vault**: All session files in vault
3. **AI Orchestration**: FAM's orchestrator creates rounds, manages flow
4. **Resource Integration**: FAM can work with Git repos, other resources
5. **Cross-Platform**: Works on desktop (Obsidian) and mobile (Obsidian mobile)

**Q2.14a**: Does this vision align? What would make it compelling?

>[!NOTE] Answer
Let's see to what extent we can replace FAM repository, that is using a sqlite datbase right now in favor of just files ? and see how this could integrate with obsidian base (I have no idea how this works...) ?

**Q2.14b**: Would FAM need to be Obsidian-specific, or could it work with any markdown editor? (Obsidian just happens to be best UI)


>[!NOTE] Answer
>Not sure. maybe it could be an option in the fam setup to use Obsidian as its backend/database instead of sqlite ?
>I know it's a crazy idea but let's explore and see where the gaps are possibly
>FAM could embed duckdb as well to manage this data stored in flat files (idea ?)



---

## 6. Non-Technical User UX: Making Kinen Accessible

Your success criteria includes your wife being able to use kinen for creative writing and research. Let's design for that.

### Q2.15: What Makes Current Approach Daunting?

**For Non-Technical Users**:
- Code editor feels technical
- Markdown syntax unfamiliar
- File structure confusing
- No visual feedback

**Q2.15a**: What specific barriers does your wife face? What would make it easier?

>[!NOTE] Answer
>Yes all of those
>Also the prefixing of answers with ">>" is very annoying for most people, especially non technical users who are not used to edit Markdown files

### Q2.16: Obsidian UX Improvements

**Obsidian Advantages**:
- **Live Preview**: See formatted markdown as you type
- **Visual Editor**: Some plugins offer WYSIWYG editing
- **Templates**: Pre-made structures reduce cognitive load
- **Callouts**: Visual distinction (like this note!) easier than `>>` markers

**Q2.16a**: Which Obsidian features would help most? Should we prioritize WYSIWYG editing?

>[!NOTE] Answer
>yes they all feel important
>I am not sure about the UX around writing callouts though. 
>It's nice to see answers called out in the WYSIWYG editor but writing them still feels a bit off
>Can you think of a better way ? (btw, the idea of pre-populating the empty ">[!NOTE] Answer" in the round files already feels like a good idea though)

### Q2.17: Simplified Workflow for Non-Technical Users

**Proposed Flow**:
1. **Create Session**: Click button, fill form (name, goals, type)
2. **AI Creates Round 1**: Automatically generated, user just reads
3. **Respond**: Use callouts or visual editor to add responses
4. **AI Creates Next Round**: Automatically, user continues

**Key Simplifications**:
- No manual file creation
- No markdown syntax needed (visual editor)
- Clear visual distinction (callouts for responses)
- Guided workflow (plugin enforces methodology)

**Q2.17a**: Does this flow work? What's still too complex?

>[!NOTE] Answer
>Does Obsidian support forms ? buttons ? How ?
>Where would I indicate that my answers to the rounds are done and that the assistant can take over and prepare next round ?

### Q2.18: Creative Writing Use Case

**Specific Use Case**: Your wife doing creative writing sessions.

**What Would That Look Like?**:
- Session type: `creative-writing`
- Methodology: Different from technical sessions?
- Rounds: Focus on story development, character exploration, plot refinement?
- Artifacts: Story drafts, character sheets, plot outlines?

**Q2.18a**: How would creative writing sessions differ from technical sessions? Should methodology adapt?

>[!NOTE] Answer 
>not sure yet. probably in the types of tags and description of the artifacts that we are expected to produce as the outcome of the round ?

---

## 7. Callout Format Experiment

> [!question] Format Check
> This is a question callout. Does this format work better than `>>` markers for your responses?

> [!tip] Suggestion
> You could use different callout types:
> - `> [!question]` for questions
> - `> [!note]` for general notes
> - `> [!tip]` for suggestions
> - `> [!important]` for key points
> - `> [!warning]` for concerns

**Q2.19**: Do callouts work better? Should we standardize on a specific type for user responses?

>[!NOTE] Answer
>indeed it looks really nice, let's explore using more callouts and callout types during next round
>
>although the experience of typing those "> [!xxx]" and discoverability of the different types for a non technical user are not great, how can we make the editing experience better ?


## Summary: Key Areas to Resolve

After this round, we should have clarity on:

1. **Linking Conventions**: Clear rules for when to link vs tag
2. **Structure Adaptation**: Whether Option B makes sense, what it looks like
3. **Semantic Search**: Which approach to use
4. **Plugin Priorities**: Which plugins to explore/build first
5. **Kinen Plugin Scope**: What should it do, how should it integrate
6. **FAM Integration**: How FAM and Obsidian work together
7. **Non-Technical UX**: How to make kinen accessible

**Next Steps**: After your responses, I'll:
- Update `integration-plan.md` with decisions
- Create concrete examples of adapted methodology
- Research specific plugins for semantic search
- Design kinen plugin architecture (if we go that route)
- Create simplified workflow mockups

---

> [!info] Ready for Your Input
> Please add your responses using callouts (or `>>` if you prefer - we can compare!). I'll synthesize into Round 3 with concrete proposals and examples.

