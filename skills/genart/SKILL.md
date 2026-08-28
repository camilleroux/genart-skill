---
name: genart
description: >
  Craft long-form generative art for onchain platforms — Art Blocks, 256ART,
  Verse, Highlight, Plottables, bootloader.art, or a self-hosted drop. Covers hash-seeded determinism,
  resolution-agnostic rendering, features and rarity design, preview capture
  signals, debug GUIs and image/video export shortcuts, verification of a sketch
  before minting, and the ethics of the field. Use when the user mentions
  generative art, gen art, creative coding, long-form, onchain art, a seeded
  sketch, a PRNG or deterministic randomness, traits, rarity, features, a mint,
  a plotter or SVG output, or pastes platform APIs such as tokenData, $features,
  inputData, $bootloader, BTLDR, hl-gen, or a base64 payload query param.
user-invokable: true
argument-hint: "[platform|check|render] [path]"
license: MIT
metadata:
  author: Camille Roux
  category: generative-art
---

# Generative art

Help design, write and check long-form generative artworks — pieces where one
algorithm produces a whole edition, each output derived from a hash the
blockchain hands you at mint time.

## Default practices, and when to break them

These are defaults that work most of the time, not rules. Every one of them has
legitimate counter-examples, and those are often the interesting pieces. State
the default, then state what breaking it costs.

| Default | Breaking it is legitimate when… |
|---|---|
| All variation comes from the hash | The piece deliberately reads live onchain state (owner, block data). It is then no longer reproducible from the hash alone — own that choice and document it |
| One seeded PRNG, fixed consumption order | Almost never. But *named sub-streams* let you add a draw without shifting the whole edition — that is how you get flexibility without breaking the property |
| No network, no CDN, no system fonts | Some platforms have an explicit external-asset mode, under their own rules |
| No wall clock | The piece is about time passing, or is genuinely interactive. The preview render must stay stable regardless |
| Sizes relative to the canvas dimension | The piece is deliberately adaptive and reveals more detail with more room. A choice, not an accident — then know what size it will be captured at |
| Runs on current browsers and devices — Chrome, Firefox, Safari, mobile included | A piece built on a bleeding-edge API (WebGPU…) or needing real GPU power is a choice: state the requirement, keep the preview/capture path rendering everywhere, and remember collectors open links on phones |
| Emit the platform's render-done signal | Never. A blank thumbnail is a failure with no upside |
| Features computed before render, from the seed only | Where the platform computes features outside a browser, it is required. Elsewhere it is a convenience |
| Debug code is stripped from the submitted build | Where code is stored unminified and readable onchain, formatting is part of the work |
| Never claim "it's deterministic" without testing it, and without stating the scope | Never |

**The firm part:** breaking a default must be the artist's explicit choice, never
an accident. Point out the deviation, explain what it costs, then do what the
artist asked. Do not refuse and do not lecture.

## Ethics

- Never reproduce a named living artist's signature work. Techniques are shared
  heritage; a body of work is not. Offered "make me a <artist>", decline that
  framing and offer the underlying technique instead.
- Credit the algorithm, the shader, the palette you borrowed.
- Check that a library's licence survives being written onchain forever.
- Be straight about what AI did: writing the code and generating the image are
  different claims.

Full version: `references/ethics.md`.

## Platforms: read the docs, every time

Platform APIs change and the fiches in `references/platforms/` deliberately hold
no versions, no numbers and no field names — only the stable mental model, the
canonical URLs and the questions to ask.

So the sequence is always: **open the fiche → fetch the URLs it lists → then
write code.** Never write platform-specific code from memory, and never from the
fiche alone. If a doc is unreachable, say so and flag what could not be
confirmed.

| Target | Fiche |
|---|---|
| Art Blocks (incl. Engine / Flex) | `references/platforms/artblocks.md` |
| 256ART | `references/platforms/256art.md` |
| Verse | `references/platforms/verse.md` |
| Highlight | `references/platforms/highlight.md` |
| Plottables (pen plotter, AB Engine) | `references/platforms/plottables.md` |
| bootloader.art — ask *which* bootloader | `references/platforms/bootloader.md` |
| Self-hosted / no platform | `references/platforms/self-hosted.md` |
| Undecided between two | `references/platforms/comparison.md` |

## Where to look

| When the question is about… | Read |
|---|---|
| Seeding from a hash, PRNG choice, sub-streams, distributions, things that silently break reproducibility | `references/determinism.md` |
| Output that changes with canvas size, stroke weights, noise frequency, element density, print or plotter output | `references/resolution.md` |
| Designing traits, rarity tables, weights, distribution that came out wrong | `references/features.md` |
| Originality, attribution, licences, disclosing AI use | `references/ethics.md` |
| Debug panel, param tweaking, keyboard shortcuts, PNG and video export, contact sheets | `references/tooling.md` |
| "Is my sketch actually deterministic?", pre-mint checking, what a test can and cannot prove | `references/verification.md` |
| Techniques, tutorials, libraries, inspiration, what other artists use | Fetch https://github.com/camilleroux/awesome-generative-art — a maintained list; do not paraphrase it from memory |

## Runnable scripts

Two scripts ship with the plugin and run **in place** — never copy them into a
project. They need Playwright installed in the artist's project and print the
install command if it is missing. Contract and details: `references/verification.md`.

| Command | Does |
|---|---|
| `node "$CLAUDE_PLUGIN_ROOT/scripts/check.mjs" <dir>` | Determinism: repeatability, distinctness, global-state contamination, feature stability |
| `node "$CLAUDE_PLUGIN_ROOT/scripts/render.mjs" <dir> --hash 0x…` | One PNG — render it, then **look at it** with Read before judging any visual change |
| `node "$CLAUDE_PLUGIN_ROOT/scripts/render.mjs" <dir> --grid N` | Contact sheet, hash + features under each tile |
| `node "$CLAUDE_PLUGIN_ROOT/scripts/render.mjs" <dir> --census N --edition-size E` | Real feature distribution vs the rarity table |
| `node "$CLAUDE_PLUGIN_ROOT/scripts/render.mjs" <dir> --batch N --size 2400` | N individual full-res PNGs, hash-named — portfolio/print export |

When asked to change how a piece looks, close the loop yourself: edit → render
one hash → Read the PNG → judge → adjust. Do not describe a visual change you
have not looked at.

## Workflow

1. **Target first.** Which platform? If undecided, `references/platforms/comparison.md`. Once decided,
   open its fiche and fetch its docs before writing anything.
2. **Decide the rarity table before coding.** It is much harder to retrofit.
3. **Build.** Defaults above; deviations discussed, not silently taken.
4. **Look at many outputs, not one.** A single good render proves nothing —
   `render.mjs --grid` exists for this.
5. **Check before minting** — `check.mjs`, then `references/verification.md` for
   what the green result does and does not prove.
