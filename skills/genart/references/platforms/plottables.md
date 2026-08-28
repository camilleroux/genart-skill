<!-- Verified: 2026-08-28 -->

# Plottables

**In one line** — Ethereum, Art Blocks Engine, pen-plotter generative art: the
token is a generator whose outputs are meant to be physically drawn.

## Mental model

- **The contract is Art Blocks** — read `artblocks.md` and follow its sequence; this sheet only adds what plotting changes.
- **The real output device holds a pen.** Screen rendering is a preview, which inverts several defaults: strokes only (no fills, opacity, blending); **line density is the whole game** (too few wastes the ink's presence, too many drowns the paper — tuned by plotting physical prototypes, early and often); color = choice of pens per layer, not RGB; paper has a real ratio and a size in millimetres.
- Expose vector output a plotter toolchain can consume — the SVG section of `../tooling.md` (real units, one path per stroke, no fills). Generate the SVG and the preview **from the same stroke list**, or they will disagree.
- The token usually carries the plotting privilege: the generator is the artwork, a plot is an instantiation.

## Docs

`https://plottables.io` (platform, releases, applying) ·
`https://github.com/plottables` (Engine templates, plotting tools) ·
everything in `artblocks.md`.

## Check before you code

The `artblocks.md` checklist, plus: expected vector format and export path ·
standard paper sizes and ratios · how the plotting privilege is granted ·
line-count / plot-time expectations.

## Traps by design

Designing on screen, discovering on paper (opacity stacking and dense fills
turn to mud) · fills or raster effects anywhere in the pipeline · vector export
bolted on after the canvas render.
