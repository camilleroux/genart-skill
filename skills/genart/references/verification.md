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

## The harness — written in the artist's project

The plugin ships no code. When a check or a render is needed, write one small
Node script in the artist's project (`tools/harness.mjs` by default), then
reuse and fix it there — do not rewrite it per request.

- **Playwright in the project**: `npm i -D playwright && npx playwright install chromium`.
- **Serve the folder over local HTTP**, ephemeral port — `file://` breaks ES modules and `getImageData`.
- **Load** `?hash=<h>&width=<s>&height=<s>`. **Done** = `window.rendered` is set, then `await document.fonts.ready` — one definition of done for every mode.
- **Hash pixels inside the page**: `getImageData` (2D) or `readPixels` (WebGL), SHA-256 through `crypto.subtle`.
- **PNG** = `canvas.toDataURL("image/png")` in the page, decoded in Node — no image library.
- **Print one line per test** — `ok`/`FAIL`, short pixel hashes — and exit non-zero on any failure.
- **Prove it once**: swap a seeded draw for `Math.random` in a copy of the sketch; the harness must FAIL on it. A checker never seen failing proves nothing.

Contract assumed (defined in `platforms/self-hosted.md`; any platform sketch
satisfies it with a few lines of dev shim): hash from `?hash=`, size from
`?width=`/`?height=`, `window.rendered` = finished canvas, `window.render(hash)`
exposed (required for census and the A-B-A test), optionally `window.$features`.

## Checks — four tests, and why each exists

Two fixed, different hashes; three runs each, a fresh browser context per run.

- **Repeatability** — same hash, fresh contexts → identical pixels. Catches unseeded randomness and time dependence.
- **Distinctness** — the two hashes → different renders. Caught a real bug in `determinism.md`'s own `seedFromHash` (XOR-folding collapsed patterned hashes) while repeatability stayed green.
- **Global state (A, B, A in one page)** — `window.render` A, B, A *without reloading*; the two A's must match. Catches module-level caches, pools, unreset accumulators — invisible to fresh-page repeatability, and platforms do render twice in one page.
- **Feature stability** — `window.$features` identical across the repeatability runs, or the mint metadata can disagree with the artwork forever.

## Views

- **One render** → a PNG for one hash, then **look at it**. The visual loop: edit, render, look, adjust.
- **Contact sheet** → N seeds, each downscaled in the page, composed on a canvas in a blank page; hash and features under each tile; a failed seed is a red tile, not a crashed sheet.
- **Census** → N seeds through `window.render` in one page: counts per trait value, distinct feature tuples. Warn on a value ≥80%, an expected count <1 in the edition, duplicate tuples (`features.md`). List failed seeds grouped by error — a crash tied to one trait value silently deletes it from the counts. A sample estimates; a declared-but-unseen value may still be a threshold bug.
- **Batch** → one full-resolution PNG per seed, hash in the filename.
- **Seeds** for sheet, census and batch come from a fixed seed-of-seeds through the PRNG in `determinism.md` — print it, so the sheet can be rebuilt.

## The pinned environment, and why

Launch flags and context options for every render the harness makes:


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
