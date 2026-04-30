#!/usr/bin/env bash
# FakeGuard AI — Backend startup (Linux / macOS)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ── Locate virtual environment ─────────────────────────────
# Priority: ./venv → ../venv → ~/ml_env
if [ -d "$SCRIPT_DIR/venv" ]; then
  VENV="$SCRIPT_DIR/venv"
elif [ -d "$PROJECT_ROOT/venv" ]; then
  VENV="$PROJECT_ROOT/venv"
elif [ -d "$HOME/ml_env" ]; then
  VENV="$HOME/ml_env"
else
  echo ""
  echo "ERROR: No virtual environment found."
  echo "Create one with:"
  echo "  python3 -m venv venv"
  echo "  source venv/bin/activate"
  echo "  pip install -r backend/requirements.txt"
  echo ""
  exit 1
fi

source "$VENV/bin/activate"

echo ""
echo "  FakeGuard AI — Backend"
echo "  Virtual env : $VENV"
echo "  URL         : http://localhost:8000"
echo "  API docs    : http://localhost:8000/docs"
echo ""
echo "  NOTE: First startup loads a 112 MB knowledge graph (~30 s)"
echo ""

cd "$SCRIPT_DIR"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
