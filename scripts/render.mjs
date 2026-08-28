#!/usr/bin/env node
// render.mjs — look at a generative art sketch: one render, a contact sheet,
// or a census of its feature distribution.
//
//   node render.mjs <projectDir> --hash 0x…  [--size 800] [--out out.png]
//   node render.mjs <projectDir> --grid 50   [--seed-of-seeds 0x…] [--thumb 240] [--out sheet.png]
//   node render.mjs <projectDir> --census 5000 [--edition-size N] [--seed-of-seeds 0x…]
//   node render.mjs <projectDir> --batch 50  [--size 2400] [--out dir] [--hashes 0x…,0x…]
//
// Same contract as check.mjs: the sketch reads ?hash=, sets window.rendered,
// and ideally exposes window.render(hash) (grid is much faster with it, and
// census requires it).

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { loadChromium, cli, serve, launch, contextOptions, gotoSketch } from "./lib.mjs";

const chromium = await loadChromium();

const { positional, flag, has } = cli(process.argv.slice(2));
const DIR = resolve(positional ?? ".");
const SIZE = parseInt(flag("size", "800"), 10);
const THUMB = parseInt(flag("thumb", "240"), 10);
const SEED_OF_SEEDS = flag("seed-of-seeds", "0x" + "5eed".repeat(16));

const modes = ["hash", "grid", "census", "batch"].filter(has);
if (modes.length !== 1) {
  console.error("pick exactly one mode: --hash 0x… | --grid N | --census N | --batch N");
  process.exit(2);
}
const MODE = modes[0];

// --- Reproducible seed derivation (sfc32, in Node) ----------------------------
// Kept in sync with references/determinism.md by hand. Note: changing this
// derivation silently re-derives every "reproducible" contact sheet and census
// across plugin versions — a reason a future PRNG fix might deliberately NOT
// be mirrored here.
function makeRng(hex) {
  const h = hex.replace(/^0x/i, "").padStart(64, "0").slice(-64);
  const s = new Uint32Array(4);
  for (let i = 0; i < 8; i++) {
    const w = parseInt(h.slice(i * 8, i * 8 + 8), 16) >>> 0;
    s[i % 4] = (Math.imul(s[i % 4] ^ w, 0x9e3779b1) + i) >>> 0;
  }
  if (!(s[0] | s[1] | s[2] | s[3])) s[3] = 1;
  let [a, b, c, d] = s;
  const r = () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) r();
  return r;
}
function deriveHashes(n, seedHex) {
  const r = makeRng(seedHex);
  return Array.from({ length: n }, () =>
    "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[(r() * 16) | 0]).join("")
  );
}

// --- Shared setup -------------------------------------------------------------
const { base, close } = await serve(DIR);
const browser = await launch(chromium);
const ctx = await browser.newContext(contextOptions(SIZE));

async function openSketch(hash) {
  const page = await ctx.newPage();
  await gotoSketch(page, base, hash, SIZE);
  return page;
}

// PNG-encode the finished canvas inside the page — no native image deps in Node.
const CANVAS_PNG = () => window.rendered.toDataURL("image/png");
// For grid tiles: downscale in the page first, so only thumb-sized payloads
// cross the Playwright bridge (an ~10x reduction at default sizes).
const THUMB_PNG = (thumb) => {
  const src = window.rendered;
  const c = document.createElement("canvas");
  c.width = thumb;
  c.height = Math.round((thumb * src.height) / src.width);
  c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL("image/png");
};
const writeDataUrl = async (dataUrl, out) =>
  writeFile(out, Buffer.from(dataUrl.split(",")[1], "base64"));

const cleanup = async (code) => {
  await browser.close();
  close();
  process.exit(code);
};

// =============================== --hash =======================================
if (MODE === "hash") {
  const hash = flag("hash");
  const out = flag("out", "out.png");
  const page = await openSketch(hash);
  await writeDataUrl(await page.evaluate(CANVAS_PNG), out);
  const features = await page.evaluate(() => window.$features ?? null);
  console.log(`${out}  ${hash.slice(0, 14)}…  ${features ? JSON.stringify(features) : ""}`);
  await cleanup(0);
}

// =============================== --grid =======================================
if (MODE === "grid") {
  const n = parseInt(flag("grid", "25"), 10);
  const out = flag("out", "sheet.png");
  const hashes = deriveHashes(n, SEED_OF_SEEDS);
  const cols = Math.ceil(Math.sqrt(n));
  const tiles = [];

  // Render every seed. window.render(hash) in one page is much faster than a
  // fresh page per seed; fall back if the sketch does not expose it.
  const probe = await openSketch(hashes[0]);
  const inPlace = await probe.evaluate(() => typeof window.render === "function");
  if (!inPlace) await probe.close();
  for (const [i, hash] of hashes.entries()) {
    try {
      let src, features;
      if (inPlace) {
        await probe.evaluate((h) => window.render(h), hash);
        src = await probe.evaluate(THUMB_PNG, THUMB);
        features = await probe.evaluate(() => window.$features ?? null);
      } else {
        const p = await openSketch(hash);
        src = await p.evaluate(THUMB_PNG, THUMB);
        features = await p.evaluate(() => window.$features ?? null);
        await p.close();
      }
      tiles.push({ hash, src, features, ok: true });
    } catch (e) {
      tiles.push({ hash, ok: false });   // a failed seed marks its tile, the sheet survives
      console.error(`  seed ${i} (${hash.slice(0, 12)}…) failed: ${e.message.split("\n")[0]}`);
    }
    process.stderr.write(`\r${i + 1}/${n}`);
  }
  process.stderr.write("\n");
  if (inPlace) await probe.close();

  // Compose the sheet in a blank page — canvas + drawImage, still no native deps.
  const label = 30;
  const compose = await ctx.newPage();
  const sheet = await compose.evaluate(
    async ({ tiles, cols, thumb, label }) => {
      const rows = Math.ceil(tiles.length / cols);
      const c = document.createElement("canvas");
      c.width = cols * thumb;
      c.height = rows * (thumb + label);
      const g = c.getContext("2d");
      g.fillStyle = "#1a1a1a";
      g.fillRect(0, 0, c.width, c.height);
      for (const [i, t] of tiles.entries()) {
        const x = (i % cols) * thumb;
        const y = Math.floor(i / cols) * (thumb + label);
        if (t.ok) {
          const img = new Image();
          img.src = t.src;
          await img.decode();
          g.drawImage(img, x, y, thumb, thumb);
        } else {
          g.fillStyle = "#7a1f1f";
          g.fillRect(x, y, thumb, thumb);
          g.fillStyle = "#fff";
          g.font = `${thumb / 10}px monospace`;
          g.fillText("failed", x + 8, y + thumb / 2);
        }
        g.fillStyle = "#999";
        g.font = "10px monospace";
        g.fillText(t.hash.slice(0, 12) + "…", x + 4, y + thumb + 12);
        if (t.features) {
          g.fillStyle = "#666";
          const txt = Object.values(t.features).join(" · ");
          g.fillText(txt.slice(0, Math.floor(thumb / 6)), x + 4, y + thumb + 24);
        }
      }
      return c.toDataURL("image/png");
    },
    { tiles, cols, thumb: THUMB, label }
  );
  await writeDataUrl(sheet, out);
  const failed = tiles.filter((t) => !t.ok).length;
  console.log(`${out}  ${n} seeds (seed-of-seeds ${SEED_OF_SEEDS.slice(0, 10)}…)${failed ? `, ${failed} FAILED` : ""}`);
  await cleanup(failed ? 1 : 0);
}

// =============================== --batch ======================================
// Individual full-resolution PNGs, one per seed — the portfolio/print export.
// (--grid downscales into one sheet; this does not.)
if (MODE === "batch") {
  const n = parseInt(flag("batch", "10"), 10);
  const outDir = flag("out", "batch");
  const hashes = flag("hashes", null)
    ? flag("hashes").split(",")
    : deriveHashes(n, SEED_OF_SEEDS);
  await mkdir(outDir, { recursive: true });

  const probe = await openSketch(hashes[0]);
  const inPlace = await probe.evaluate(() => typeof window.render === "function");
  if (!inPlace) await probe.close();
  let failed = 0;
  for (const [i, hash] of hashes.entries()) {
    const file = join(outDir, `${hash.slice(0, 18)}.png`);   // hash in the filename
    try {
      let src;
      if (inPlace) {
        await probe.evaluate((h) => window.render(h), hash);
        src = await probe.evaluate(CANVAS_PNG);
      } else {
        const p = await openSketch(hash);
        src = await p.evaluate(CANVAS_PNG);
        await p.close();
      }
      await writeDataUrl(src, file);
    } catch (e) {
      failed++;
      console.error(`  ${hash.slice(0, 12)}… failed: ${e.message.split("\n")[0]}`);
    }
    process.stderr.write(`\r${i + 1}/${hashes.length}`);
  }
  process.stderr.write("\n");
  if (inPlace) await probe.close();
  console.log(`${outDir}/  ${hashes.length - failed} PNG at ${SIZE}px${failed ? `, ${failed} FAILED` : ""}`);
  await cleanup(failed ? 1 : 0);
}

// =============================== --census =====================================
if (MODE === "census") {
  const n = parseInt(flag("census", "1000"), 10);
  const edition = parseInt(flag("edition-size", "0"), 10);
  const hashes = deriveHashes(n, SEED_OF_SEEDS);

  const page = await openSketch(hashes[0]);
  if (!(await page.evaluate(() => typeof window.render === "function"))) {
    console.error("census needs window.render(hash) — see references/platforms/self-hosted.md");
    await cleanup(2);
  }

  const counts = {};        // trait -> value -> count
  const tuples = new Map();  // full feature tuple -> count
  const failedSeeds = [];    // { hash, reason } — failures must stay visible:
                             // a crash correlated with a trait would otherwise
                             // silently delete that value from the report
  let noFeatures = 0;
  let rendered = 0;
  for (const [i, hash] of hashes.entries()) {
    try {
      const f = await page.evaluate((h) => {
        window.render(h);
        return window.$features ?? null;
      }, hash);
      if (!f) { noFeatures++; continue; }
      rendered++;
      for (const [trait, v] of Object.entries(f)) {
        const byVal = (counts[trait] ??= {});
        byVal[v] = (byVal[v] ?? 0) + 1;
      }
      const key = JSON.stringify(f, Object.keys(f).sort());
      tuples.set(key, (tuples.get(key) ?? 0) + 1);
    } catch (e) {
      failedSeeds.push({ hash, reason: e.message.split("\n")[0] });
    }
    if ((i + 1) % 100 === 0) process.stderr.write(`\r${i + 1}/${n}`);
  }
  process.stderr.write("\n");

  if (!rendered) {
    console.error("no features collected — does the sketch set window.$features?");
    await cleanup(2);
  }

  console.log(`\n${rendered} seeds sampled${edition ? `, judged against an edition of ${edition}` : ""}\n`);
  const warnings = [];
  for (const [trait, values] of Object.entries(counts)) {
    console.log(trait);
    const sorted = Object.entries(values).sort((a, b) => b[1] - a[1]);
    for (const [value, count] of sorted) {
      const pct = (100 * count) / rendered;
      const exp = edition ? ` → ~${Math.round((count / rendered) * edition)} in edition` : "";
      console.log(`  ${value.padEnd(20)} ${String(count).padStart(6)}  ${pct.toFixed(1).padStart(5)}%${exp}`);
      if (pct > 80)
        warnings.push(`"${trait}: ${value}" covers ${pct.toFixed(0)}% — it carries no information`);
      if (edition && (count / rendered) * edition < 1)
        warnings.push(`"${trait}: ${value}" expects <1 piece in the edition — it will likely never exist`);
    }
    console.log();
  }
  const dupes = [...tuples.values()].filter((c) => c > 1).reduce((a, c) => a + c, 0);
  console.log(`distinct feature tuples: ${tuples.size}/${rendered}` +
    (dupes ? `  (${dupes} seeds share a tuple with another)` : ""));

  // Failures, grouped by reason — a reason correlated with a missing trait
  // value is exactly the bug this census exists to catch.
  if (failedSeeds.length) {
    const byReason = new Map();
    for (const { reason } of failedSeeds) byReason.set(reason, (byReason.get(reason) ?? 0) + 1);
    console.log(`\n${failedSeeds.length} seed(s) FAILED to render — their features are missing from the stats above:`);
    for (const [reason, count] of byReason) console.log(`  ${count}× ${reason}`);
    console.log(`  first failing hash: ${failedSeeds[0].hash}`);
  }
  if (noFeatures) warnings.push(`${noFeatures} seed(s) rendered but set no window.$features`);

  if (warnings.length) {
    console.log("\nwarnings");
    for (const w of warnings) console.log(`  ! ${w}`);
  }
  console.log(
    "\nNote: a sample estimates, it does not prove. A trait declared but never" +
      "\nobserved here may still be a threshold bug — compare against your table."
  );
  await cleanup(failedSeeds.length ? 1 : 0);
}
