# Golden Lion Auctions — product brief

Working document, 5 Oct 2026. Source material and decisions are in [BRIEF.md](BRIEF.md).
Where the two disagree, BRIEF.md decisions win.

## The product in one sentence

**An online auction for exotic and collector cars that works like Bring a Trailer,
where every car is documented to the same standard by Golden Lion, not written by
the seller.**

Patton Motors is the business behind it: it supplies the cars, the credibility and
the room in Pompano Beach. The interface brand is **Golden Lion**, not Patton.

## Design Read (draft, for step 4)

```
Reading this as an auction marketplace home for buyers of $300k–$3M cars, leaning luxury-automotive.
Mandate: REBRAND — new product; only the name Golden Lion Auctions is fixed.
Style mode: to be decided at the art-director step.
Dimensionality: ABSENT for now — the photos are flat showroom shots; depth comes from tone and overlap.
```

The lion (the logo, the video, the poster) is **not** a factor in the design right
now (Alex, 5 Oct 2026). Leave it out of composition and concept decisions.

## BaT parity / the Golden Lion difference

| | Like BaT (parity) | Golden Lion (difference) |
|---|---|---|
| Listing | Full lot: gallery, video, description, specs | **Made by a third-party specialist, not the seller.** One standard photo set, a start/run video, flaws, documents |
| Data | VIN, mileage, location, seller | **AI on the VIN and photos:** decode → specs → draft → missing shots flagged. A Golden Lion person approves before it goes live |
| Trust | Comments, seller Q&A | **Golden Lion Verified** report on every lot |
| Auction | Current bid, timer, reserve / no reserve, anti-snipe extension, watchlist | Same. Nothing to reinvent |
| Account | Registered bidder, My bids, Watchlist | Same |
| After | Results archive, sold prices | Same |
| Look | Working feed, functional | **Exotic/luxury presentation.** (The pedestal is parked; for now, the feed photos as they are) |

## Site map (full product; we design part of it)

- **HOME** ← now
- **Auctions / SRP**: live, ending soon, no reserve, filter by make, year and price, search ← next
- **Lot page**: gallery, video, bid box, timer, Verified report, VIN/specs, comments/bid history, fees and shipping ← next
- Results (archive of sold cars)
- Sell / Submit: VIN → basic info → review → third-party capture → AI package → approval → live
- How it works · Account (My bids, Watchlist) · Sign in / Register to bid

## HOME: masses in order

Marketplace first, brand second. The auction activity is the main content.

1. **Header.** Logo, nav (Auctions · Results · Sell · How it works), search,
   Sign in / Register to bid. The header counts as part of the composition.
2. **Hero: the lead lot.** One lot on the feed photo as it is (the pedestal is parked). Name,
   current bid, time left, "View lot". The first screen says what this is: a car
   auction, not a dealer.
3. **Live auctions.** A feed of the 12 lots: tabs Live / Ending soon / No reserve,
   cards with bid, timer, bid count and watch. No pins; fast.
4. **Golden Lion Verified.** How a listing is made, from VIN to third party to AI to
   human check. This is the brand section, and the pin rule (DNA95) is allowed here.
5. **Recently sold.** Results from the sold cars in the feed.
6. **Sell with Golden Lion.** VIN input as the first step.
7. **The house.** "Backed by Patton Motors, Pompano Beach".
8. **Footer.**

Three to seven masses, not counting header and footer.

## Auction hooks already in HOME

A card and the hero read from one local `lots.json`. The structure is designed for
the lot page and SRP up front:

`id · feed_id · year · make · model · vin · status (live|ending|sold|upcoming) ·
current_bid · bid_count · ends_at · reserve (yes|no|met) · watchers · comments ·
verified · location · images[] · stage_image · video`

Timers count down live in the browser from `ends_at`. Watch and tabs work. Bids are
**not** placed. Everything numeric is marked as sample data.

## What we hand over

- **Stage 1:** HOME as a clickable mockup, local plus git. Static, no build step.
  Lenis from the first build.
- **Stage 2:** SRP and the lot page on the same `lots.json`.
- **Not in the delivery:** a working platform (accounts, real bids, payments,
  escrow, documents, shipping). The prototype shows them but doesn't do them.

## Content

- **Lots:** the 12 from the working list in BRIEF.md. **Photos come from Patton's feed
  as they are** (the `main/l` version, 1920px): a white showroom, one angle. The
  pedestal is parked (BRIEF.md decision 7).
- **Bids, timers, counts, Verified reports:** sample data, marked.
- **Copy:** in English. Don't invent facts about Golden Lion, such as the number of
  inspectors, guarantees or how long things take.
