<!-- Verified: 2026-08-28 -->

# Art Blocks

**In one line** — Ethereum; the curated reference platform. Your script is
stored onchain and executed by an onchain generator that assembles the page.

## Mental model

- **One JS file, one library max**, from a **closed registry** of pinned versions, injected by the generator — a `<script src>` you write will never run.
- Hash + token id arrive in an **injected global**; the token id encodes project and invocation number.
- Features are set **synchronously on a global** and must be computable **outside a browser** (no canvas) — traits decided while drawing cannot onboard.
- **Bytes cost gas**: deployment cost is proportional to script size; the practical ceiling is far below any technical limit.
- Preview: a configured delay, or an explicit ready signal with a placement requirement that catches people out — check it.
- **Engine / Flex** = same protocol, different curation; Flex adds external assets (changes the "no network" default). Prohibition (Base), Bright Moments and Plottables (own sheet: `plottables.md`) are Engine deployments — this contract applies there too.

## Docs — start at `https://docs.artblocks.io/`

| Page | Answers |
|---|---|
| `creator-onboarding/artists/1-building-your-project/` | The core contract: injected globals, libraries, size, features, preview |
| `creator-onboarding/artists/2-staging-and-testing/` · `3-mainnet-launch/` · `faq/` | Staging, launch, edge cases |
| `creator-onboarding/artists/flex-assets/` | Engine/Flex external assets |
| `protocol/on-chain-generator/` · `protocol/postparams/` | Page assembly; post-mint params |

Community starter (unofficial): `https://github.com/ArtBlocks/artblocks-starter-template`

## Check before you code

Injected global's name and fields · invocation derivation · approved libraries
and versions **today** · features API and accepted types · preview mechanism
and where the opt-in must live · size guidance and cost model · expected
testing (how many hashes, which browsers).

## Traps by design

Traits computed during render (fails headless) · a second library (there is
none) · bundling instead of declaring a library · assuming last year's approved
version · forgetting the generator injects its own page styles.
