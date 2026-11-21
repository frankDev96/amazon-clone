# Home feed reference screenshots

Place approved Android Home-feed PNGs here. PoC visual gate uses **`home_feed_top.png`** (top scroll position).

Until user-supplied references from the PRD evidence pack are added, `scripts/check.sh` skips the visual **pass** requirement locally when the reference file is missing. CI sets `REQUIRE_VISUAL_REFERENCE=1` once `home_feed_top.png` exists.