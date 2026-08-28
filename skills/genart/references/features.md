<!-- Verified: 2026-08-28 -->

# Features and rarity

Traits are how a collector reads an edition. They describe the work, they do
not configure it: 4–8 axes nameable after five seconds of looking, values as
words (`Density: Sparse|Balanced|Dense`), numbers only for the genuinely
countable.

## Table first, then code

Retrofitting rarity shifts the draw stream and changes the whole edition;
writing the table first costs nothing — and it is also what you hand the
platform and what you compare the measured distribution against.

```js
const PALETTES = [["Ember", 45], ["Ash", 30], ["Verdant", 18], ["Aurora", 7]];
const palette = weighted(rndPalette, PALETTES);
```

## Pure function of the hash, computed before render

```js
function features(hash) {
  const r = stream(hash, "features");
  return { Palette: weighted(r, PALETTES) /* … */ };
}
```

Some platforms compute features headless, with no canvas — traits decided while
drawing fail there, and a feature derived from the render can disagree with the
render forever. Keep the object flat: strings, numbers, booleans; no arrays,
`NaN`, `undefined` or raw floats.

## Binning continuous values

```js
const d = rnd();
const Density = d < 0.3 ? "Sparse" : d < 0.75 ? "Balanced" : "Dense";
```

Never bin on `Math.sin/pow/exp` output — engines differ in the last bits and a
boundary value flips the trait per browser (`determinism.md`).

## What shows up only after the mint

Measure over thousands of seeds (`render.mjs --census`, see
`verification.md`):

- **A value that never appears** — usually an off-by-one threshold.
- **Expected count < 1 over the real edition** — a 1/2000 trait in an edition of 500 will likely never mint. For a true "1 of 1", place it by invocation number, not probability.
- **A value covering ≥80%** — carries no information; rebalance or drop.
- **Duplicate full tuples** — traits too coarse for the edition size.

Then look at pieces, not just counts — a well-distributed trait can still be
invisible.

## Honesty

Publish the weights you actually used; report realised distribution, not
intended; say when a trait is placed rather than drawn.

## Platform specifics

Declaration APIs, accepted types and weight formats differ and change — never
from memory, always the fiche in `platforms/` then its docs.
