# Golden Lion Auctions

A new online auction for exotic and collector cars, launched by Patton Motors
(Pompano Beach, FL). It keeps Bring a Trailer's auction architecture with a
luxury presentation. The difference from BaT: every listing is documented to one
standard by Golden Lion (a third-party specialist plus AI on the VIN and photos,
then a human check), not written by the seller.

**Status, 5 Oct 2026: concept v2 is written and nothing has been coded.** The
next step is building HOME as a static clickable prototype.

## Read in this order

1. **[BRIEF.md](BRIEF.md)** covers what the client sent and Alex's **Decisions**.
   The decisions win over everything else here.
2. **[PRODUCT-BRIEF.md](PRODUCT-BRIEF.md)** gives the product in one sentence, the BaT
   parity / Golden Lion difference table, the site map, the HOME masses and the
   `lots.json` structure.
3. **[CONCEPT.md](CONCEPT.md)** is the art direction for HOME (v2, current). It
   combines credibility, precision and an auction-evening aura.
   [CONCEPT-v1.md](CONCEPT-v1.md) is the rejected version, "too archival and dry".
4. **[REFERENCES.md](REFERENCES.md)** is the vault read: Semler (SRP/VDP), Rolls-Royce,
   and RM Sotheby's as the anti-reference.
5. **[CLAUDE.md](CLAUDE.md)** holds the working rules for agents: Design DNA, Lenis,
   the pin rule for big sections (DNA95), and how to treat the client's material.

## The main points in brief

- **Working name: GOLDEN LION AUCTIONS.** The client's materials say "Collection".
  Not confirmed yet.
- **Stage 1 delivers HOME only,** with the auction hooks in place (lot cards, bid,
  timer, tabs, watch). **Stage 2** is the SRP and the lot page. It is a prototype,
  not a working platform. All bids, timers and reports are **sample data, marked**.
- **The ground is dark** because the client won't accept light. **Gold is an accent,
  not a ground.** In bulk, black and gold reads as kitsch.
- **The client's material (`clients bullshit/`) is cheap AI.** Read it for intent,
  never use it as material. We present the work as "your idea, finished".
- **Lots:** the 12 most expensive cars from Patton's feed
  (`https://www.pattonmotors.com/api/cars`). The list is in BRIEF.md. **Photos are
  used as they are** (the 1920px `main/l` version).
- **A car is never generated.** Only the surroundings may be generated, and a
  composite is marked as one.
- **The pedestal is parked.** The first pilot (`assets/stage/`) was rejected: the
  light and perspective don't match and it looks like a stock mockup. The route back
  is in BRIEF.md decision 7.
- **The brief contradicts itself, and that's normal.** Make a working decision, write
  it down, and keep moving.

## Folders

| Path | What it is |
|---|---|
| `clients bullshit/` | What the client sent: an AI video, a poster, logo.png. Reference only |
| `PJEDESTAL. IMAGE POSSIBLE/` | Patton photos Alex collected as pedestal candidates (Porsche 550, Ferrari 612 TR, De Tomaso Pantera). Not reviewed yet |
| `assets/stage/` | The rejected pedestal pilot, with a provenance sidecar |

Repo: https://github.com/Sigovs/Golden-Lion-Auctions
