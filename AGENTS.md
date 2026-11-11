# Working on this repo

This repo IS a Claude Code plugin. Plugin users get `skills/genart/SKILL.md`
through the plugin system — this file is only for sessions editing the repo.

## Editorial rules (the ones a fresh session breaks in good faith)

- **Platform sheets are pointers, not copies.** No library versions, no numeric
  values, no API field names in `references/platforms/*.md` — only the stable
  mental model, the doc URLs, and questions to ask those docs. Copied values go
  stale and are then worse than absent. Resist "just this one value".
  `artpoint.md` is the documented exception: Artpoint publishes no artist
  specification, so there is nothing to point at. Its delivery table carries
  real values **with a provenance stamp and a date** — keep both, and do not
  copy the pattern to a sheet whose platform has public docs.
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

- **Text only in the repo.** The repo root is the plugin folder, and Anthropic's
  directory refuses, from non-Verified organizations, any file that is not
  Markdown, text, JSON, YAML or a PNG/JPEG/GIF/WebP/ICO image, or that starts
  with `#!`. No `.mjs`, no `.html`, no fixture. CI code lives inline in the
  workflow YAML (see `link-check.yml`).
- **Frontmatter: standard keys only.** A misspelt or custom key in a skill's
  frontmatter also gets a version refused.
- **The checks are a spec, not a script.** `references/verification.md` says what
  the harness must do; Claude writes it in the artist's project. Keep the spec
  precise enough to rebuild the same harness twice — launch flags, the "done"
  signal, pixel hashing in the page.
- **Zero dependencies in the plugin.** No package.json. Playwright lives in the
  artist's project.
- The version lives in `.claude-plugin/plugin.json` only. A release = bump it
  there + add a `CHANGELOG.md` entry (the update-communication channel).

## Testing

```
claude plugin validate .                                 # must pass
git ls-files | grep -vE '\.(md|txt|json|ya?ml|png|jpe?g|gif|webp|ico)$'
                                                         # only .gitignore, LICENSE, the icon (ci.yml enforces it)
```

After changing `verification.md`: give a headless session the plugin and a
sample sketch that follows the contract (`claude -p --plugin-dir .`), have it
write the harness, and check it passes the sketch and FAILs a `Math.random`
copy. Read the harness it wrote — that is what artists will run.

Never commit `node_modules`.
