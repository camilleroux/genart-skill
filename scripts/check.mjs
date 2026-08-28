#!/usr/bin/env node
// check.mjs — determinism harness for a generative art sketch.
//
//   node check.mjs <projectDir> [--size 600] [--runs 3] [--hashes 0x…,0x…]
//
// Expects the sketch to follow the minimal contract (see the plugin's
// references/platforms/self-hosted.md): reads its hash from ?hash= (and its
// size from ?width=/?height=), sets window.rendered to the finished canvas,
// and — for the most valuable test — exposes window.render(hash).
//
// What it proves, and what it cannot, is documented in references/verification.md.
// Short version: same-machine reproducibility only.

import process from "node:process";
import { resolve } from "node:path";
import { loadChromium, cli, serve, launch, contextOptions, gotoSketch } from "./lib.mjs";

const chromium = await loadChromium();

const { positional, flag } = cli(process.argv.slice(2));
const DIR = resolve(positional ?? ".");
const SIZE = parseInt(flag("size", "600"), 10);
const RUNS = parseInt(flag("runs", "3"), 10);
const hashesArg = flag("hashes", null);
const HASHES = hashesArg ? hashesArg.split(",") : ["0x" + "a3f1".repeat(16), "0x" + "77c2".repeat(16)];

const { base, close } = await serve(DIR);
const browser = await launch(chromium);

// Reads the finished canvas and hashes its raw pixels, inside the page.
// Never page.screenshot(): that goes through the compositor and CSS.
const PIXEL_HASH = async () => {
  const c = window.rendered;
  if (!c) throw new Error("window.rendered was never set");
  let data;
  const g2d = c.getContext("2d");
  if (g2d) {
    data = g2d.getImageData(0, 0, c.width, c.height).data;
  } else {
    // WebGL canvases need preserveDrawingBuffer: true to be readable here.
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    data = new Uint8Array(c.width * c.height * 4);
    gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  const d = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

async function renderOnce(hash) {
  const ctx = await browser.newContext(contextOptions(SIZE));
  const page = await ctx.newPage();
  await gotoSketch(page, base, hash, SIZE);
  const h = await page.evaluate(PIXEL_HASH);
  const features = await page.evaluate(() => window.$features ?? null);
  await ctx.close();
  return { h, features };
}

let failures = 0;
const say = (ok, msg) => {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : " FAIL "} ${msg}`);
};

console.log(`\n${DIR}  (size ${SIZE}, ${RUNS} runs)\n`);

// 1. Repeatability: same hash, fresh context each time → identical pixels.
// The runs are kept: distinctness and feature stability are derived from them
// below rather than re-rendering.
console.log("repeatability");
const runsByHash = new Map();
for (const hash of HASHES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await renderOnce(hash));
  runsByHash.set(hash, runs);
  const distinct = [...new Set(runs.map((r) => r.h))];
  say(distinct.length === 1, `${hash.slice(0, 12)}… → ${distinct.map((h) => h.slice(0, 8)).join(" / ")}`);
}

// 2. Distinctness: different hashes must give different output. This is the
// test that catches a seeding function quietly ignoring its input.
console.log("\ndistinctness");
if (HASHES.length >= 2) {
  const [a, b] = [runsByHash.get(HASHES[0])[0].h, runsByHash.get(HASHES[1])[0].h];
  say(a !== b, "two different hashes produce two different renders");
} else {
  console.log("  skip  pass at least two --hashes to enable this test");
}

// 3. Global-state contamination: A, B, A in the SAME page. Catches module-level
// caches, texture pools, accumulators never reset — invisible to test 1.
console.log("\nglobal state (A, B, A in one page)");
const ctx = await browser.newContext(contextOptions(SIZE));
const page = await ctx.newPage();
await gotoSketch(page, base, HASHES[0], SIZE);
if (await page.evaluate(() => typeof window.render === "function")) {
  const seq = [];
  for (const hash of [HASHES[0], HASHES[1] ?? HASHES[0], HASHES[0]]) {
    await page.evaluate((h) => window.render(h), hash);
    seq.push(await page.evaluate(PIXEL_HASH));
  }
  say(
    seq[0] === seq[2],
    `A=${seq[0].slice(0, 8)} B=${seq[1].slice(0, 8)} A'=${seq[2].slice(0, 8)}`
  );
} else {
  console.log("  skip  expose window.render(hash) to enable this test");
}
await ctx.close();

// 4. Feature stability across ALL the runs of test 1: same hash → same features
// object every time, or the metadata written at mint can disagree with the
// artwork forever.
console.log("\nfeatures");
const featureRuns = runsByHash.get(HASHES[0]).map((r) => JSON.stringify(r.features));
if (featureRuns[0] !== "null") {
  const stable = new Set(featureRuns).size === 1;
  say(stable, stable ? `stable across ${RUNS} runs: ${featureRuns[0]}`
                     : `changed between runs: ${[...new Set(featureRuns)].join("  vs  ")}`);
} else {
  console.log("  skip  no window.$features found");
}

await browser.close();
close();
console.log(`\n${failures ? `${failures} failure(s)` : "all checks passed"}\n`);
process.exit(failures ? 1 : 0);
