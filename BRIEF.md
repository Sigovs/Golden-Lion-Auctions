# Golden Lion Auctions — brief (as received, 5 Oct 2026)

**Working name: GOLDEN LION AUCTIONS.**

A new product launched by Patton Motors: an online auction for collector and exotic cars.

## What the client asked for, in their words

- "Keep all the things that Bring a Trailer does right and create a better product
  that utilizes A-I." Reference: https://bringatrailer.com/auctions/
- What BaT doesn't offer: **a third party, not the seller**, produces the listing.
  That means full photos, a start-up video and the details. **AI runs on the VIN and
  the full photo set.**
- Manager: "take all information BAT and then make it exotic/luxury, and use his
  videos/logos."
- Imagery: "cars on stand". Real HD photos of the cars, **AI only for the auction stage**.
- More details promised "within a few days". There were also items "discussed over
  the phone" that we haven't received.

## Assets on disk (`clients bullshit/`)

- `golden-lion-online-car-auction (1).mp4`, with `45798.mp4` as a byte-identical
  duplicate: a 15s **vertical** 768×1344 video with audio, AI-generated. A lion walks
  through a black and gold showroom and the piece ends on a shield reading "GOLDEN
  LION COLLECTION" with the line *"Curated cars. Smarter bids. / Join the online auction"*.
- `image (4).png`: 1024×1536, AI-generated. It is the same end-card as a still: a
  lion-head shield with "Golden Lion / Collection", and the tagline.
- `logo.png`: 1122×1402 raster on white, no transparency, no text. It shows a
  **rampant** gold lion on a black shield, with green/white/red bars across the top.
  It reads as AI-rendered, with texture and a glow.
- **These are two different marks.** The video and poster use a lion head with the
  name; logo.png uses a full rampant lion with the tricolour. Neither is a vector.
- `../patton old files videos/goldenlogo.svg` is the *Patton Motors World Wide*
  logo, not Golden Lion.

## Where the real cars come from: pattonmotors.com

Current site: https://www.pattonmotors.com/. It is the source of the cars, not of the
design (decision 6).

- **Open inventory feed, no auth:** `https://www.pattonmotors.com/api/cars`
  (`?id=N` for one car). Checked 5 Oct 2026: 71 cars, 39 available and 32 sold.
  Nearly every car has a VIN (70), 43 have a YouTube video, and almost none show a
  price (price on request).
- Fields: year, make, model, trim, mileage, colours, VIN, YouTube_url, image_link,
  carfax, sold/pending.
- **Photos are all the same shot:** one white showroom, the same angle, the same
  light. For the pedestal (decision 3) that's a plus, because the cut-out is clean
  and every car sits on the stage the same way.
- **Sold cars are ready-made "Recently Sold / Results"** content for HOME, and
  available cars are the lots. Bids and timers stay sample data.
- Consume the image URLs the feed gives. Don't build them by hand.

### The lots: max 12, the most expensive (Alex, 5 Oct 2026). Don't pull the whole inventory.

Only 3 of the 39 have a price in the feed, so the ranking is **our working market
estimate, not his prices**. It's a working list:

| # | feed id | car | note |
|---|---|---|---|
| 1 | 82 | 2025 Alfa Romeo 33 Stradale | |
| 2 | 73 | 1972 Lamborghini Miura P400 SV | |
| 3 | 79 | 2024 Aston Martin Valour | |
| 4 | 8 | 1967 Alfa Romeo 33 Stradale | |
| 5 | 68 | 1965 Shelby Cobra 427 S/C | id 69 is a second one |
| 6 | 49 | 2009 Mercedes SLR McLaren Roadster 722 S | |
| 7 | 35 | 1955 Mercedes 300 SL by Kindig Design | |
| 8 | 19 | 2022 Ferrari SF90 Spider | |
| 9 | 70 | 2006 Ford GT | id 71 is a second one |
| 10 | 41 | 1955 Mercedes 300 SLR #658 by Scuderia Bucci | $475,000 in the feed |
| 11 | 36 | 1956 Ferrari 612 TR by S-Klub Tempista | |
| 12 | 76 | 1974 Boss 429 De Tomaso Pantera | $299,999 in the feed |

Left out:
- The 1965 Ferrari 250 GTO Coupe (52) and the 1961 Testa Rossa (55). These are most
  likely recreations, so their value is unknown. If they're originals, they go to the top.
- Duplicates (the second Cobra and the second Ford GT).
- Ids 45, 74 and 81, which are empty rows in the feed.

## Open with the client

1. ~~Name~~: the working name is **GOLDEN LION AUCTIONS** (Alex, 5 Oct 2026). The
   video and poster say "Collection", so confirm with the client at some point.
2. Which mark is the logo: the lion-head shield with the name, or the rampant lion
   with the tricolour? We need it as a vector (SVG/AI/PDF).
3. Horizontal / desktop cut of the video, or the source files.
4. ~~Scope~~: decided, see Decisions. (Was: homepage only, or the lot page (gallery, VIN
   report, bidding, comments, results)?)
5. What exactly did the phone call add?

## Constraints we hold

- GI3: a generated stage must not pose as Patton's real room, and no car is ever
  generated. If a real car photo is composited onto a generated stage, it is marked
  as a composite.
- Bids, countdowns, VIN/AI reports and counts in the mockup are **sample data and
  labelled as such**.
- **Dark ground: decided** (decision 4). The reason is stated and it isn't taste:
  the client expects dark, and a light version won't get past him.

## Decisions (Alex, 5 Oct 2026)

1. **Deliverable, in order:**
   - **HOME first**, built with the auction hooks already in place: lot cards, a bid
     and timer slot, status (live, closing, sold) and watch.
   - **Then SRP** (the auction list with search and filters) and **the lot page**.
   - Format: a mockup prototype with limited function, local plus a git repo
     (https://github.com/Sigovs/Golden-Lion-Auctions.git). It is
     not a working platform.
2. **BaT is the functional benchmark.** It's a serious site, and we trust its
   architecture without relitigating it.
3. **Cars on the stage: we meet the client.** His cars (he has many) are photographed,
   and the photo goes through AI onto the Golden Lion stage. The caveat that keeps
   GI3 intact: **only the background is replaced, and the car's pixels stay
   photographic.** It is a cut-out, not img2img/regeneration of the body. The shot is
   marked as a staged composite, and the lot's full gallery stays as raw captures.
4. **The lion and the client's assets (the logo, video and poster) are ignored in
   the design.** He sent them, but they aren't the material to work from.
   **The ground is dark** (Alex: the client won't accept light). Beyond that the
   scheme is open. Gold is possible as the client's hint, but **restrained**: gold as a rare accent, not as a ground or a
   glow. In bulk, black and gold reads as kitsch, like a casino or a gypsy palace.
   That is the failure to avoid. The luxury comes from the cars and the air around
   them, not from gold. (Supersedes the earlier "black/gold/lion isn't up for debate".)
5. **Copyright and trademark are out of scope for now.** This is a mockup, and those
   questions get settled on the spot as they come up. Don't raise them.
6. **Start from zero.** The old Patton home (index3–index7) isn't taken as a base, not
   even as a structure.

## The client's material: what he wants to say → how we say it

Look at it, don't use it (CLAUDE.md). Framing for the client: "your idea, finished".

| What he sent | What he means | How we say it |
|---|---|---|
| Black and gold showroom in the video | Prestige, a stage, drama | A dark ground (decided) with real lighting craft on the stage: a spotlight, a reflection in the floor. The drama comes from light, not from gold |
| Gold everywhere | "This is expensive" | Gold as a rare accent: the live state, a thin line, the mark. He sees gold, but it is never a ground or a glow |
| A shield with a crest | Heritage, rank, a "house" | Later, once there is a real logo: a clean redrawn mark used small. For now, the wordmark only |
| Serif caps "Curated cars. Smarter bids." | Seriousness, a curated selection | A restrained serif display, and the idea of curation carried by the 12 lots instead of 1,000 |
| "Cars on stand" | Every car is a star | The pedestal: a real car on a generated stage. This is his main "wow", and the hero rests on it |
| A vertical AI video | Wants motion, an atmosphere | Not on the page. If he asks: a slot on mobile or in the brand block |

Tactics:
- Show **one finished direction**, without variants. Variants invite him to pick his own draft.
- Speak to him in his own words from the emails: "on stand", "HD photos", "like BAT", "luxury".
- Put the strongest move where he'll look first: the hero stage. If that lands, the rest goes through.
7. **Lot photos for now: as they are** (Alex, 5 Oct 2026). Lots use Patton's feed
   photos unchanged (the `main/l` version, 1920px). The pedestal is parked. The
   first pilot (`assets/stage/gen-gla-stage-miura-pilot.jpg`) was rejected: the
   light and perspective don't match and the stage reads as a stock mockup. If we
   come back to it: generate the surroundings onto the whole real photo, then lay
   the original car cut-out on top.
8. **The staged setting is back, and Alex's concepts lead (5 Oct 2026).** Alex rated
   the as-is showroom photos 1/10 and supplied concept boards (`__CONCEPTS/1`,
   `__CONCEPTS/2`; layouts "7/10 on every example").
   - Lot images are now staged composites: the unaltered Patton car is laid back
     pixel-for-pixel on a generated hazy industrial hall with a low platform
     (`assets/stage/gen-gla-hall-*.jpg`, provenance in `gen-gla-hall.json`).
     They are captioned as staged.
   - **From here, Alex makes the images himself. Don't generate more.**
   - The layout follows the concept grammar:
     - a centred hero stack over the car, with a brass LIVE chip, a data strip,
       a brass View lot button, and corner brackets;
     - the lot floor as a sheet overlapping the hero;
     - tracked-caps section labels between hairlines;
     - Verified shown as a paper inspection record over the dark hall, with
       the struck hallmark;
     - a cream results band;
     - Consign as a paper panel over a dark frame;
     - a closing full-bleed scene with the wordmark.
   - Brass now also fills the primary CTA, as the concepts do.
9. **Slogan and CTA: the client's own words, kept (Alex, 6 Oct 2026).** From the
   client's poster and video end card (`clients bullshit/image (4).png`):
   - **Slogan:** *Curated cars. Smarter bids.*
   - **Primary CTA:** *Join the online auction*

   These are the client's sentences, so use them as written; it's the poster artwork
   that stays unused, not the words. Place them where a tagline and a primary call
   to action belong (hero, finale, register-to-bid).
