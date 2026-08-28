<!-- Verified: 2026-08-28 -->

# Working tools: debug GUI, shortcuts, export

## Keyboard shortcuts

| Key | Does |
|---|---|
| `R` | new random hash, re-render |
| `←` `→` | previous / next seed |
| `C` | copy hash to clipboard |
| `S` / `⇧S` | save PNG at display size / at high resolution |
| `V` | start / stop video capture |
| `G` | toggle debug panel |
| `F` | fullscreen |
| `1`–`4` | preset sizes (400/1000/2000/4000) |

Two rules that matter more than the bindings: guard against typing into fields
(`if (e.target.matches("input, textarea")) return`), and **put the current hash
in the URL** on every re-roll — every interesting output becomes a shareable,
reproducible link.

## Debug panel

Plain DOM, no dependency. Show: current hash (with an input field — "output
#412 looks wrong" needs its hash pasted), computed features live (a broken
rarity table shows up as twenty identical re-rolls long before any script says
so), render time, and the params being tuned.

**Strip it from the submitted build**: behind a build flag, loaded via dynamic
`import()`. Exception — bootloader `svg-js` stores code unminified and
readable, so leftover debug code is not expensive there, it is *visible*
(`platforms/bootloader.md`).

## PNG export — re-render, never upscale

```js
function savePNG(scale = 1) {
  const c = document.createElement("canvas");
  c.width = baseWidth * scale;
  c.height = baseHeight * scale;
  render(c, hash);                       // same seed, bigger canvas
  c.toBlob((b) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = `${projectName}_${hash.slice(0, 10)}.png`;   // hash in the filename
    a.click();
    URL.revokeObjectURL(a.href);
  });
}
```

WebGL needs `preserveDrawingBuffer: true` to be readable; prefer `toBlob` over
`toDataURL` for large renders (string limits).

## Video

- **`MediaRecorder`** → WebM, a dozen lines; right for real-time/interactive pieces; drops frames when rendering is slow.
- **Frame sequence + `ffmpeg`** — advance a frame counter, render, save, assemble offline; the only correct option when frames exceed their budget or the piece is counter-driven (which, per `determinism.md`, it should be).

Drive animation from a frame counter, not `performance.now()` — that is what
makes an export reproducible.

## Perfect loops

Everything periodic driven by one normalised phase, never elapsed time:

```js
const t = frame / TOTAL_FRAMES;              // 0..1, exact
const y = Math.sin(2 * Math.PI * (t + phase)) * amp;
```

`sin(2π·(k·t + phase))` with integer `k` closes at `TOTAL_FRAMES`. What never
loops: accumulation (`x += v`), damping, wall-clock seeding. Know which frame
the platform captures — a loop's worst frame should not be its public face.

## SVG export — print and plotter

Build a real SVG document; `toDataURL` gives pixels, which a plotter cannot
use. Either draw to SVG natively, or keep a parallel stroke list and serialise
it:

```js
const NS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(NS, "svg");
svg.setAttribute("viewBox", "0 0 210 297");          // A4, in mm
svg.setAttribute("width", "210mm");
svg.setAttribute("height", "297mm");
// … append <path>/<circle>/<line> while drawing …
const blob = new Blob([new XMLSerializer().serializeToString(svg)],
                      { type: "image/svg+xml" });
```

Plotter rules: strokes only (no fills, no opacity — a pen has neither), one
`<path>` per continuous pen-down movement, real units (mm), stroke width = the
physical pen width, and sort/merge paths to reduce pen travel on large plots.

## Contact sheets

The most useful tuning tool for an edition — shipped ready to run:

```
node "$CLAUDE_PLUGIN_ROOT/scripts/render.mjs" . --grid 50          # one sheet
node "$CLAUDE_PLUGIN_ROOT/scripts/render.mjs" . --batch 50 --size 2400   # individual PNGs
```

Contract in `verification.md`.
