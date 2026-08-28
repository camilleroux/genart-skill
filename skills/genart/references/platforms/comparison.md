<!-- Verified: 2026-08-28 -->

# Choosing a platform

Qualitative on purpose — nothing here to go stale. Once chosen: open the
sheet, fetch its docs.

| | Chain | Storage | You deliver | Hash reaches you via | Libraries | Mint-time params | Minify? |
|---|---|---|---|---|---|---|---|
| **Art Blocks** | Ethereum | onchain | one script | injected global | closed registry, one of them | post-mint params exist | yes, bytes cost gas |
| **256ART** | Ethereum | onchain | code + trait table | injected object, plus live chain state | onchain filesystem only | no | yes |
| **Verse** | Ethereum | IPFS | a web page | URL parameter | free | no | optional |
| **bootloader `svg-js`** | Tezos | onchain | inline JS → SVG | injected object | **none** | no | **no — formatting is the work** |
| **bootloader `p5-js`** | Tezos | IPFS | a p5 sketch | injected object, p5 pre-seeded | p5, provided | no | optional |
| **bootloader `generic-web`** | Tezos | IPFS | a zip + manifest | injected object | free, inside the zip | **yes, typed schema** | optional |
| **Highlight** | EVM multi-chain | IPFS | a web page + platform script | platform script, pre-seeded | free | no | optional |
| **Plottables** (AB Engine) | Ethereum | onchain | one script (Art Blocks contract) | injected global | closed registry | no | yes |
| **Self-hosted** | — | your choice | a web page | your choice | free | roll your own | optional |


## Choosing by what constrains you

- **Smallest possible code, maximum permanence** → Art Blocks or 256ART. Both
  put bytes on Ethereum and both will make you fight for kilobytes.
- **Vector work, plotter output, code as part of the piece** → bootloader
  `svg-js`. No canvas, no libraries, and the source is read alongside the work.
- **Heavy 3D, large assets, a real bundle** → Verse, bootloader `generic-web`, or
  self-hosted. Onchain platforms are the wrong shape for this.
- **The collector should choose something at mint** → bootloader `generic-web`.
- **The piece reads live chain state on purpose** → 256ART, which exposes it
  deliberately. Read the trade-off in that sheet before committing.
- **p5, quickly, with the seeding already handled** → bootloader `p5-js`, or
  Highlight, whose platform script hands you seeded draws.
- **Self-serve on an EVM chain, no application** → Highlight.
- **Pen plotter as the real output device** → Plottables (and read the plotter
  section of `../tooling.md`).
- **No platform, full control** → `self-hosted.md`.

## Porting between platforms

Four things change: how the hash arrives (isolate it in one function on day
one and porting is an afternoon) · how features are declared · how the
render-done signal is sent · **which libraries are allowed** — the fatal one: a
piece built on a library the target does not offer is a rewrite, not a port.
