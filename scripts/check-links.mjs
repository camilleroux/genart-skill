#!/usr/bin/env node
// check-links.mjs — verify that the URLs referenced by the skill's sheets still
// resolve. This is the only part of the plugin that rots: the sheets hold
// pointers, not copies, so a dead link is the failure mode to watch.
//
//   node check-links.mjs            # scan skills/**/*.md and README.md
//
// Classification, not allowlisting: only unambiguous rot fails the run —
// 404/410 or DNS failure, confirmed by a second attempt. Everything
// bot-shaped (403, timeouts, resets — bootloader.art serves 403 to
// non-browser agents by design) is reported as a note and never fails,
// whatever the host.

import { readFile, readdir } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const CONCURRENCY = 6;

async function* mdFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* mdFiles(p);
    else if (e.name.endsWith(".md")) yield p;
  }
}

const files = [join(ROOT, "README.md")];
for await (const f of mdFiles(join(ROOT, "skills"))) files.push(f);

const urls = new Map(); // url -> Set of files
for (const f of files) {
  // Fenced code blocks hold URL-shaped strings (template literals, dummy
  // bases) that are not links — drop them before scanning. Inline backticks
  // stay: the sheets deliberately write real URLs as `code`.
  const text = (await readFile(f, "utf8")).replace(/^```.*?^```/gms, "");
  for (const m of text.matchAll(/https?:\/\/[^\s)\]`>"']+/g)) {
    const u = m[0].replace(/[.,;:]+$/, "");
    try { new URL(u); } catch { continue; }
    if (!urls.has(u)) urls.set(u, new Set());
    urls.get(u).add(relative(ROOT, f));
  }
}

async function probe(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "user-agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    res.body?.cancel();
    return { status: res.status };
  } catch (e) {
    return { error: e.cause?.code ?? e.name };
  }
}

// Unambiguous rot only. A 403 or a timeout is what a bot wall looks like;
// treating it as death would cry wolf monthly until the check gets disabled.
const isRot = (r) => r.status === 404 || r.status === 410 || r.error === "ENOTFOUND";

async function classify(url) {
  let r = await probe(url);
  if (isRot(r)) {
    await new Promise((s) => setTimeout(s, 3000));
    r = await probe(url); // confirm before crying wolf
  }
  return { url, result: r, dead: isRot(r) };
}

// Probe concurrently in a small pool — serial probing pays every timeout in
// full, which turns a monthly check into minutes for no reason.
const queue = [...urls.keys()].sort();
const results = [];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) results.push(await classify(queue.shift()));
  })
);

let dead = 0;
console.log(`${urls.size} unique URLs across ${files.length} files\n`);
for (const { url, result: r, dead: isDead } of results.sort((a, b) => a.url.localeCompare(b.url))) {
  const label = r.error ?? r.status;
  if (isDead) {
    dead++;
    console.log(` DEAD  ${label}  ${url}`);
    for (const f of urls.get(url)) console.log(`         in ${f}`);
  } else if (r.error || r.status >= 400) {
    console.log(`  note ${label}  ${url}  (bot-shaped response — check in a browser)`);
  } else {
    console.log(`    ok ${label}  ${url}`);
  }
}

console.log(`\n${dead ? `${dead} confirmed dead link(s)` : "no confirmed dead links"}`);
process.exit(dead ? 1 : 0);
