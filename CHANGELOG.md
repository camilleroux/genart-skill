# Changelog

## 0.1.0 — 2026-08-28

Initial release.

- **Skill `genart`** — default practices of long-form generative art (each with
  its legitimate counter-example), ethics, routing to reference sheets loaded
  on demand.
- **6 transverse sheets** — determinism (PRNG, seeding, sub-streams),
  resolution-agnostic rendering, features & rarity, ethics, tooling (shortcuts,
  exports, SVG/plotter, loops), verification.
- **8 platform sheets** — Art Blocks (+ Engine/Flex), 256ART, Verse, Highlight,
  Plottables, bootloader.art (svg-js / p5-js / generic-web), self-hosted, and a
  comparison table. Pointers, not copies: mental model + doc URLs + questions,
  no volatile facts.
- **3 runnable scripts** (in-place via `$CLAUDE_PLUGIN_ROOT`, zero plugin
  dependencies) — `check.mjs` (determinism: repeatability, distinctness,
  A-B-A global-state test, feature stability), `render.mjs` (single PNG,
  contact sheet, feature census, batch export), `check-links.mjs`.
- **CI** — scripts tested against a known-good fixture and a derived broken
  one on every push; monthly link check that opens an issue on confirmed rot.
