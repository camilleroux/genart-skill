# Changelog

## 0.3.0 — 2026-11-11

- **The plugin ships no code any more.** Anthropic's directory now refuses,
  from non-Verified organizations, any file that is not Markdown, text, JSON,
  YAML or an image, and any frontmatter key outside its list; 0.2.4 and 0.2.5
  were refused on both counts. `check.mjs`, `render.mjs`, `lib.mjs` and the CI
  fixture are gone.
- **The checks are now a spec.** `verification.md` describes the harness —
  server, pinned launch flags, the "done" signal, pixel hashing in the page,
  the four checks, the contact sheet, census and batch views — and Claude
  writes it once in the artist's project, then reuses it. Tested: a fresh
  session built it from the spec alone, passed the reference sketch, failed
  its `Math.random` copy on 5 checks, and produced the sheet and the census.
- **The link check is inline** in `link-check.yml`, which now also fails the
  step on a dead link (`shell: bash` adds pipefail; `| tee` used to swallow
  the exit code).
- **Frontmatter: `user-invokable` removed** — a misspelling of
  `user-invocable` that never did anything, and one of the refused keys.

## 0.2.5 — 2026-11-11

- **New platform sheet — ABX** (`references/platforms/abx.md`), Art Blocks'
  self-serve protocol: you deploy your own contract from the `abx` CLI, which
  ships its own agent skill. The split: this plugin owns the sketch and the
  checks, ABX's skill owns the deploy. Tested end to end on Base Sepolia. The
  run's main lesson is in the sheet: an onchain script does not make the image
  or the traits onchain, so each public surface is its own decision. Listed in
  `SKILL.md`, `artblocks.md` and `comparison.md`. Contributed by @jordanlyall
  (#6).

## 0.2.4 — 2026-11-11

- **Fix — the script commands resolved to `/scripts/check.mjs`.** The skill
  wrote `$CLAUDE_PLUGIN_ROOT`, expecting an environment variable; Claude Code
  exports none to Bash and only substitutes the braced `${CLAUDE_PLUGIN_ROOT}`
  in `SKILL.md`. `SKILL.md` now uses the braced form, so Claude reads an
  absolute path; `verification.md` and `tooling.md`, which are not
  substituted, write `<scripts>/` and point back to it. Reported by
  @jordanlyall in #6.

## 0.2.3 — 2026-10-02

- **Fix — Artpoint's bitrate cap was off by a factor of eight.** The sheet
  read "30 MB/s"; the team meant 30 Mbit/s, with 50 Mbit/s as the real ceiling
  and the gap kept as margin. The delivery table now has its own Bitrate row,
  and the traps name the dense piece left to the encoder's quality setting
  that lands above the cap — cap it at encode, measure the delivered file.

## 0.2.2 — 2026-09-26

- **The plugin has an icon** — `.claude-plugin/icon.svg`, a 3×3 grid of
  Truchet tiles drawn from a fixed seed, so the directory stops falling back
  to the publisher's GitHub avatar. Picked up from its conventional path, so
  `plugin.json` gains no field.

## 0.2.1 — 2026-09-04

- **The Art Blocks sheet points at the Art Blocks MCP server** — one row in
  `artblocks.md`'s Docs table, naming `developer/mcp-server/quick-start/` and
  `capabilities/`, since the section has no index page. Phrased as "connect it
  and ask what it exposes" rather than listing its tools: the server's surface
  moves faster than a sheet could track, so it stays a pointer like the rest.
  Contributed by @jordanlyall, who disclosed being CPO at Art Blocks (#4),
  closing the second half of #1.

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
