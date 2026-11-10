<!-- Verified: 2026-11-09 -->

# ABX

**In one line** — Art Blocks' self-serve protocol on several EVM chains: you
deploy your own contract from a CLI, no application, no curation. A code
project's script can live onchain and be assembled by an onchain generator.

## Mental model

- **The CLI is the platform.** No submission form: `abx` deploys, mints and operates the contract. It ships its own agent skill, versioned with the CLI — install it and let it drive the chain side rather than rebuilding commands from this sheet. The split: this plugin owns the sketch and the checks, ABX's skill owns the deploy. Expect a one-time browser login by the artist (service account, sponsored signer), and a hosted resolver to be told about the project after deploy — the skill has the commands.
- **Two shapes of code project**: a *template* (script stored onchain, page assembled by the generator, libraries declared from a registry at deploy — a `<script src>` you write will not run) or a *directory* (an `index.html` bundle on IPFS, Arweave or a URL). Template for maximum permanence, directory for a real bundle.
- **Token data arrives from outside** — chain, contract, token id, seed, plus any parameters — injected by the generator, or as one encoded URL parameter carrying the whole token data. A small runtime helper resolves both paths; a bare gateway link gets the token's coordinates but no seed.
- **The seed is assigned at mint**, pseudorandom and replayable, inspectable by contract callers and block builders. Fine for variety, not for a prize.
- **Each public surface is its own decision** — animation, still image, traits, parameters. An onchain script does not make the image or traits onchain: the program reports traits and signals done, but marketplaces only see them through a render service (hosted resolver, managed or self-run) or a Solidity field renderer. Fully onchain resolution with neither ships a placeholder image and no traits. The deploy dry run prints a surface readout — read it with the artist.
- **Done is a signal you send** — the capture point for the render service's still. The managed renderer is headless and CPU-only: WebGL needs another capture plan. Ask the CLI for the renderer's current constraints.
- **Post-mint parameters exist** — typed state the creator, the holder or a named address can change after mint, until it locks, so the piece takes inputs beyond the seed. Declared on a code project; a static contract cannot gain them. They do not become traits on their own.
- **Several deploy choices are permanent** — contract family, edition shape, burnability; the royalty cap only moves down; locks are one-way. *N unique outputs* and *copies of one output* are different contracts — "an edition of 10" usually means ten unique outputs. Testnets are paired with each mainnet: prove the piece there first.

## Docs — start at `https://docs.abx.io/` (agent index: `/llms.txt`; each page also serves as `<path>.md`)

| Page | Answers |
|---|---|
| `docs/protocol/code-projects` | Token data, seeds, the generator, traits, done signal, still capture |
| `docs/protocol/params` | Post-mint parameters |
| `docs/using-abx/agent-and-skill` | Installing ABX's agent skill — then hand the deploy to it |
| `docs/using-abx/guides/deploy-a-digital-asset` | 1/1, series, code project or edition |
| `docs/reference/deployments` | Which chains today, each one's support level, which have a dependency registry |
| `docs/protocol/owner-powers` | What stays mutable, what locks |

## Check before you code

The token-data global and URL parameter names · how the helper reports traits
and done · whether the target chain has a dependency registry at all, or
directory mode · each chain's support level · the managed renderer's
constraints · where image and traits will come from · edition shape and supply ·
what you will lock, and when.

## Two checkers, two jobs

The CLI re-renders seeds in fresh contexts inside the real generator document
and compares pixels and traits. `check.mjs` adds A-B-A contamination and
distinctness, behind a dev page that loads the script, feeds `?hash=` in as the
token data's seed and stubs the helper (`self-hosted.md` contract). Only the
script deploys — keep that page out of any directory upload. Each tool brings
its own headless browser build.

## Traps by design

Traits decided while drawing · a `<script src>` in a template script ·
forgetting the done signal · onchain resolution with no image or trait source ·
WebGL left to the headless renderer · a mainnet deploy before the testnet run ·
locking a URI to a domain you do not own · a mutable registry library in a piece
sold as permanent · the seed treated as lottery randomness.
