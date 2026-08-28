<!-- Verified: 2026-08-28 -->

# Highlight

**In one line** — EVM multi-chain, self-serve, no application: a web project
bundled with a required platform script, wired to the mint by the platform.

## Mental model

- The **platform script (`hl-gen.js`) is the whole interface**: seeded randomness, token data, trait declaration, preview capture. Your code talks to it, never to the chain.
- The **seed derives from the mint transaction + token** — random functions arrive pre-seeded. Keeping your own PRNG (for portability) is fine, but seed it from the script's data and **never consume from both streams**.
- **Mint context is exposed** (minter, chain data) — the 256ART trade-off in milder form: deliberate use is legitimate, accidental use is the bug.
- Curated vs open flows assign hashes differently — check which applies.

## Docs

`https://github.com/highlightxyz/generative-art` — the canonical repo: the
script, README, FAQ, examples. **Read the script's source; it is short and it
is the contract** — prefer it over any summary, including this one.
`https://support.highlight.xyz` — creator knowledge base (generative flow,
upload, testing).

## Check before you code

What the script exposes (random, token data, mint context, traits, capture) ·
seed derivation and the curated-flow difference · bundle contents and entry
point · trait typing and when traits are read · capture trigger and size ·
available chains.

## Traps by design

Consuming from your PRNG *and* the platform's (two streams, order bugs) ·
reading mint context unintentionally · testing only one of curated/open ·
forgetting the platform script in the bundle (local stub works, upload fails).
