#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURSOR_DIR="${HOME}/.cursor"
CLAUDE_DIR="${HOME}/.claude"

mkdir -p "${CURSOR_DIR}" "${CLAUDE_DIR}"

if [ -e "${CURSOR_DIR}/hooks.json" ] && [ ! -L "${CURSOR_DIR}/hooks.json" ]; then
  cp "${CURSOR_DIR}/hooks.json" "${CURSOR_DIR}/hooks.json.bak.$(date -u +%Y%m%d_%H%M%SZ)"
fi
if [ -e "${CLAUDE_DIR}/settings.json" ] && [ ! -L "${CLAUDE_DIR}/settings.json" ]; then
  cp "${CLAUDE_DIR}/settings.json" "${CLAUDE_DIR}/settings.json.bak.$(date -u +%Y%m%d_%H%M%SZ)"
fi

ln -sfn "${ROOT_DIR}/.cursor/hooks.json" "${CURSOR_DIR}/hooks.json"
ln -sfn "${ROOT_DIR}/.claude/settings.json" "${CLAUDE_DIR}/settings.json"

echo "WhytCard hooks linked globally."
