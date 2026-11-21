#!/usr/bin/env python3
"""Evidence-based repository audit for Amazon Clone (RN)."""
from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "REPOSITORY_AUDIT.md"

CHECKS: list[tuple[str, Path]] = [
    ("Home screen", ROOT / "src/features/home/HomeScreen.tsx"),
    ("Discovery section", ROOT / "src/features/home/DiscoveryFeedSection.tsx"),
    ("Discovery product card", ROOT / "src/components/DiscoveryProductCard.tsx"),
    ("Quick add control", ROOT / "src/components/QuickAddButton.tsx"),
    ("Cart screen", ROOT / "src/features/cart/CartScreen.tsx"),
    ("Cart API mock", ROOT / "src/api/cartApi.ts"),
    ("Redux cart slice", ROOT / "src/store/cartSlice.ts"),
    ("Root navigation", ROOT / "src/navigation/RootNavigator.tsx"),
    ("Home fixtures", ROOT / "fixtures/home_feed.json"),
    ("Visual config", ROOT / "data/visual/visual_tests.json"),
    ("Visual capture script", ROOT / "scripts/visual_capture_android.sh"),
    ("Check gate", ROOT / "scripts/check.sh"),
    ("Shopping regression test", ROOT / "e2e/shopping_quick_add.test.tsx"),
]


@dataclass
class Row:
    feature: str
    status: str
    evidence: str
    notes: str = ""


def audit() -> list[Row]:
    rows: list[Row] = []
    for feature, path in CHECKS:
        if path.is_file():
            rows.append(Row(feature, "implemented", str(path.relative_to(ROOT))))
        else:
            rows.append(Row(feature, "missing", str(path.relative_to(ROOT)), "Not found"))
    return rows


def render(rows: list[Row]) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "# Repository audit",
        "",
        f"Generated: {ts}",
        f"Root: `{ROOT}`",
        "",
        "## Feature evidence",
        "",
        "| Feature | Status | Evidence | Notes |",
        "| --- | --- | --- | --- |",
    ]
    for row in rows:
        lines.append(
            f"| {row.feature} | {row.status} | `{row.evidence}` | {row.notes} |"
        )
    missing = [r for r in rows if r.status != "implemented"]
    lines.extend(
        [
            "",
            "## Summary",
            "",
            f"- Implemented checks: {len(rows) - len(missing)} / {len(rows)}",
            f"- Missing: {len(missing)}",
            "",
            "## Gaps (PoC scope)",
            "",
            "- Full 29 Home section families not yet implemented.",
            "- Reference PNG `docs/screen_images/home_feed_top.png` pending upload.",
            "- Detox device E2E optional; Jest integration regression covers cart logic.",
            "- Backend catalog/checkout not integrated (mock cart API only).",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    rows = audit()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(render(rows), encoding="utf-8")
    print(f"Wrote {OUTPUT}")
    missing = [r for r in rows if r.status != "implemented"]
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())