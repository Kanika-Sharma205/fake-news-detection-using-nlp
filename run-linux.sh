#!/usr/bin/env bash
# FakeGuard AI — Start backend + frontend together (Linux / macOS)
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colours ───────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

echo ""
echo -e "${BOLD}  ┌──────────────────────────────────────┐${RESET}"
echo -e "${BOLD}  │       FakeGuard AI — Starting Up     │${RESET}"
echo -e "${BOLD}  └──────────────────────────────────────┘${RESET}"
echo ""

# ── Locate virtual environment ────────────────────────────
if   [ -d "$ROOT/backend/venv" ];         then VENV="$ROOT/backend/venv"
elif [ -d "$ROOT/venv" ];                 then VENV="$ROOT/venv"
elif [ -d "$HOME/ml_env" ];              then VENV="$HOME/ml_env"
else
  echo -e "${RED}  ERROR: No virtual environment found.${RESET}"
  echo "  Create one with:"
  echo "    python3 -m venv venv"
  echo "    source venv/bin/activate"
  echo "    pip install -r backend/requirements.txt"
  echo ""
  exit 1
fi

# ── Locate npm (handles nvm installs not on PATH) ─────────
if ! command -v npm &>/dev/null; then
  for NVM_NODE in "$HOME/.nvm/versions/node"/*/bin; do
    [ -x "$NVM_NODE/npm" ] && export PATH="$NVM_NODE:$PATH" && break
  done
fi
if ! command -v npm &>/dev/null; then
  echo -e "${RED}  ERROR: npm not found. Install Node.js (v18+) from https://nodejs.org${RESET}"
  echo ""
  exit 1
fi

# ── Install frontend deps if needed ──────────────────────
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo -e "${CYAN}  Installing frontend dependencies...${RESET}"
  (cd "$ROOT/frontend" && npm install --silent)
fi

# ── Start backend in background ───────────────────────────
echo -e "${GREEN}  [1/2] Starting backend  → http://localhost:8000${RESET}"
echo -e "        Virtual env : $VENV"
echo ""

source "$VENV/bin/activate"
(
  cd "$ROOT/backend"
  uvicorn app.main:app --host 0.0.0.0 --port 8000 2>&1 \
    | sed "s/^/  ${YELLOW}[backend]${RESET} /"
) &
BACKEND_PID=$!

# ── Trap Ctrl+C — kill both processes cleanly ─────────────
cleanup() {
  echo ""
  echo -e "${CYAN}  Shutting down...${RESET}"
  kill "$BACKEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" 2>/dev/null || true
  echo -e "${GREEN}  Done.${RESET}"
  exit 0
}
trap cleanup INT TERM

# Give backend a moment to bind before printing frontend URL
sleep 1

# ── Start frontend in foreground ──────────────────────────
echo -e "${GREEN}  [2/2] Starting frontend → http://localhost:5173${RESET}"
echo ""
echo -e "  ${BOLD}Both servers are running. Press Ctrl+C to stop all.${RESET}"
echo ""

(
  cd "$ROOT/frontend"
  npm run dev 2>&1 | sed "s/^/  ${CYAN}[frontend]${RESET} /"
)

# If frontend exits on its own, also kill backend
cleanup
