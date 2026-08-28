<!-- Verified: 2026-08-28 -->

# bootloader.art

**Ask which bootloader first** — the platform is a family of runtimes with
incompatible constraints. Never "bootloader" in the singular.

| | `svg-js` | `p5-js` | `generic-web` |
|---|---|---|---|
| What | inline JS → SVG | p5 sketches | HTML/CSS/JS projects |
| Storage | **onchain** | IPFS | IPFS |
| Deliver | code in a wrapper | a sketch | a zip + manifest |
| Libraries | **none** — SVG DOM | p5, provided | anything in the zip |
| Mint-time params | no | no | **yes**, typed schema |

**In one line** — Tezos, by ObjktLabs. Open, experimental, non-curated, code
visible next to the work by design.

## Mental model

Common: seeded PRNG + edition number handed to your code; generators
**versionable** (bug fixes after launch); collectors can regenerate keeping
their seed; a detectable preview/cover mode.

- **`svg-js`** — SVG DOM only, billed per byte onchain, node count is the budget. Stored **unminified**: your formatting is part of the work's visible provenance — the one place where "strip and minify" is wrong (`../tooling.md`).
- **`p5-js`** — p5 provided and **already seeded**, inverting the usual bridge-your-own-PRNG advice. Check what that means for `random()`/`noise()` before wiring anything.
- **`generic-web`** — zip + manifest declaring capture and animation; the only place in this corpus where **mint-time parameters** exist (typed schema, UI widgets).

## Docs

`https://bootloader.art/` → `/resources`, `/help`, and one page per runtime
(`/bootloaders/svg-js`, `/bootloaders/p5-js`, `/bootloaders/generic-web`).
**The site rejects plain fetches** (403 / empty SPA shell) — open in a browser.
Runtime source of truth: `https://github.com/objkt-com/bootloader-monorepo`
(newer runtimes may live on a feature branch). Third-party sandbox:
`https://github.com/Tezumie/bootloader-sandbox`.

## Check before you code

Which runtime and version · injected object's fields (PRNG, seed, edition,
preview flag, root element) · features mechanism if any · render-done signal ·
`svg-js`: current cost per byte · `generic-web`: manifest options (capture,
animation, params) · dev harness params (seed, edition, capture).

## Traps by design

Assuming a canvas in `svg-js` · porting canvas work to `svg-js` (vector cost
scales with nodes, not resolution) · minifying `svg-js` code · double-seeding
p5 · referencing outside the zip in `generic-web` · treating these docs as
settled — youngest platform here, the sheet most likely to be stale: read the
site and the monorepo.
