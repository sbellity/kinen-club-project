# Round 01: Foundation — Kinen Mobile Exploration

**Date**: 2025-12-15
**Session Type**: Architecture
**Status**: ✅ Complete

---

## Context

Kinen currently operates as:
- **Filesystem-based**: Sessions stored as markdown in Obsidian vault (iCloud-synced)
- **MCP server**: Go runtime serving tools to IDE (Cursor/Claude)
- **AI-assisted**: Structured thinking through LLM conversation

The desire: Use kinen on-the-go from a mobile phone.

---

## Key Questions Explored

### Q1: What does "mobile kinen" mean?

**Options explored:**
- A. Full session capability (desktop parity)
- B. Capture-first mode (voice/quick notes → later processing)
- C. Review and reference only
- D. Lightweight exploration

**Insight**: The core gap isn't markdown editing — it's **interactive AI thinking partner**. Obsidian mobile gives files but not the conversation.

---

### Q2: Existing infrastructure?

**Explored:**
- Email-based architecture (kinen.club) — GitHub Actions + Aider
- Analysis: Overengineered for personal use, designed for multi-tenant SaaS
- Latency: Minutes (GitHub Actions), not suitable for interactive sessions

---

### Q3: Platform options evaluated

| Option | Latency | Connectivity | Effort |
|--------|---------|--------------|--------|
| Gemini Gems | Seconds | ❌ Disconnected | 30 min |
| ChatGPT GPT + Actions | Seconds | ✅ Full | 4-8 hours |
| Telegram Bot | Seconds | ✅ Full | 4-8 hours |
| Obsidian Plugin | Seconds | ✅ Full | 2-3 days |
| Web UI | Seconds | ✅ Full | 2-3 days |

**Key finding**: Gemini Gems cannot call external APIs. ChatGPT Actions can.

---

### Q4: Telegram vs Obsidian Plugin?

**Challenge raised**: Kinen methodology isn't chat — it's structured artifacts, living documents, options side-by-side.

**Telegram strengths:**
- Native voice memos
- Push notifications
- Quick capture, low friction
- Go codebase (matches kinen-go)

**Obsidian Plugin strengths:**
- Native artifact experience
- Full document view
- Desktop/mobile parity
- No external infrastructure

---

## Decision: Hybrid Architecture

**Both Telegram AND Obsidian Plugin**, serving different use cases:

```
Telegram Bot              Obsidian Plugin
     │                          │
     │ Quick capture,           │ Full sessions,
     │ voice input,             │ artifact reading,
     │ notifications            │ structured rounds
     │                          │
     └──────────┬───────────────┘
                │
           kinen-go
         (shared backend)
```

### Use Case Mapping

| Scenario | Channel |
|----------|---------|
| "5 min to capture a thought" | Telegram (voice) |
| "20 min for a real round" | Obsidian plugin |
| "Review yesterday's decisions" | Obsidian (native) |
| "Notification: round ready" | Telegram push |

---

## Next Steps

1. **Round 02**: Telegram bot architecture deep-dive
2. **Round 03**: Obsidian plugin feasibility + design
3. **MVP Plan**: Which to build first?

---

## Participants
- Human: Exploring mobile kinen options
- AI: Thinking partner, challenging assumptions
