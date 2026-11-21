# Amazon Clone — agent rules

Android-first React Native + TypeScript shopping app. Offline-first fixtures; mock cart API until M4/M5.

## Layout

```
amazon-clone/
├── src/features/     # home, cart, product screens
├── src/components/   # reusable UI (search, cards, quick-add)
├── src/api/          # cart client (mock); no UI imports
├── src/store/        # Redux cart truth
├── fixtures/         # deterministic JSON
├── e2e/              # shopping regression (Jest + RNTL)
├── scripts/          # check.sh, audit, visual capture
├── tools/            # validate_harness, visual_compare
├── data/visual/      # screen fixtures + thresholds
└── docs/             # PRD, fidelity, audit output
```

## Rules

- Preserve working navigation, cart state, and fixture-driven Home feed.
- Quick-add validates server-side via mock `cartApi`; UI never invents prices.
- Voice/camera/scanner/Rufus tabs stay labeled placeholders until integrated.
- Visual changes: capture Android screenshot, compare to `docs/screen_images/`; one region fix per attempt.
- Do not mark checks passed without running them.
- Do not weaken visual thresholds to force pass.

## Commands

| Job | Command |
| --- | --- |
| Gate | `./scripts/check.sh` |
| Harness docs | `python3 tools/validate_harness.py` |
| Audit | `python3 scripts/audit_repository.py` |
| Tests | `npm test` |
| Android debug | `npm run android` |
| Visual capture | `./scripts/visual_capture_android.sh --screen home_feed_top` |