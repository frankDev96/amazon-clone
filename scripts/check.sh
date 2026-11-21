#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
failed=0

PYTHON_BIN="${PYTHON_BIN:-}"
if [[ -z "$PYTHON_BIN" ]]; then
  if [[ -x /usr/bin/python3 ]]; then
    PYTHON_BIN=/usr/bin/python3
  else
    PYTHON_BIN="$(command -v python3)"
  fi
fi

log() { echo "==> $*"; }

log "Harness documentation"
"$PYTHON_BIN" tools/validate_harness.py || failed=1

log "Repository audit"
"$PYTHON_BIN" scripts/audit_repository.py || failed=1

log "TypeScript (tsc)"
npx tsc --noEmit -p tsconfig.json || failed=1

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
if [[ "${RUN_ANDROID_ASSEMBLE:-0}" == "1" ]] && [[ -x android/gradlew ]]; then
  (cd android && ./gradlew assembleDebug --no-daemon) || failed=1
else
  echo "Skip assembleDebug (set RUN_ANDROID_ASSEMBLE=1 locally; CI runs assemble in android-build job)."
fi

exit "$failed"