<!-- Verified: 2026-08-28 -->

# Determinism

The contract: the same hash rebuilds the same artwork, on any machine, forever.
`Math.random`, `Date.now`, `performance.now`, `crypto.getRandomValues` and
anything derived from them break it — the piece renders differently on every
load and no thumbnail matches the live view.

## Hash → seed → PRNG

Fold **all 32 bytes** of the hash in (first-8-chars-only causes collisions
across a large edition). Use `sfc32`: fast, integer-only, identical on every
engine.

```js
function seedFromHash(hash) {
  const hex = hash.replace(/^0x/i, "").padStart(64, "0").slice(-64);
  const s = new Uint32Array(4);
  for (let i = 0; i < 8; i++) {
    const w = parseInt(hex.slice(i * 8, i * 8 + 8), 16) >>> 0;
    s[i % 4] = (Math.imul(s[i % 4] ^ w, 0x9e3779b1) + i) >>> 0;   // mix, do not fold
  }
  if (!(s[0] | s[1] | s[2] | s[3])) s[3] = 1;   // sfc32 must not start all-zero
  return s;
}

function sfc32([a, b, c, d]) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

const rnd = sfc32(seedFromHash(hash));
for (let i = 0; i < 12; i++) rnd(); // warm-up: undiluted seeds correlate first draws
```

`Math.imul`, not plain XOR: XOR-folding cancels on patterned hashes
(`a3f1a3f1…` → all-zero state → every such hash gives the same artwork).
Test harnesses use exactly such hashes.

## Named sub-streams — set up on day one

**Draw order is part of the artwork**: one extra `rnd()` call shifts every
later draw and changes the whole edition. Sub-streams isolate domains so a
change in one leaves the others untouched.

```js
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function stream(hash, label) {
  const s = seedFromHash(hash);
  const k = fnv1a(label);
  const mixed = [0, 1, 2, 3].map((i) => (s[i] ^ Math.imul(k + i, 0x9e3779b1)) >>> 0);
  if (!(mixed[0] | mixed[1] | mixed[2] | mixed[3])) mixed[3] = 1;
  const r = sfc32(mixed);
  for (let i = 0; i < 12; i++) r();
  return r;
}

const palette = stream(hash, "palette");
const layout  = stream(hash, "layout");
```

## Distributions

```js
const int      = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pick     = (r, xs)   => xs[Math.floor(r() * xs.length)];
const chance   = (r, p)    => r() < p;
const gaussian = (r)       => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

const weighted = (r, entries) => {          // [[value, weight], ...]
  let total = 0;
  for (const [, w] of entries) total += w;
  let x = r() * total;
  for (const [v, w] of entries) { x -= w; if (x < 0) return v; }
  return entries[entries.length - 1][0];
};

const shuffle = (r, xs) => {                // Fisher-Yates, in place
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
  return xs;
};
```

`gaussian` consumes **two** draws; any helper with a data-dependent draw count
(rejection sampling) belongs in its own sub-stream. Uniform reads lifeless:
skew with `r() ** 2` (bias small), `1 - (1 - r()) ** 2` (bias large), or mixed
gaussians — see [Piter Pasma on distributions](https://piterpasma.nl/articles/probability).

## Silent breakers

- `arr.sort()` without a comparator (lexicographic); a comparator calling the PRNG (engine-dependent result).
- `for...in`, `Object.keys()` on mixed integer/string keys; `Set`/`Map` iteration when insertion is conditional.
- Async completion order affecting drawing (image decodes, workers, `Promise.all`).
- Reading canvas/viewport size as a *composition* input (scaling only — see `resolution.md`).
- Module-level mutable state surviving between renders — invisible on a single run; `verification.md` has the `[A,B,A]` test for it.

## Floats

`Math.sin/cos/pow/exp/log` are not bit-identical across JS engines. Harmless in
geometry; forbidden in two places:

- **inside the PRNG** — `fract(sin(x)*43758.5453)`-style generators diverge across engines and GPUs; integer arithmetic only (in GLSL use an integer hash like PCG);
- **in feature computation** — a one-ULP difference at a threshold flips a trait and the metadata lies forever. Decide traits from PRNG output with generous bin margins (`features.md`).
