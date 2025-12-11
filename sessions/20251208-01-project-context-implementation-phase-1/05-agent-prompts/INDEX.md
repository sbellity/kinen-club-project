# Marketing Agent System - Complete Specification

> **Status**: Architecture Complete ✅  
> **Date**: December 8, 2025  
> **Version**: 1.0.0

---

## 🎯 What This Is

A **multi-agent marketing system** where specialized AI agents collaborate to plan, execute, and optimize marketing campaigns on the Bird platform. Skills are distributed via the existing connectors marketplace.

---

## 📖 Documentation Structure

### **START HERE** → [`ARCHITECTURE.md`](./ARCHITECTURE.md)
Complete system architecture in one document:
- Three-layer architecture (Agents → Skills → Infrastructure)
- 7 specialized agents with clear deliverables
- Skills distributed via connectors marketplace
- Complete project lifecycle (Ideation → Learning)
- Implementation roadmap (12 weeks)

---

## 📚 Reference Documents

### Agent Specifications
- **[`agents/`](./agents/)** - Individual agent specifications
  - Each agent: role, responsibilities, deliverables, skills used
  - Read when implementing specific agents

### Skills Specifications  
- **[`skills/`](./skills/)** - Individual skill specifications
  - Each skill: purpose, inputs, outputs, prompt template
  - Read when implementing specific skills

### Prompts & Guidelines
- **[`prompts/`](./prompts/)** - System prompts and prompt engineering
  - system-prompt.md - Complete base system prompt
  - Prompt composition guidelines
  - Testing strategies

### Reference Materials
- **[`reference/`](./reference/)** - Frameworks, patterns, benchmarks
  - skills-framework.md - Modular skills approach
  - Marketing frameworks (5S, AIDA, Lifecycle)
  - Technical patterns and examples

### Implementation Guides
- **[`implementation/`](./implementation/)** - Technical implementation details
  - Connectors integration guide
  - llmchain integration guide
  - API specifications
  - 12-week timeline

### Testing & Evaluation
- **[`testing/`](./testing/)** - Comprehensive testing framework
  - Unit, integration, and live tests
  - LLM-as-a-judge evaluation
  - Regression and performance tests
  - Advanced testing techniques

---

## 🚀 Quick Start

### **New to the project?**
**Start here**: [`GETTING-STARTED.md`](./GETTING-STARTED.md)
- Day 1 setup guide (4 hours)
- Create your first skill
- Week-by-week roadmap
- Development commands

### **Ready to implement V1?**
**See**: [`implementation/v1-implementation-plan.md`](./implementation/v1-implementation-plan.md)
- 4-week detailed plan
- All 30 skills breakdown (ABM, SaaS, E-commerce)
- Complete code examples
- Testing strategy

---

## 📖 Quick Start by Role

### For Architects
**Read**: [`ARCHITECTURE.md`](./ARCHITECTURE.md) (complete overview)

### For Backend Engineers
**Read**: [`implementation/v1-implementation-plan.md`](./implementation/v1-implementation-plan.md)
- Skills infrastructure (SkillsLoader, PromptComposer, AgentHarness)
- Complete code examples
- Week-by-week tasks

### For Agent Developers
**Read**: [`agents/README.md`](./agents/README.md)
- Agent development guidelines
- Agent collaboration patterns

### For Skill Developers
**Read**: [`skills/README.md`](./skills/README.md)
- Skill development guidelines
- Skill specification format

### For Prompt Engineers
**Read**: [`prompts/README.md`](./prompts/README.md)
- System prompt templates
- Prompt composition
- Testing strategies

### For QA Engineers
**Read**: [`testing/README.md`](./testing/README.md)
- Testing framework
- Fixtures and mocking
- LLM-as-a-judge evaluation
- Performance and regression tests

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: AGENTS (7)                       │
│  Research Analyst • Strategist • Audience Architect          │
│  Creative Director • Campaign Engineer • Performance Analyst │
│  Project Coordinator                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ use
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   LAYER 2: SKILLS (40+)                      │
│  Platform (12) • Marketing (10) • Vertical (18+)             │
│  Distributed via connectors marketplace                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ leverage
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                LAYER 3: INFRASTRUCTURE                       │
│  Bird APIs • Connectors Registry • S3 • ACP                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Key Decisions

### ✅ Multi-Agent Team (7 Agents)
Each agent has a specific role and clear deliverables mapped to project lifecycle phases.

### ✅ Skills via Connectors
Skills distributed through existing `apps/connectors` marketplace infrastructure - no new system needed.

### ✅ Workspace-Level Skills
Skills enabled per-project based on business type (B2B, E-commerce, SaaS, etc.)

### ✅ Complete Lifecycle
Covers Ideation → Planning → Implementation → Operation → Learning

### ✅ Human-in-the-Loop
Project Coordinator manages approvals at key gates

---

## 🎯 Implementation Timeline

- **Week 1-2**: Core infrastructure (skills in connectors)
- **Week 3**: Platform skills (12)
- **Week 4-5**: Core agents (3)
- **Week 6-7**: Execution agents (3)
- **Week 8**: Analysis agent (1)
- **Week 9**: Marketing skills (10)
- **Week 10-11**: Vertical skills (18+)
- **Week 12**: UI & marketplace

**Total: 12 weeks**

---

## 📊 Success Metrics

- Agent response time < 30s
- Output accuracy 95%+
- Campaign quality meets benchmarks
- User satisfaction (clarity, options, control)

---

## 🔗 External References

- [Bird Platform Documentation](https://bird.com/docs)
- [Connectors System](../../apps/connectors)
- [Agent Client Protocol](https://agentclientprotocol.com)
- [Anthropic Skills Spec](https://github.com/VoltAgent/awesome-claude-skills)

---

## 📝 Document Status

| Document | Status | Purpose |
|----------|--------|---------|
| INDEX.md | ✅ Current | Entry point |
| ARCHITECTURE.md | ✅ Current | Complete architecture |
| agents/*.md | ✅ Current | Agent specifications |
| skills/*.md | ✅ Current | Skill specifications |
| implementation/*.md | ✅ Current | Implementation guides |

---

**Next Step**: Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for complete system overview.
