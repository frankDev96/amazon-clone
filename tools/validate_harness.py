#!/usr/bin/env python3
"""Validate Amazon Clone AI harness documentation."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README_AI_HARNESS.md",
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    "docs/PRD.md",
    "docs/QUALITY_GATES.md",
    "docs/VISUAL_FIDELITY.md",
    "docs/PROJECT_CONTEXT.md",
    "prompts/AUDIT_EXISTING_PROJECT.md",
    "scripts/audit_repository.py",
    "scripts/check.sh",
    "scripts/visual_capture_android.sh",
    "data/visual/visual_tests.json",
    "evidence/IMPLEMENTATION_REPORT.md",
]

failures: list[str] = []
for name in REQUIRED:
    path = ROOT / name
    if not path.is_file() or path.stat().st_size == 0:
        failures.append(f"Missing/empty: {name}")

for md in ROOT.rglob("*.md"):
    body = md.read_text(encoding="utf-8")
    for _label, target in re.findall(r"(?<!!)\[([^]\n]+)\]\(([^)]+)\)", body):
        target = target.split("#")[0].split("?")[0]
        if not target or "://" in target or target.startswith(("#", "mailto:")):
            continue
        if not (md.parent / target).exists():
            failures.append(f"Broken link in {md.relative_to(ROOT)}: {target}")

if failures:
    print("HARNESS CHECK FAILED")
    for item in failures:
        print(f"- {item}")
    sys.exit(1)

print(f"HARNESS CHECK PASSED ({len(REQUIRED)} required paths).")
sys.exit(0)