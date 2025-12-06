---
artifact_type: agent_handover
track: "5"
track_name: "Distribution"
date: 2025-12-06
epic_id: kinen-08r
---

# Agent Handover: Track 5 - Distribution

> [!warning] MANDATORY: Beads Status Updates
> **You MUST update beads** — chat is NOT a communication channel!
> 
> 1. **Start**: `bd update kinen-08r --status in_progress --notes "Starting Track 5"`
> 2. **Every 30-60 min**: `bd update TASK_ID --notes "Progress: [status]"`
> 3. **When blocked**: `bd create "BLOCKED [5]: [issue]" -t task -p 0 --assignee coordinator \
  --deps discovered-from:kinen-08r`
> 4. **Before ending**: Update ALL tasks with current status
> 
> **See `collaboration.md` for full protocol.**

## Your Mission

Package the kinen-daemon for easy distribution via Homebrew and as a Mac app.

## Context

- **Workspace**: `/Users/sbellity/code/p/kinen-go`
- **Dependencies**: Track 1A-1F complete (daemon binary exists)
- **Start**: After daemon is functional

## What You'll Build

1. Cross-platform build scripts
2. Homebrew formula
3. launchd service integration
4. Release automation
5. (Optional) Mac menu bar app

## Cross-Platform Builds

### Makefile

```makefile
# Makefile
VERSION := $(shell git describe --tags --always)
LDFLAGS := -ldflags "-X main.Version=$(VERSION)"

.PHONY: build-all
build-all: build-darwin-arm64 build-darwin-amd64 build-linux-amd64

build-darwin-arm64:
	GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -o dist/kinen-daemon-darwin-arm64 ./cmd/kinen-daemon

build-darwin-amd64:
	GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o dist/kinen-daemon-darwin-amd64 ./cmd/kinen-daemon

build-linux-amd64:
	GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o dist/kinen-daemon-linux-amd64 ./cmd/kinen-daemon

.PHONY: package
package: build-all
	cd dist && tar -czf kinen-daemon-darwin-arm64.tar.gz kinen-daemon-darwin-arm64
	cd dist && tar -czf kinen-daemon-darwin-amd64.tar.gz kinen-daemon-darwin-amd64
	cd dist && tar -czf kinen-daemon-linux-amd64.tar.gz kinen-daemon-linux-amd64
	cd dist && shasum -a 256 *.tar.gz > checksums.txt
```

## Homebrew Formula

### Formula (`homebrew-kinen/Formula/kinen-daemon.rb`)

```ruby
class KinenDaemon < Formula
  desc "Background daemon for kinen semantic search and memory consolidation"
  homepage "https://kinen.club"
  version "0.1.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-darwin-arm64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    else
      url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-darwin-amd64.tar.gz"
      sha256 "REPLACE_WITH_ACTUAL_SHA256"
    end
  end

  on_linux do
    url "https://github.com/sbellity/kinen/releases/download/v#{version}/kinen-daemon-linux-amd64.tar.gz"
    sha256 "REPLACE_WITH_ACTUAL_SHA256"
  end

  def install
    bin.install "kinen-daemon"
  end

  def post_install
    (var/"log/kinen").mkpath
    (etc/"kinen").mkpath
  end

  service do
    run [opt_bin/"kinen-daemon"]
    keep_alive true
    log_path var/"log/kinen/daemon.log"
    error_log_path var/"log/kinen/daemon.log"
    working_dir var
  end

  test do
    assert_match "kinen-daemon", shell_output("#{bin}/kinen-daemon --version")
  end
end
```

### Create Tap Repository

```bash
# Create repo: homebrew-kinen
mkdir homebrew-kinen
cd homebrew-kinen
mkdir Formula
# Add formula file
git init
git add .
git commit -m "Initial formula"
git remote add origin git@github.com:sbellity/homebrew-kinen.git
git push -u origin main
```

### Usage

```bash
# Add tap
brew tap sbellity/kinen

# Install
brew install kinen-daemon

# Start service
brew services start kinen-daemon

# Check status
brew services list | grep kinen
```

## launchd Integration

The Homebrew service block handles this, but manual plist:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>club.kinen.daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/kinen-daemon</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/opt/homebrew/var/log/kinen/daemon.log</string>
    <key>StandardErrorPath</key>
    <string>/opt/homebrew/var/log/kinen/daemon.log</string>
</dict>
</plist>
```

## Release Automation

### GitHub Actions (`.github/workflows/release.yml`)

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'
      
      - name: Build binaries
        run: make build-all
      
      - name: Package
        run: make package
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/*.tar.gz
            dist/checksums.txt
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  update-homebrew:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Update Homebrew formula
        run: |
          # Calculate SHA256 and update formula
          # Push to homebrew-kinen repo
```

## Tasks

| Task | Description | Acceptance |
|------|-------------|------------|
| `5.1` | Cross-platform build script | darwin-arm64, darwin-amd64, linux-amd64 all build |
| `5.2` | Homebrew formula | `brew install` works |
| `5.3` | launchd service | `brew services start` works |
| `5.4` | Release automation | GitHub Actions creates releases |
| `5.5` | Mac menu bar app | Wails/Tauri app (P3, optional) |

## Success Criteria

```bash
# Build all platforms
make build-all
ls -la dist/
# → kinen-daemon-darwin-arm64 (< 50MB)
# → kinen-daemon-darwin-amd64 (< 50MB)
# → kinen-daemon-linux-amd64 (< 50MB)

# Test Homebrew locally
brew install --build-from-source ./Formula/kinen-daemon.rb

# Test service
brew services start kinen-daemon
curl http://localhost:7319/api/v1/health
# → {"status": "ok", ...}

# Test stop
brew services stop kinen-daemon
```

## Mac Menu Bar App (Optional - P3)

If time permits, create a Tauri or Wails app:

### Tauri Setup

```bash
npm create tauri-app@latest kinen-app -- --template vanilla-ts
cd kinen-app

# Add systray
cargo add tauri-plugin-system-tray
```

### Features

- Menu bar icon with status indicator
- Quick search popup (Cmd+Shift+K)
- Settings panel
- Auto-start on login

This is optional and lower priority than core distribution.

## Notes

- Binary should be statically linked (no external deps)
- Version from git tag
- SHA256 checksums required for Homebrew
- Test on both Intel and Apple Silicon Macs

## Questions & Blockers

**Use beads to communicate questions and blockers.** A coordinator will monitor and respond.

```bash
# When blocked
bd create "BLOCKED [5]: [describe issue]" -t task -p 0 \
  --assignee coordinator \
  --deps discovered-from:kinen-08r --notes "Context: [details]"

# When you have a question
bd create "QUESTION [5]: [your question]" -t task -p 1 \
  --assignee coordinator \
  --deps discovered-from:kinen-08r --notes "Options: [A, B, C]"
```

**Full protocol**: See `collaboration.md` in this directory.

Good luck! 🚀

