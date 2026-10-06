# Golden Lion Auctions

A new online auction for exotic and collector cars, launched by Patton Motors
(Pompano Beach, FL). It keeps Bring a Trailer's auction architecture with a
luxury presentation. The difference from BaT: every listing is documented to one
standard by Golden Lion (a third-party specialist plus AI on the VIN and photos,
then a human check), not written by the seller.

**Status, 6 Oct 2026: HOME v2 is built** as a static clickable prototype (stage 1),
on the layout grammar of Alex's concept boards (`__CONCEPTS/1`, `__CONCEPTS/2`).
The lot page is a stub. The SRP and the full lot page are stage 2.

## Pick up here (next session)

1. **Images: Alex makes them himself.** Don't generate more. When new images
   arrive, drop them into `assets/` and point `stage_image` in `data/lots.json` at
   them, then regenerate `data/lots.js`. The 12 current hall images are staged
   composites: real Patton car pixels on a generated hall, captioned as staged.
2. **Still weak:**
   - the Recently sold thumbnails are raw showroom photos;
   - Alex hasn't reviewed the v2 layout yet;
   - the font choices are not confirmed.
3. **Open with the client:** the name (Auctions vs Collection), a vector logo, and
   original high-res photos (BRIEF.md).
4. **Then stage 2:** the SRP and lot page on the same `lots.json`.

## Run it

```
python3 -m http.server 8731     # from this folder
open http://localhost:8731/
```

No build step. Fonts come from Google Fonts. GSAP, ScrollTrigger and Lenis load from
CDNs. Everything else is local.

## What HOME contains (v2)

| Section | What it is |
|---|---|
| Header | Centred lockup (hallmark + GOLDEN LION), quiet nav left, search · Sign in · hairline Register to bid right |
| Hero | Full-bleed hall scene, Miura on a platform. A centred stack over the car: LIVE chip · Lot 01 of 12 · name · data strip (current bid sample · ends in d·h·m·s · reserve/bids) · brass View lot + Watch. Brass corner brackets |
| Live auctions | A sheet overlapping the hero: tracked label, centred head, tabs (Live / Ending soon / No reserve), 12 cards on the staged images, live timers, Watch in the data row, header search filters the cards |
| Silence | One line: *Every lot is examined before it is offered.* |
| Golden Lion Verified (peak) | Pinned (DNA95). A **paper inspection record** (sample) over the dark hall: VIN with decode, five checks, specialist sign line, struck hallmark. Valour on the right |
| Recently sold | Cream band, 6 real Patton sold cars as a ledger; prices are sample |
| Consign | A cream paper panel over a dark frame: VIN form (validated, nothing is sent) + Patton address |
| Finale | Full-bleed scene with the struck hallmark and GOLDEN LION above the cars |
| Footer | Nav plus the page-wide sample-data notice |

`lot.html?id=<feed id>` is a stub lot page. On phones the hero stacks: text first,
then the car.

## Files

| Path | What it is |
|---|---|
| `index.html`, `lot.html` | the pages |
| `css/gla.css` | all tokens (top of the file) and styles |
| `js/home.js` | framing (the car box, not the photo, sets each crop), tabs, search, watch, clocks, Lenis + GSAP motion |
| `data/lots.json` → `data/lots.js` | 12 lots and 6 sold. Car, VIN, mileage and photo come from Patton's feed; bids, timers, counts, reserves and results are **sample**. `stage_image` / `stage_box` point at the hall images. Regenerate lots.js after editing the JSON |
| `assets/lots/` | Patton feed photos, 1920px `main/l`, unaltered |
| `assets/stage/gen-gla-hall-*.jpg` | the 12 staged lot images. Provenance in `gen-gla-hall.json`; per-image car registration in `hall-registration.json` |
| `assets/stage/full-mask-*.png`, `mask-*.png` | car silhouettes (pixelcut), used to lay the real car back and for the old house-light mask |
| `assets/mark*.svg` | the working hallmark: a lion passant in an assay cartouche. The lion is public domain (Fox-Davies via Wikimedia Commons), not from the client's art |
| `__CONCEPTS/1`, `__CONCEPTS/2` | Alex's concept boards. The layout direction comes from these |
| `clients bullshit/` | what the client sent; reference only |

## Checked

- Desktop 1440 and phone 390; no horizontal scroll; no console errors.
- Every staged image: car pixels registered back from the original photo and checked by eye for ghost edges.
- kill-ai-slop scan clean (intentional hits pinned with `deslop-ignore`).

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

Repo: https://github.com/Sigovs/Golden-Lion-Auctions
