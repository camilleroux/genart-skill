# Working on this repo

This repo IS a Claude Code plugin. Plugin users get `skills/genart/SKILL.md`
through the plugin system — this file is only for sessions editing the repo.

## Editorial rules (the ones a fresh session breaks in good faith)

- **Platform sheets are pointers, not copies.** No library versions, no numeric
  values, no API field names in `references/platforms/*.md` — only the stable
  mental model, the doc URLs, and questions to ask those docs. Copied values go
  stale and are then worse than absent. Resist "just this one value".
- **fxhash is never mentioned** (platform offline). Its concepts (mint-time
  params, preview trigger) are described neutrally in `self-hosted.md`.
- Every reference sheet starts with `<!-- Verified: YYYY-MM-DD -->` — update it
  when you actually re-verify, not when you merely edit.
- **Concise**: lists, tables, code — one sentence per idea. Platform sheets
  ~30–50 lines, transverse sheets ~50–120. No narrative prose.
- Tone: defaults with legitimate counter-examples, never absolute rules.
  `ethics.md` is the only normative sheet.
- All content in English.

## Architecture invariants

- **Zero dependencies in the plugin.** No package.json. Playwright lives in the
  artist's project; scripts print the install command when it is missing.
- Scripts run **in place** via `$CLAUDE_PLUGIN_ROOT`, never copied into projects.
- `scripts/lib.mjs` holds the shared contract encoding (launch flags,
  "render is done" wait, server). `check.mjs` and `render.mjs` must both use
  it — duplicating any of it lets the checker and renderer silently diverge.
- `tests/fixture/` is the sketch contract incarnate (defined in
  `references/platforms/self-hosted.md`). The broken variant is **derived by
  sed in CI**, never stored — see `.github/workflows/ci.yml`.
- The version lives in `.claude-plugin/plugin.json` only. A release = bump it
  there + add a `CHANGELOG.md` entry (the update-communication channel).

## Testing

```
npm i -D playwright && npx playwright install chromium   # once, local only
node scripts/check.mjs tests/fixture                     # must exit 0
sed 's/stream(hash, "[a-z]*")/Math.random/g' tests/fixture/index.html > /tmp/b/index.html
node scripts/check.mjs /tmp/b                            # must exit 1 with FAILs
node scripts/render.mjs tests/fixture --hash 0x<64hex>   # writes out.png — look at it
node scripts/render.mjs tests/fixture --grid 9 && node scripts/render.mjs tests/fixture --census 500
node scripts/check-links.mjs                             # no confirmed dead links
claude plugin validate .                                 # must pass
```

Never commit `node_modules` (gitignored; local Playwright install only).
