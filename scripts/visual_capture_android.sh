#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADB_BIN="${ADB_BIN:-adb}"
PACKAGE="${PACKAGE:-com.appworks.amazonclone}"
ACTIVITY="${ACTIVITY:-com.amazonclone.MainActivity}"
SCREEN="home_feed_top"
REFERENCE=""
OUTPUT_ROOT="${ROOT}/builds/visual_fidelity"
CONFIG="${ROOT}/data/visual/visual_tests.json"
SETTLE_SECONDS="2"
SERIAL=""

usage() {
  cat <<'EOF'
Usage: scripts/visual_capture_android.sh [options]

  --serial SERIAL       ADB device serial
  --screen NAME         Visual screen id (default: home_feed_top)
  --package PKG         Application id
  --reference PATH      Override reference image
  --output PATH         Output root
  --settle-seconds N    Wait after VISUAL_TEST_READY
EOF
}

while (($# > 0)); do
  case "$1" in
    --serial) SERIAL="$2"; shift 2 ;;
    --screen) SCREEN="$2"; shift 2 ;;
    --package) PACKAGE="$2"; shift 2 ;;
    --reference) REFERENCE="$2"; shift 2 ;;
    --output) OUTPUT_ROOT="$2"; shift 2 ;;
    --settle-seconds) SETTLE_SECONDS="$2"; shift 2 ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

command -v "$ADB_BIN" >/dev/null 2>&1 || { echo "ADB not found" >&2; exit 2; }
[[ -f "$CONFIG" ]] || { echo "Missing config: $CONFIG" >&2; exit 2; }

PYTHON_BIN="${PYTHON_BIN:-python3}"
if [[ -x "${ROOT}/.venv-visual/bin/python3" ]]; then
  PYTHON_BIN="${ROOT}/.venv-visual/bin/python3"
fi

if [[ -z "$REFERENCE" ]]; then
  REFERENCE="$("$PYTHON_BIN" - "$CONFIG" "$SCREEN" "$ROOT" <<'PY'
import json, sys
from pathlib import Path
config, screen, root = sys.argv[1:]
ref = json.loads(Path(config).read_text(encoding="utf-8"))["screens"][screen]["reference"]
print((Path(root) / ref).resolve())
PY
  )"
fi

if [[ ! -f "$REFERENCE" ]]; then
  echo "Reference not found: $REFERENCE (upload docs/screen_images/home_feed_top.png)" >&2
  exit 2
fi

adb_args=()
[[ -n "$SERIAL" ]] && adb_args+=("-s" "$SERIAL")
adb() { "$ADB_BIN" "${adb_args[@]}" "$@"; }

[[ "$(adb get-state 2>&1 || true)" == "device" ]] || {
  echo "No ADB device available" >&2
  exit 3
}

run_id="$(date -u +%Y%m%dT%H%M%SZ)"
run_dir="${OUTPUT_ROOT}/${SCREEN}/${run_id}"
mkdir -p "$run_dir"

adb shell am force-stop "$PACKAGE"
adb logcat -c
adb shell am start -n "${PACKAGE}/${ACTIVITY}" \
  --ez visualTest true \
  --es visualScreen "$SCREEN" >/dev/null

ready=0
for _ in $(seq 1 90); do
  if adb logcat -d -t 150 2>/dev/null | grep -q "VISUAL_TEST_READY screen=${SCREEN}"; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "$ready" != 1 ]]; then
  echo "App did not log VISUAL_TEST_READY for ${SCREEN}" >&2
  exit 4
fi

sleep "$SETTLE_SECONDS"
adb exec-out screencap -p >"${run_dir}/capture.png"

cat >"${run_dir}/node_map.json" <<'JSON'
{"viewport": [1080, 2400], "regions": []}
JSON

set +e
"$PYTHON_BIN" "${ROOT}/tools/visual_compare.py" \
  --reference "$REFERENCE" \
  --actual "${run_dir}/capture.png" \
  --config "$CONFIG" \
  --screen "$SCREEN" \
  --node-map "${run_dir}/node_map.json" \
  --output "$run_dir" >"${run_dir}/compare_stdout.log" 2>&1
compare_status=$?
set -e

[[ -f "${run_dir}/report.json" ]] || {
  echo "Comparator did not produce report.json" >&2
  exit "$compare_status"
}

echo "Visual report: ${run_dir}/report.json"
exit "$compare_status"