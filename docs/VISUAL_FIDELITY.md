# Visual fidelity (React Native / Android)

Reference: `docs/screen_images/home_feed_top.png` (user-uploaded). Config: `data/visual/visual_tests.json`.

## Capture

```bash
python3 -m venv .venv-visual && .venv-visual/bin/pip install -r requirements-visual-tests.txt
./scripts/visual_capture_android.sh --serial <id> --screen home_feed_top
```

Deterministic launch extras: `visualTest=true`, `visualScreen=home_feed_top`. App logs `VISUAL_TEST_READY screen=home_feed_top` to logcat.

## Compare

Uses `tools/visual_compare.py` (vendored from Water Sort). Outputs under `builds/visual_fidelity/home_feed_top/<run>/`.

Do not weaken `ssim_min` or other thresholds without human approval. Missing reference ⇒ skip device compare locally; CI fails when `REQUIRE_VISUAL_REFERENCE=1`.