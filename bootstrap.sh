#!/usr/bin/env bash
# RHEA / JujuLabz single-command local install and launch
# Titan Universal AI LLC  :
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
mode="${1:-run}"
fail(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }
command -v node >/dev/null || fail 'Install Node.js 20 or newer.'
major="$(node -p 'process.versions.node.split(".")[0]')"
[ "$major" -ge 20 ] || fail 'Node.js 20 or newer required.'
for f in index.html api/rhea.js server.mjs package.json tests/integration.mjs tests/bridge.mjs; do [ -s "$f" ] || fail "Missing file: $f"; done
case "$mode" in
 doctor)
  node --check api/rhea.js && node --check server.mjs
  printf 'PASS doctor: Node %s, all required files present\n' "$(node -v)" ;;
 test)
  node --check api/rhea.js
  node --check server.mjs
  node --test tests/*.mjs ;;
 run|start)
  bash "$ROOT/bootstrap.sh" test
  printf 'Starting RHEA interface at http://127.0.0.1:%s\n' "${PORT:-4173}"
  exec node server.mjs ;;
 *) fail 'Usage: ./bootstrap.sh [doctor|test|run]' ;;
esac
