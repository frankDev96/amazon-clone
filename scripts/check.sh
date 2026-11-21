#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
failed=0

log() { echo "==> $*"; }

log "Harness documentation"
python3 tools/validate_harness.py || failed=1

log "Repository audit"
python3 scripts/audit_repository.py || failed=1

log "TypeScript (tsc)"
if npx tsc --noEmit -p tsconfig.json; then
  :
else
  failed=1
fi

log "ESLint"
npm run lint || failed=1

log "Unit and regression tests"
npm run test -- --runInBand || failed=1

log "Visual compare self-test"
if [[ -x .venv-visual/bin/python3 ]] || python3 -c "import cv2" 2>/dev/null; then
  PYTHON_BIN="${ROOT}/.venv-visual/bin/python3"
  [[ -x "$PYTHON_BIN" ]] || PYTHON_BIN="python3"
  "$PYTHON_BIN" tools/visual_compare.py --self-test || failed=1
else
  echo "Skip visual self-test (install requirements-visual-tests.txt)"
fi

REFERENCE="${ROOT}/docs/screen_images/home_feed_top.png"
if [[ -f "$REFERENCE" ]]; then
  log "Device visual capture"
  ./scripts/visual_capture_android.sh --screen home_feed_top || failed=1
elif [[ "${REQUIRE_VISUAL_REFERENCE:-0}" == "1" ]]; then
  echo "Missing required reference: $REFERENCE" >&2
  failed=1
else
  echo "Skip device visual capture (reference PNG not uploaded yet)."
fi

log "Android debug assemble"
if [[ -n "${ANDROID_HOME:-}" ]] && [[ -x android/gradlew ]]; then
  (cd android && ./gradlew assembleDebug) || failed=1
else
  echo "Skip assembleDebug (set ANDROID_HOME or run on CI with JDK)."
fi

exit "$failed"