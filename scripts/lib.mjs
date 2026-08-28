// lib.mjs — the pieces check.mjs and render.mjs must agree on.
//
// Everything here is correctness-critical for comparing renders: if the two
// scripts drifted on a launch flag or on what "the render is done" means, the
// checker would validate images the renderer never produces. Keeping the
// operational encoding of the contract in one place is the point of this file.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import process from "node:process";

// Playwright lives in the artist's project, never in the plugin.
export async function loadChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    console.error(
      "\nThis script needs Playwright, installed in YOUR project (not in the plugin):\n\n" +
        "  npm i -D playwright && npx playwright install chromium\n"
    );
    process.exit(2);
  }
}

// Tiny CLI: flag("size", "600") and has("grid").
export function cli(args) {
  return {
    positional: args.find((a) => !a.startsWith("--")),
    flag(name, fallback) {
      const i = args.indexOf(`--${name}`);
      return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
    },
    has: (name) => args.includes(`--${name}`),
  };
}

// Static server on an ephemeral port — file:// breaks ES modules and getImageData.
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2",
};
export async function serve(dir) {
  const server = createServer(async (req, res) => {
    let p = join(dir, decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (p.endsWith("/")) p = join(p, "index.html");
    try {
      res.writeHead(200, { "content-type": MIME[extname(p)] ?? "application/octet-stream" });
      res.end(await readFile(p));
    } catch {
      res.writeHead(404).end();
    }
  }).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  return { base: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() };
}

// Environment pinning — each flag's reason is documented in
// references/verification.md ("The environment the scripts pin down, and why").
export function launch(chromium) {
  return chromium.launch({
    args: ["--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"],
  });
}
export function contextOptions(size) {
  return { viewport: { width: size, height: size }, deviceScaleFactor: 1 };
}

// The operational definition of "the render is finished": window.rendered is
// set AND the fonts have settled. Both scripts must share this, verbatim.
export async function gotoSketch(page, base, hash, size) {
  await page.goto(`${base}?hash=${hash}&width=${size}&height=${size}`);
  await page.waitForFunction(() => window.rendered, null, { timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
}
