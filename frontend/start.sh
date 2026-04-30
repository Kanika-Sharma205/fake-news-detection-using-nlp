#!/usr/bin/env bash
# FakeGuard AI — Frontend startup (Linux / macOS)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Resolve Node / npm ─────────────────────────────────────
# Support nvm installations that aren't on PATH yet
if ! command -v npm &>/dev/null; then
  # Try common nvm locations
  for NVM_NODE in \
      "$HOME/.nvm/versions/node"/*/bin \
      "$NVM_DIR/versions/node"/*/bin; do
    if [ -x "$NVM_NODE/npm" ]; then
      export PATH="$NVM_NODE:$PATH"
      break
    fi
  done
fi

if ! command -v npm &>/dev/null; then
  echo ""
  echo "ERROR: npm not found. Install Node.js (v18+) from https://nodejs.org"
  echo ""
  exit 1
fi

cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo ""
echo "  FakeGuard AI — Frontend"
echo "  Node : $(node --version)   npm : $(npm --version)"
echo "  URL  : http://localhost:5173"
echo ""

npm run dev
