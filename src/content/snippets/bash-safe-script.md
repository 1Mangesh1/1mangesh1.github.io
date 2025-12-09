---
title: "Safe Bash Script Template"
description: "Bash script template with error handling and best practices"
language: "bash"
tags: ["shell", "devops", "template"]
date: 2025-12-03T00:00:00Z
---

A robust template for bash scripts with proper error handling.

```bash
#!/usr/bin/env bash

# Exit on error, undefined vars, and pipe failures
set -euo pipefail

# Enable debug mode with DEBUG=1
[[ "${DEBUG:-0}" == "1" ]] && set -x

# Script directory (works even with symlinks)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cleanup function
cleanup() {
  local exit_code=$?
  # Add cleanup tasks here (remove temp files, etc.)
  echo "Cleaning up..."
  exit $exit_code
}
trap cleanup EXIT

# Logging functions
log_info() { echo "[INFO] $*"; }
log_warn() { echo "[WARN] $*" >&2; }
log_error() { echo "[ERROR] $*" >&2; }

# Check required commands
require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    log_error "Required command not found: $1"
    exit 1
  }
}

# Main function
main() {
  require_cmd curl
  require_cmd jq

  log_info "Starting script..."

  # Your code here

  log_info "Done!"
}

# Run main
main "$@"
```

## Key Features

- `set -euo pipefail` - Strict mode
- Trap for cleanup on exit
- Colored logging functions
- Command existence checking
- Debug mode with `DEBUG=1 ./script.sh`
