---
artifact_type: agent_handover
track: "3"
track_name: "VSCode Extension"
date: 2025-12-06
---

# Agent Handover: Track 3 - VSCode Extension

## Your Mission

Add test infrastructure to enable autonomous iteration, fix bugs in the roundEditor, and add search integration with the daemon.

## Context

- **Workspace**: `/Users/sbellity/code/kinen/vscode-extension`
- **Dependencies**: Track 1A for search (can start tests immediately)
- **Special**: This track is designed for **autonomous agent testing**

## What Already Exists (70% complete)

| Feature | Status |
|---------|--------|
| Session Explorer | ✅ Working |
| Round Editor | ⚠️ Buggy - needs fixes |
| Decision Tracker | ✅ Working |
| Artifacts Tree | ✅ Working |
| Status Bar | ✅ Working |
| Round Parser | ✅ Working |
| **Tests** | ❌ Missing |
| **Search** | ❌ Missing |

## Phase 1: Test Infrastructure (START HERE)

### What You'll Build

```
vscode-extension/
├── test/
│   ├── unit/
│   │   ├── roundParser.test.ts
│   │   └── sessions.test.ts
│   ├── integration/
│   │   ├── extension.test.ts
│   │   └── roundEditor.test.ts
│   ├── webview/
│   │   └── App.test.tsx
│   └── fixtures/
│       ├── valid-round.md
│       └── malformed-round.md
├── vitest.config.ts
├── .vscode-test.mjs
└── package.json (update scripts)
```

### Package.json Updates

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run test/unit",
    "test:integration": "vscode-test",
    "test:webview": "vitest run test/webview --environment jsdom"
  },
  "devDependencies": {
    "@vscode/test-electron": "^2.3.8",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `3.0` | Test infrastructure | vitest + vscode-test + fixtures, `npm test` passes |
| `3.0.1` | Fix roundEditor bugs | Editor opens, questions display, answers save |
| `3.1` | DaemonClient | HTTP client for VSCode |
| `3.2` | Search command | Cmd+Shift+K opens search |
| `3.3` | Backlinks view | Tree provider for backlinks |
| `3.4` | Status bar updates | Show index status |

## Autonomous Testing Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Agent Working on Track 3                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Make code change                                        │
│          │                                                  │
│          ▼                                                  │
│  2. npm run build                                           │
│          │                                                  │
│          ├── Error? → Read error, fix, goto 1              │
│          │                                                  │
│          ▼                                                  │
│  3. npm run test:unit                                       │
│          │                                                  │
│          ├── Fail? → Read failure, fix, goto 1             │
│          │                                                  │
│          ▼                                                  │
│  4. npm run test:integration (headless VSCode)              │
│          │                                                  │
│          ├── Fail? → Read failure, fix, goto 1             │
│          │                                                  │
│          ▼                                                  │
│  5. All pass? → Task complete ✅                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Test Examples

### Unit Test for Parser

```typescript
// test/unit/roundParser.test.ts
import { describe, it, expect } from 'vitest';
import { parseRound } from '../../src/parsers/roundParser';

describe('parseRound', () => {
  it('extracts questions from round', () => {
    const content = `---
artifact_type: round
---
# Round 1

### Q1.1: First Question

Context here.

> [!note] Answer
> My answer
`;
    const parsed = parseRound(content);
    expect(parsed.questions).toHaveLength(1);
    expect(parsed.questions[0].id).toBe('Q1.1');
    expect(parsed.questions[0].answer).toBe('My answer');
  });
});
```

### Integration Test for RoundEditor

```typescript
// test/integration/roundEditor.test.ts
import * as vscode from 'vscode';
import * as assert from 'assert';

suite('RoundEditor', () => {
  test('opens round file', async () => {
    const uri = vscode.Uri.file('/path/to/test-round.md');
    await vscode.commands.executeCommand('vscode.openWith', uri, 'kinen.roundEditor');
    
    // Verify webview was created (no crash)
    assert.ok(true);
  });
});
```

## Success Criteria

```bash
# All commands must succeed
cd vscode-extension
npm run build          # Exit 0
npm run test:unit      # Exit 0
npm run test:integration  # Exit 0
npx vsce package       # Creates .vsix

# Parser test against real files
node -e "
const fs = require('fs');
const {parseRound} = require('./dist/parsers/roundParser');
const content = fs.readFileSync('../sessions/20251206-01-kinen-beads-devx/rounds/01-foundation.md', 'utf8');
const parsed = parseRound(content);
console.log('Questions:', parsed.questions.length);
console.log('Decisions:', parsed.decisions.length);
"
# Should output question/decision counts
```

## Phase 2: Search Integration (After Track 1A ready)

### DaemonClient for VSCode

```typescript
// src/lib/daemonClient.ts
export class DaemonClient {
  async search(query: string): Promise<SearchResult[]> {
    const res = await fetch('http://localhost:7319/api/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, space: getSpacePath() }),
    });
    const data = await res.json();
    return data.results;
  }
}
```

### Search Command

```typescript
// Add to extension.ts
vscode.commands.registerCommand('kinen.search', async () => {
  const query = await vscode.window.showInputBox({
    prompt: 'Search kinen sessions',
  });
  if (!query) return;
  
  const client = new DaemonClient();
  const results = await client.search(query);
  
  const items = results.map(r => ({
    label: r.path.split('/').pop(),
    detail: r.content.slice(0, 100),
  }));
  
  const selected = await vscode.window.showQuickPick(items);
  // Open selected file...
});
```

## Notes

- Focus on test infrastructure first (3.0)
- Once tests exist, iterate autonomously on bugs (3.0.1)
- Search features (3.1-3.4) depend on daemon being ready
- Use `xvfb-run` on Linux for headless VSCode testing

Good luck! 🚀

