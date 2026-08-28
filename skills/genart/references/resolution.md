<!-- Verified: 2026-08-28 -->

# Rendering at any size

The 300px thumbnail, the fullscreen live view and the 4000px print must be the
same artwork — not the same pixels.

## Draw in a normalised space

Scale into the canvas once; everything downstream is then correct by
construction (a stray hard-coded pixel value becomes impossible):

```js
const S = Math.min(canvas.width, canvas.height);
ctx.translate((canvas.width - S) / 2, (canvas.height - S) / 2);
ctx.scale(S, S);              // now draw in 0..1
ctx.lineWidth = 0.004;        // 0.4% of the short side
```

## Freeze the size at load

```js
canvas.width = W; canvas.height = H;          // fixed, from platform or ?width=/?height=
canvas.style.width = "100%"; canvas.style.height = "100%";
canvas.style.objectFit = "contain";           // CSS letterboxes; the buffer never changes
```

Resizing a live canvas destroys accumulated state with no correct resume — on
window resize, re-render from the seed. Same for `devicePixelRatio`: pick it
once (1 for capture, device value for live), never re-read mid-render.

## Things that must scale and get forgotten

Stroke widths · shadow/glow blur radii · corner radii · font sizes · dash
patterns · particle sizes · margins · displacement amplitudes · any "skip if
smaller than N pixels" threshold. The tell: a raw number in a drawing call
that is not a fraction of the normalised space.

## Noise

Sample in normalised space — `noise(x * 4, y * 4)` gives 4 features across the
piece at any size; `noise(px * 0.01)` gains detail as resolution grows (a
legitimate choice only if chosen).

## Element density — the real trap

5 000 dots fill a 400px canvas and vanish at 4000px. Three defensible choices;
pick one **on purpose** and write it down:

1. **Fixed count** — identical composition, larger reads sparser. The default of most long-form work.
2. **Fixed count, element size scaled** — perceived density preserved; right when the elements are the subject.
3. **Count scaled with area** — the piece reveals more when larger; then the thumbnail is a different artwork, so know which size gets captured.

## Text and fonts

Font metrics vary across platforms: never derive layout from `measureText`.
Structural text → embed the font inline and await `document.fonts.ready`;
decorative text → prefer paths.

## Check

Render one hash at 400/1000/2000/4000px (plus portrait/landscape if not
square); look for thinning strokes, drifting margins, shifted composition.
Then a dozen hashes — some layouts break only for particular seeds. Print
needs 300 dpi survival; plotter output: see the SVG section of `tooling.md`.
