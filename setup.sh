#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CURSOR_DIR="${HOME}/.cursor"
CLAUDE_DIR="${HOME}/.claude"

mkdir -p "${CURSOR_DIR}" "${CLAUDE_DIR}"

ln -sfn "${ROOT_DIR}/.cursor/hooks.json" "${CURSOR_DIR}/hooks.json"
ln -sfn "${ROOT_DIR}/.claude/settings.json" "${CLAUDE_DIR}/settings.json"

echo "WhytCard hooks linked globally."
