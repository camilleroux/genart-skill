<!-- Verified: 2026-08-28 -->

# Self-hosted / no platform

No platform contract to satisfy — so this is the one prescriptive sheet: a
minimal contract worth adopting anyway, because porting, the verification
scripts and long-term survival all need the same three things: an external
seed, declared features, a done signal.

## The minimal contract

**Seed and size in, from the URL** (fallback random in dev, written back into
the URL so every output is a shareable, reproducible link):

```js
const q = new URLSearchParams(location.search);
const hash = q.get("hash") ?? "0x" + crypto.randomUUID().replace(/-/g, "").repeat(2);
const W = +(q.get("width") ?? 800);     // tools pass a size the same way —
const H = +(q.get("height") ?? 800);    // honour it, then freeze it (resolution.md)
```

(That `crypto` call is the one legitimate unseeded random in a generative
piece: choosing which piece to look at, never how to draw it.)

**Features out** — one flat object on a global, from the hash alone, before
rendering.

**Done signal** — set once the frame is genuinely complete:

```js
window.rendered = canvas;
document.dispatchEvent(new CustomEvent("genart:done"));
```

**One render entry point** — `window.render = (hash) => { … }`. Costs nothing;
enables re-rolling without reload and the A-B-A contamination test in
`../verification.md`, and forces the render to be a pure function of the hash —
the property you wanted anyway.

**Self-contained** — one entry HTML, everything inlined (fonts base64, shaders
as strings), no CDN, no fetch. Test with the network disabled: that is the
actual requirement.

## Concepts you will meet, named neutrally

- **Mint-time parameters** — the collector picks values within declared ranges before minting; the piece takes two inputs. Implemented today by bootloader `generic-web` (`bootloader.md`).
- **Preview trigger** — the piece declares "capture this frame" instead of the tooling guessing after a delay; roll your own with the done signal.

## Hosting and posterity

IPFS with a pinning service you actually pay for, or Arweave. A personal
domain is mortal. Document yourself what nobody else will: seed format,
feature weights used, capture size/ratio, target browser, the artwork's
licence and the licences of everything bundled (`../ethics.md`).
