# Homebrew Tap for Kinen

This is a Homebrew tap for installing the kinen daemon.

## Installation

```bash
# Add the tap
brew tap sbellity/kinen

# Install kinen-daemon
brew install kinen-daemon

# Start the service
brew services start kinen-daemon

# Check status
brew services list | grep kinen
```

## Repository Structure

This repository follows the standard Homebrew tap structure:
- `Formula/` - Contains the formula files
- `README.md` - This file

## Formula

The `kinen-daemon` formula installs the kinen background daemon and sets up a launchd service for automatic startup.


