# Changelog

## 0.2.0 — 2026-09-04

- **New platform sheet — Artpoint** (`references/platforms/artpoint.md`), the
  first non-mint outlet in the corpus: a screen-diffusion agency where you
  deliver a finished video file rather than code, and the output device is a
  screen in a room where people work. Covers what that inverts (ambient tempo,
  muted, loops that replay for hours, one master instead of a variant matrix)
  and points at `tooling.md` §Video / §Perfect loops for the pipeline.
- **A documented exception to "no values in platform sheets"** — Artpoint
  publishes no artist specification, so the sheet carries the delivery spec
  with a provenance stamp and a date instead of a dead pointer. Recorded in
  `AGENTS.md` so it is not "fixed" away.

## 0.1.1 — 2026-09-04

- **Fix — the scripts could not find Playwright once the plugin was installed.**
  `import("playwright")` resolves `node_modules` from the importing file, which
  for an installed plugin is the plugin cache and never the artist's project:
  `check.mjs` and `render.mjs` printed "This script needs Playwright" even when
  it was correctly installed. They now resolve it from the sketch directory,
  then the working directory. A repo checkout was the one layout that worked —
  which is why CI never saw it, so CI now also runs the scripts from outside
  the project. Reported by @jordanlyall (#1).

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
