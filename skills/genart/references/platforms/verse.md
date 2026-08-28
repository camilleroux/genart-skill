<!-- Verified: 2026-08-28 -->

# Verse

**In one line** — Ethereum; HTML+JS deployed to IPFS, hash generated at sale
time and handed to the page.

## Mental model

- **The hash arrives through the URL**, encoded, with edition info — the only platform here using a query param rather than an injected global. First thing to handle when porting in or out: a missed param silently falls back to a random seed and everything looks fine locally.
- You ship a **web page** (entry HTML + assets) to IPFS — self-containment still applies: what is not in the bundle will not exist in ten years.
- Features on a global object; preview captured automatically after sale but steerable (aspect ratio, explicit trigger, supplied image); animation accepted.
- The artist owns the contract.

## Docs — start at `https://docs.verse.works/`

Paths have **no `/docs/` prefix** (a stale prefixed link 404s and looks like
the page is gone): `/projects/generative-verse/` (the generative JS model),
`/guides/new-project/`, `/for-developers/`, `/contract/basics/`,
`/sales-mechanics/…` (edition types change the data your page receives).

## Check before you code

URL parameter name and decoded content · features object name · capture API
and aspect ratio control · expected IPFS bundle structure · which sales
mechanics affect the payload.

## Traps by design

Porting from an injected-global platform and missing the URL param · a CDN
reference left in the bundle · stale `/docs/`-prefixed links.
