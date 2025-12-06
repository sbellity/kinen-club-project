---
artifact_type: agent_handover
track: "2"
track_name: "TypeScript CLI + MCP"
date: 2025-12-06
---

# Agent Handover: Track 2 - TypeScript CLI + MCP

## Your Mission

Update the existing kinen TypeScript CLI and MCP server to talk to the Go daemon via HTTP instead of doing everything locally.

## Context

- **Workspace**: `/Users/sbellity/code/kinen/kinen` (TypeScript package)
- **Dependencies**: Track 1A (HTTP API must exist)
- **Can start**: Design and DaemonClient with mocks

## What Already Exists

```
kinen/
├── src/
│   ├── index.ts           # CLI entry
│   ├── mcp.ts             # MCP server
│   ├── commands/
│   │   ├── session.ts     # Session management
│   │   ├── space.ts       # Space management
│   │   └── ...
│   └── lib/
│       ├── sessions.ts    # Session operations
│       ├── spaces.ts      # Space operations
│       └── config.ts      # Config loading
└── package.json
```

## What You'll Build

```
kinen/
└── src/
    ├── lib/
    │   └── daemon-client.ts  # NEW: HTTP client
    ├── commands/
    │   ├── search.ts         # NEW: Search command
    │   ├── backlinks.ts      # NEW: Backlinks command
    │   └── index.ts          # NEW: Index commands
    └── mcp.ts                # UPDATE: Use daemon
```

## DaemonClient Interface

```typescript
// src/lib/daemon-client.ts
export interface SearchResult {
  path: string;
  content: string;
  score: number;
  type: string;
  session: string;
  metadata: Record<string, unknown>;
}

export interface IndexStatus {
  space: string;
  chunks: number;
  edges: number;
  lastIndexed: string;
  staleFiles: string[];
}

export class DaemonClient {
  private baseUrl: string;
  
  constructor(baseUrl = 'http://localhost:7319') {
    this.baseUrl = baseUrl;
  }

  async health(): Promise<{ status: string; version: string }> {
    const res = await fetch(`${this.baseUrl}/api/v1/health`);
    if (!res.ok) throw new Error('Daemon unavailable');
    return res.json();
  }

  async search(query: string, space: string, options?: {
    limit?: number;
    filters?: Record<string, unknown>;
  }): Promise<SearchResult[]> {
    const res = await fetch(`${this.baseUrl}/api/v1/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, space, ...options }),
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();
    return data.results;
  }

  async buildIndex(space: string, force = false): Promise<{
    status: string;
    chunks: number;
    durationMs: number;
  }> {
    const res = await fetch(`${this.baseUrl}/api/v1/index/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ space, force }),
    });
    return res.json();
  }

  async indexStatus(space: string): Promise<IndexStatus> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/index/status?space=${encodeURIComponent(space)}`
    );
    return res.json();
  }

  async backlinks(path: string): Promise<{
    path: string;
    backlinks: Array<{ from: string; context: string }>;
  }> {
    const res = await fetch(
      `${this.baseUrl}/api/v1/backlinks?path=${encodeURIComponent(path)}`
    );
    return res.json();
  }

  async consolidate(session: string, dryRun = false): Promise<{
    decisions: Array<{ id: string; text: string; confidence: number }>;
  }> {
    const res = await fetch(`${this.baseUrl}/api/v1/memory/consolidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session, dry_run: dryRun }),
    });
    return res.json();
  }
}
```

## Auto-Start Daemon

```typescript
// src/lib/daemon-client.ts
import { spawn } from 'child_process';

async function ensureDaemon(client: DaemonClient): Promise<void> {
  try {
    await client.health();
    return; // Already running
  } catch {
    console.log('Starting kinen daemon...');
    spawn('kinen-daemon', [], {
      detached: true,
      stdio: 'ignore',
    }).unref();
    
    // Wait for daemon to start
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 100));
      try {
        await client.health();
        return;
      } catch {}
    }
    throw new Error('Failed to start daemon');
  }
}
```

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `2.1` | DaemonClient class | All API methods, error handling |
| `2.2` | `kinen search` command | `kinen search "query" --json` |
| `2.3` | `kinen backlinks` command | `kinen backlinks path/to/file.md` |
| `2.4` | `kinen index` commands | `kinen index build`, `kinen index status` |
| `2.5` | MCP tools update | `kinen_search`, `kinen_backlinks` use daemon |
| `2.6` | Auto-start daemon | Start daemon if not running |

## CLI Commands

```bash
# Search
kinen search "authentication design"
kinen search "auth" --limit 5 --json

# Backlinks
kinen backlinks sessions/20251206-01/rounds/01.md

# Index
kinen index build
kinen index build --force
kinen index status
```

## MCP Tools Update

```typescript
// src/mcp.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const client = new DaemonClient();
  await ensureDaemon(client);
  
  switch (request.params.name) {
    case 'kinen_search': {
      const { query, limit } = request.params.arguments;
      const space = await getCurrentSpacePath();
      const results = await client.search(query, space, { limit });
      return { content: [{ type: 'text', text: JSON.stringify(results) }] };
    }
    // ... other tools
  }
});
```

## Success Criteria

```bash
# CLI works
kinen search "LanceDB" --json | jq '.results[0].path'
# → Returns path

# MCP works (test via Cursor)
# kinen_search tool returns results

# Auto-start works
pkill kinen-daemon
kinen search "test"  # Should auto-start daemon
```

## Notes

- Use native `fetch` (Node 18+)
- JSON output for `--json` flag
- Pretty output for human consumption
- Error messages should be helpful

Good luck! 🚀

