---
artifact_type: agent_handover
track: "1D"
track_name: "File Watcher + Delta Index"
date: 2025-12-06
---

# Agent Handover: Track 1D - File Watcher + Delta Index

## Your Mission

Watch the kinen space for file changes and incrementally update the index. Enable real-time indexing as users edit files.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go`
- **Target**: Create `internal/watcher/` package
- **Issue Tracking**: Use `bd` (beads)

## Dependencies

- **Requires**: Track 1C (Storage) and Track 1B (Parser) to be ready
- **Can start**: Design and scaffolding before deps ready

## What You'll Build

```
kinen-go/
└── internal/
    └── watcher/
        ├── watcher.go       # fsnotify wrapper
        ├── debouncer.go     # Debounce rapid changes
        ├── delta.go         # Track changed files
        └── worker.go        # Background indexing worker
```

## Interface

```go
package watcher

type Watcher interface {
    Start(ctx context.Context) error
    Stop() error
    GetStaleFiles() []string
}

type Config struct {
    SpacePath      string
    DebounceMs     int           // Default: 500
    IndexBuilder   index.Builder
    Storage        storage.Storage
    OnIndexUpdate  func(path string, err error)
}
```

## How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│                        File System                                │
│  sessions/20251206-01/rounds/03.md  [MODIFIED]                   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼ fsnotify event
┌──────────────────────────────────────────────────────────────────┐
│                        Debouncer                                  │
│  Wait 500ms for more changes to same file                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Delta Tracker                              │
│  Track: { "rounds/03.md": lastModified }                         │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Index Worker                               │
│  1. Delete old chunks for path                                   │
│  2. Parse file                                                   │
│  3. Insert new chunks                                            │
└──────────────────────────────────────────────────────────────────┘
```

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `1D.1` | fsnotify setup | Watch sessions/ recursively |
| `1D.2` | Debouncer | 500ms debounce, coalesce events |
| `1D.3` | Delta tracker | Track modified files, detect stale |
| `1D.4` | Index worker | Re-index changed files in background |

## Implementation

```go
// internal/watcher/watcher.go
package watcher

import (
    "github.com/fsnotify/fsnotify"
)

type FileWatcher struct {
    cfg      Config
    watcher  *fsnotify.Watcher
    pending  map[string]time.Time // debounce map
    mu       sync.Mutex
    stopCh   chan struct{}
}

func New(cfg Config) (*FileWatcher, error) {
    w, err := fsnotify.NewWatcher()
    if err != nil {
        return nil, err
    }
    
    fw := &FileWatcher{
        cfg:     cfg,
        watcher: w,
        pending: make(map[string]time.Time),
        stopCh:  make(chan struct{}),
    }
    
    // Add sessions directory recursively
    if err := fw.addRecursive(filepath.Join(cfg.SpacePath, "sessions")); err != nil {
        return nil, err
    }
    
    return fw, nil
}

func (fw *FileWatcher) Start(ctx context.Context) error {
    go fw.eventLoop(ctx)
    go fw.debounceLoop(ctx)
    return nil
}
```

## Debounce Logic

```go
func (fw *FileWatcher) debounceLoop(ctx context.Context) {
    ticker := time.NewTicker(100 * time.Millisecond)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-fw.stopCh:
            return
        case <-ticker.C:
            fw.processPending()
        }
    }
}

func (fw *FileWatcher) processPending() {
    fw.mu.Lock()
    defer fw.mu.Unlock()
    
    now := time.Now()
    threshold := time.Duration(fw.cfg.DebounceMs) * time.Millisecond
    
    for path, lastEvent := range fw.pending {
        if now.Sub(lastEvent) >= threshold {
            delete(fw.pending, path)
            go fw.reindexFile(path)
        }
    }
}
```

## Success Criteria

```bash
# Start daemon with watcher
kinen-daemon --watch

# Edit a file
echo "# Test" >> /path/to/sessions/test/rounds/01.md

# Within 1 second, index should update
curl http://localhost:7319/api/v1/index/status | jq '.stale_files'
# → [] (no stale files)

# Search should find new content
curl -X POST http://localhost:7319/api/v1/search \
  -d '{"query": "Test", "space": "..."}' | jq '.results'
```

## Test Commands

```bash
# Unit tests
go test ./internal/watcher/... -v

# Integration test with real filesystem
go test ./internal/watcher/... -tags=integration -v
```

## Notes

- Only watch `.md` files
- Ignore `.obsidian/`, `node_modules/`, `.git/`
- Log all index updates
- Handle file deletions (remove chunks)
- Handle file moves (delete old, index new)

Good luck! 🚀

