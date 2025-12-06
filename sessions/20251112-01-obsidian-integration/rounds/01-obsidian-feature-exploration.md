---
date: 2025-11-12
artifact_type: round_exploration
aliases:
  - "obsidian-integration - Obsidian Feature Exploration"
  - "obsidian-integration - Round 1"
tags:
  - space/p
  - domain/research
  - type/iterative-design
  - tech/obsidian
  - tech/kinen
summary: "Initial broad exploration of Obsidian features and fit assessment for kinen sessions"
---

# Round 1: Obsidian Feature Exploration and Fit Assessment

This round establishes a foundation by exploring Obsidian's core capabilities and how they might enhance or conflict with kinen methodology.

## 1. Bi-Directional Linking and Knowledge Graph

Obsidian's signature feature is bi-directional linking - when you link from Note A to Note B, Obsidian automatically creates a backlink in Note B showing that Note A references it. This creates a knowledge graph.

**Q1.1: How would bi-directional linking enhance round-based exploration?**

Consider:
- Round files naturally reference each other (round-02 builds on round-01)
- Living documents reference rounds and vice versa
- Sessions might reference other sessions
- Concepts explored in one session might connect to another

**Option A: Explicit linking structure**
- Manually create links between rounds, sessions, concepts
- Pros: Full control, intentional connections
- Cons: Manual work, might miss implicit connections

**Option B: Tag-based connections**
- Use tags to create implicit connections
- Pros: Less manual work, automatic grouping
- Cons: Less precise, harder to see direct relationships

**Option C: Hybrid approach**
- Links for explicit relationships, tags for themes/topics
- Pros: Balance of intentional and automatic
- Cons: Two systems to maintain

>> We probably need something hybrid, but they don't necessarily overlap. Let's exploere where links are more relevant than tags, and vice versa and develop good conventions and system for when using one vs the other.

**Q1.2: Would graph view help visualize session evolution?**

The graph view shows all notes and their connections as a visual network. Could this help:
- See how concepts evolve across rounds?
- Identify related sessions or topics?
- Discover unexpected connections?
- Track knowledge growth over time?

What's your experience with graph views - helpful visualization or overwhelming?

>> I have never used this on a regular basis. It sounds like a good idea and very much in line with the ideas that we were exploring more generally with Kinen see (/Users/sbellity/code/p/kinen-rs/README.md)

## 2. Local Markdown Storage and Data Ownership

Obsidian stores everything as plain Markdown files locally. This aligns with kinen's current approach.

**Q2.1: Does local storage provide advantages over current setup?**

Current kinen sessions are already Markdown files in a directory structure. Obsidian would add:
- Rich preview/editing interface
- Link resolution and navigation
- Graph visualization
- Plugin ecosystem

But the underlying files remain the same. Is the enhanced interface worth adopting a new tool?

>> I need a good editor for non technical users adoption. Using a code editor to edit markdown files can feel pretty daunting for non developers. Obsidian would provide a good UX
>> We also need to find a good solution to replace the ">>" used at the start of each line to indicate that this is a response from the user or comment in the round. Let's see it we can find a good UX in obsidian, either natively or via a custom plugin maybe ?

**Q2.2: How important is data portability to you?**

Since Obsidian uses plain Markdown, you can:
- Use files with any Markdown editor
- Version control easily (already doing this)
- Export or migrate if needed
- Access files directly without Obsidian

Is this "no lock-in" aspect important, or would you be comfortable with a more integrated solution?

>> data portability and ownerthip are very important to me.
>> What did you have in mind ? What type of more integrated solution ?

## 3. Plugin Ecosystem and Customization

Obsidian has thousands of community plugins. Some potentially relevant ones:
- **Templater**: Advanced templates with variables
- **Dataview**: Query and display notes like a database
- **Kanban**: Board view for tasks
- **Calendar**: Daily/weekly note views
- **Tag Wrangler**: Enhanced tag management
- **Excalidraw**: Diagramming within notes

**Q3.1: Which plugin capabilities might enhance kinen workflows?**

Consider:
- **Round templates**: Auto-generate round files with consistent structure?
- **Session dashboards**: Visual overview of session progress?
- **Task tracking**: Integrate action items from rounds?
- **Diagramming**: Create architecture diagrams inline?
- **Querying**: Find all sessions mentioning a concept?

What workflows feel most valuable to enhance?

>> They all look interesting, let's explore... maybe look into other sessions in this kinen repository and try to think what would be useful or would have been useful in retrospective.

**Q3.2: What's your tolerance for plugin management?**

Plugins require:
- Installation and configuration
- Updates and maintenance
- Potential conflicts or breaking changes
- Learning curve for each plugin

Is the customization worth the complexity?

>> I can't make a determination in principle. We need to look at the specifics of this quesstion.

## 4. Collaboration and AI Integration

Kinen sessions involve collaboration between AI and human. Obsidian is primarily individual-focused.

**Q4.1: How would Obsidian handle AI + human collaboration?**

Current workflow:
- AI creates round files
- Human adds inline responses with `>>` markers
- AI reads responses and creates next round

With Obsidian:
- AI could still create/edit Markdown files (same as now)
- Human uses Obsidian interface for responses
- AI reads files (same as now)

**Question**: Does Obsidian's interface improve the human experience enough to justify adoption, even if AI workflow stays the same?

>> I think we can also reconsider AI workflow and see how we can integrate it more natively in Obsidian... possibly via a kinen plugin ? Does not have to be though if you think of a better way.
>> Even more crazy idea, let's see how this could be integrated with fam (see: "spaces/p/sessions/20251109-01-fam-architecture-review/SESSION_SUMMARY.md") and fam completely within Obsidian...

**Q4.2: Are there Obsidian features that could enhance AI collaboration?**

Possibilities:
- **Live preview**: See formatted markdown as you type
- **Link autocomplete**: Easier navigation between related notes
- **Graph exploration**: AI could suggest connections
- **Template variables**: More structured round generation

Would any of these meaningfully improve the collaboration experience?

>> yes absolutely all of those !

## 5. Round-Based Methodology Adaptation

Kinen methodology has specific patterns:
- Round files (round-01.md, round-02.md, etc.)
- Inline annotation with `>>` markers
- Living documents that evolve
- Frontmatter metadata

**Q5.1: How should Obsidian integrate with existing round structure?**

**Option A: Keep current structure, use Obsidian as viewer**
- Maintain exact file/folder structure
- Use Obsidian for reading/navigation
- Pros: No methodology changes, easy migration
- Cons: Doesn't leverage Obsidian features fully

**Option B: Adapt structure to Obsidian patterns**
- Use Obsidian's linking instead of folder hierarchy
- Leverage tags and metadata more
- Pros: Better Obsidian integration
- Cons: Methodology changes required

**Option C: Hybrid - enhance current structure**
- Keep rounds and folders
- Add links between related concepts
- Use tags for themes
- Pros: Best of both worlds
- Cons: More complex

Which direction feels right?

>> Let's expore what option B would looke like, I am open but can't really grasp what it would mean, I will need yuor help to dive deeper.

**Q5.2: How would inline annotation (`>>` markers) work in Obsidian?**

Current approach: Human adds `>>` responses directly in markdown.

With Obsidian:
- Same approach (still markdown)
- Could use callouts/blockquotes for visual distinction
- Could use comments plugin for non-visible annotations
- Could use separate "response" files linked to rounds

What feels most natural for the annotation workflow?

>> I would tend to say callout/blockquotes. Let's try to do that for next round maybe to see what it would look like ?
>> I can try to do next round in Obsidian actually
>> We can also try to adjust the format and methodology during this session to exlore for real, I'll use obsidian to edit the questions

## 6. Cross-Session Knowledge and Discovery

One potential Obsidian advantage: discovering connections across sessions.

**Q6.1: How valuable is cross-session knowledge discovery?**

Current: Sessions are somewhat isolated. Finding related work requires:
- Manual search
- Remembering what exists
- Reading through multiple sessions

With Obsidian:
- Graph view shows connections
- Backlinks reveal what references a concept
- Tags group related sessions
- Search with link context

> cross-session knowledge discovery is ABSOLUTELY core the the kinen philosophy ! That's what drew me to Obsidian in the first place as a possible solution to make kinen sessions more valuable beyond the individual outcome of a particular session.

**Question**: How often do you find yourself wanting to reference or connect to previous sessions? Would better discovery tools change how you work?

>> VERY OFTEN, and the more we have sessions, the more it becomes valuable.

**Q6.2: Should sessions be more interconnected?**

**Option A: Keep sessions isolated**
- Each session is self-contained
- Pros: Clear boundaries, focused work
- Cons: Miss opportunities for synthesis

**Option B: Encourage cross-session linking**
- Explicitly link related sessions
- Pros: Build knowledge network
- Cons: More maintenance, potential distraction

**Option C: Let connections emerge naturally**
- Link when it makes sense, don't force it
- Pros: Organic growth
- Cons: Might miss valuable connections

What's your preference?

>> I don't think we need to choose between B & C. I would say that it's a mix of explicit linking. The AI should always try to find opportunities to link and make references by the way (that should be part of the updated methodology instructions).

## 7. Workflow Integration and Daily Use

**Q7.1: How would Obsidian fit into your daily workflow?**

Consider:
- **Session creation**: Would you create new sessions in Obsidian?
- **During sessions**: Would you use Obsidian for reading/responding to rounds?
- **Between sessions**: Would you browse graph view or search for related work?
- **Reference**: Would you use Obsidian as a knowledge base for past sessions?

>> They all seem right, yes.
>> One think that I thought was important for kinen was also the ability to do semantic search. Do you know if it's possible with Obsidian, via plugins maybe ?

**Q7.2: What's the learning curve vs benefit tradeoff?**

Obsidian requires:
- Learning the interface
- Understanding linking concepts
- Configuring plugins (if used)
- Developing new workflows

Current approach:
- Simple file editing
- Familiar markdown
- No new tools

Is the potential benefit worth the investment?

>> Very basically, Obsidian can just be used as a Markdown editor. But connections and knowloedge will build over time, driven by the assistatnt ability to generate insights and connect them.
>> I think that will allow users that are not Obsidian power users to gradually se the benefits without investing too much of time trying to figure out their workflow and methodology, since this is what kinen will drive.

## 8. Technical Considerations

**Q8.1: What are the technical constraints?**

- **File location**: Obsidian needs a "vault" (folder). Your kinen folder could be the vault.
- **Sync**: If you want cross-device sync, need Obsidian Sync (paid) or alternative (git, iCloud, etc.)
- **Performance**: Large vaults can be slow, especially with many plugins
- **Backup**: Still need backup strategy (git, cloud storage, etc.)

**Question**: Are there any technical constraints that would block adoption?

>> I don't think so.
>> Users would be in charge of deciding how they want to do it... like any Obsidian vault.
>> That would also add the benefit of giving access to a great mobile apps to do sessions on mobile ;)

**Q8.2: How would version control work?**

Current: Git tracks all changes.

With Obsidian:
- Still Git-tracked (same files)
- Obsidian's `.obsidian` folder contains config (should be gitignored or committed?)
- Plugin configs in `.obsidian`
- No conflicts - Obsidian just reads/writes markdown

**Question**: Any concerns about version control integration?

>> Not our concern, users are in charge of deciding how they want to deal with their vault's backup and version control.

## Summary Questions

After exploring these areas, I'm particularly curious about:

1. **Primary motivation**: What's driving interest in Obsidian? Is it specific pain points with current approach, or curiosity about new capabilities?

>> non technical users adoption
>> better ux for responses and markdown editing
>> connected knowloedge graph
>> integration into an ecosystem of plugins and users that could be a good target demographic for kinen adoption


2. **Must-have features**: Which Obsidian features feel most compelling? (linking, graph view, plugins, interface, etc.)

>> mainly Markdown editing, linking and plugin ecosystem for extending possibilities

3. **Deal-breakers**: What would make Obsidian a non-starter? (complexity, cost, workflow disruption, etc.)

>> not sure

4. **Success criteria**: What would make Obsidian integration "successful"? How would you measure it?

>> If I use it daily instead of my code editor and if my wife is able to do kinen session on it as well (for creative writing and research)

5. **Migration concerns**: If we adopt Obsidian, what are your biggest concerns about transitioning existing sessions?

>> I don't have any issue, my sessions are a bit all over the place...We'll adapt.

---

**Next Steps**: Please add your responses using `>>` markers. I'll synthesize these into Round 2, diving deeper into the most promising areas and addressing concerns.

