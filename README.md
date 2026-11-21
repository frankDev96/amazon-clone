# Amazon Clone (ShopFeed PoC)

Android-first React Native app inspired by [docs/PRD.md](docs/PRD.md). Sibling to [water-sort-brain-master](../water-sort-brain-master/).

## Quick start

```bash
npm install
npm start
npm run android   # device/emulator
npm test
./scripts/check.sh
```

AI harness: [README_AI_HARNESS.md](README_AI_HARNESS.md)

## PoC delivered

- Home shell: sticky search, product grid, orange discovery feed with quick-add
- Six-tab navigation (non-Home tabs are placeholders)
- Redux cart + mock `cartApi` with 503 failure mode
- Visual capture script for `home_feed_top` (requires reference PNG + device)
- Regression: `e2e/shopping_quick_add.test.tsx`