<!-- Verified: 2026-09-04 -->

# Artpoint

**In one line** — a Paris digital-art agency, not a mint platform: you deliver a
finished video file and it plays on client screens (offices, hotels, retail) on
a monthly rotation. No chain, no hash, no code of yours runs on their side.

## Mental model

- **You ship a cut, not a generator.** The edition logic stays yours: pick the seeds, render, hand over files. `../determinism.md` still pays — it is what lets you re-render a master a year later, at a bigger size or a different ratio.
- **Put the recipe in the filename.** It is the only metadata that survives someone else's asset library — no sidecar, no README, no email thread. Piece, hash, sketch commit, size, fps, frames: `dunes_0x8f3a91c2_a41b9de_3840x2160_30fps_1800f.mp4`.
- **The output device is a screen in a room where people work.** Same inversion as the plotter in `plottables.md`: ambient, muted, glanced at rather than looked at. Slow beats eventful, legible at distance and off-axis, contrast that survives a bright lobby. A screen nobody can look away from is a screen the client turns off.
- **Time becomes an input.** A still becomes video by animating the system, or by travelling across seeds. Drive it from a frame counter, never the wall clock — `../tooling.md` §Video.
- **A loop's seam gets many chances.** A one-minute piece replays hundreds of times a day, and a seam that passes once may not pass the fortieth (`../tooling.md` §Perfect loops). A visible cut is a legitimate choice; the seam nobody chose is not.
- **One master by default — ask what they do to it themselves.** Rescaling and rotating is routine, reframing is not something to assume. A 9:16 that is not a cropped 16:9 is a second *render*, not a second export: deliver both when the composition demands it, and keep the framing yours.
- **They need words too.** Works are shown with curatorial texts on a companion page: supply the description, or the key facts and let them write it.

## Delivery spec

Artpoint publishes no artist specification. This is what the team asked for in
2026-09 — **reconfirm with your contact**; it is private and it will drift.

| | |
|---|---|
| Container | `.mp4`, H.264 preferred |
| Resolution | UHD, Full HD floor |
| Ratio | 16:9 and/or 9:16 |
| Duration | 3–5 min if it does not loop, around 1 min if it does |
| Frame rate | 30 fps |
| Weight | 1.5 GB per file max, 30 MB/s max |

## Docs

`https://www.artpoint.fr` — the offer, the catalogue, the artist sign-up form.
No artist documentation, no public spec: **your contact is the spec** — write
the answers down and date them.

## Check before you render

Container, resolution, ratio and weight caps · whether it must loop, which
decides the duration · sound, or is every screen muted · which orientations are
in the client's rooms · what they do to the file themselves: rescale, rotate,
reframe · how long it stays up and how often it repeats in a day · the licence
granted, its duration and territory, and the AI-training exclusion
(`../ethics.md`) · what the curatorial text needs from you.

## Traps by design

Screen-recording the sketch (dropped frames, variable timestep, nothing
reproducible) · a loop that accumulates (`x += v`) or damps, and so never
closes · exporting at the preview size instead of re-rendering at UHD
(`../resolution.md`) · a 16:9 cropped to 9:16 by someone who did not compose it
· a delivered master nothing in its filename can regenerate · sound designed
in, played on a muted screen · a rhythm that reads well in a 30-second review
and is unbearable on day nine.
