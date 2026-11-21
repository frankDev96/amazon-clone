# Amazon Clone — AI Development Harness v2

Standalone React Native repo. Cross-agent rules live in `AGENTS.md`. Product contract: `docs/PRD.md`.

## Start here

1. Read `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/QUALITY_GATES.md`.
2. Run `python3 tools/validate_harness.py`.
3. Run `python3 scripts/audit_repository.py` and review `docs/REPOSITORY_AUDIT.md`.
4. Run `./scripts/check.sh` before merging.
5. For visual work, follow `docs/VISUAL_FIDELITY.md` and `prompts/AUDIT_EXISTING_PROJECT.md`.

## Reference harness (sibling)

Patterns adapted from `../water-sort-brain-master/` (Godot): visual compare tooling, audit discipline, evidence reporting. Do not modify the Godot repo from this project.

## PoC scope

- One Home screen (`home_feed_top`) with discovery quick-add.
- One shopping regression test: `e2e/shopping_quick_add.test.tsx`.
- Expand feed sections only after PoC gates pass with real command output.