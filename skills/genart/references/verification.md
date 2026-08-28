<!-- Verified: 2026-08-28 -->

# Checking a piece before minting

Two rules up front: a test proves **same-machine reproducibility only** (last
section says what is out of reach), and never write "it's deterministic"
without saying across what — machine, browser, GPU mode.

## Read it first — five minutes, no tooling

Search the source **and the production bundle** (a dependency can bring
`Math.random` in — a graphics library whose seed you never set is the classic
case) for:

`Math.random` · `Date` · `performance.now` · `crypto.getRandomValues` ·
`fetch` · `XMLHttpRequest` · `<script src=` · `@font-face` with a remote `url(` ·
`navigator.` · `Intl` · `toLocaleString` · `.sort(` without a comparator ·
`for...in` · `window.innerWidth` outside the sizing code

A legitimate hit (dev-only hash generator) deserves a comment saying why.

## The scripts

Run from the plugin, never copied; Playwright lives in the artist's project
(they print the install command if missing):

```
node "$CLAUDE_PLUGIN_ROOT/scripts/check.mjs"  <dir> [--size 600] [--runs 3] [--hashes 0x…,0x…]
node "$CLAUDE_PLUGIN_ROOT/scripts/render.mjs" <dir> --hash 0x… | --grid N | --census N [--edition-size E]
```

Contract assumed (defined in `platforms/self-hosted.md`; any platform sketch
satisfies it with a few lines of dev shim): hash from `?hash=`, size from
`?width=`/`?height=`, `window.rendered` = finished canvas, `window.render(hash)`
exposed (required for census and the A-B-A test), optionally `window.$features`.

## check.mjs — four tests, and why each exists

- **Repeatability** — same hash, fresh contexts → identical pixels. Catches unseeded randomness and time dependence.
- **Distinctness** — different hashes → different renders. Caught a real bug in `determinism.md`'s own `seedFromHash` (XOR-folding collapsed patterned hashes) while repeatability stayed green.
- **Global state (A, B, A in one page)** — render A, B, A *without reloading*; the two A's must match. Catches module-level caches, pools, unreset accumulators — invisible to fresh-page repeatability, and platforms do render twice in one page.
- **Feature stability** — same hash → same features, or the mint metadata can disagree with the artwork forever.

## render.mjs

- `--hash` → one PNG. The visual loop: edit, render, **look**, adjust.
- `--grid N` → contact sheet, hash + features under each tile; failed seeds marked red.
- `--census N --edition-size E` → measured feature distribution with the `features.md` warnings (≥80% values, expected-count-<1, duplicate tuples). A sample estimates — a declared-but-unseen value may still be a threshold bug.
- `--batch N --size 2400 [--out dir] [--hashes 0x…,0x…]` → N individual full-resolution PNGs, one file per seed, hash in the filename.

## The pinned environment, and why

- `deviceScaleFactor: 1` — retina doubles the buffer, nothing compares.
- `--force-color-profile=srgb` — otherwise output depends on the monitor profile.
- `--disable-lcd-text`, `--font-render-hinting=none` — subpixel AA is machine-specific.
- `await document.fonts.ready` — or you hash a half-drawn frame.
- **Read the canvas, never `page.screenshot()`** — screenshots go through the compositor and CSS.
- **WebGL needs `preserveDrawingBuffer: true`** or you hash a blank image.

## What none of this can tell you

- **Cross-machine determinism in WebGL/WebGPU.** Shader compilers, float precision, rasterisation and MSAA differ per GPU; two correct machines produce different pixels. Only a software renderer (`--use-gl=swiftshader`) gives machine-comparable, committable hashes — never compare across GPU modes. For 3D the honest contract is *same composition, same features, differences below perception* — not same bytes.
- **Cross-engine transcendentals** — invisible in geometry, decisive at feature boundaries (`determinism.md`).
- **Other browsers and devices** — run repeatability on WebKit/Firefox to catch crashes and missing APIs (never compare their pixels to Chromium's), and open the piece on a phone at least once: collectors do, and mobile GPUs are where precision and memory limits bite first.
- **Ten-year survival** — untestable; fewer dependencies and no experimental APIs is the whole strategy.
- **Whether the rarity, the piece, or the originality is any good** — a contact sheet and `ethics.md`.
