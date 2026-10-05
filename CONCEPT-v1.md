# Golden Lion Auctions — HOME concept

Art director, 5 Oct 2026. Delivery mode **BUILD**: one direction, no variants. This
is what `designer` builds, what `design-critic` reviews against, and what Gate 5 is shown.
Where this file and BRIEF.md decisions disagree, BRIEF.md wins and this file gets
corrected.

Manifest resolved at `/Users/alex/Desktop/WORK/design_dna/TASTE.md` (the canonical Mac path).
Build standard: `.claude/rules/design-dna.md` (DNA1–DNA95). Skills read: color-taste,
typography-taste, academic-composition (C17), the auction-editorial, technical-luxury
and HYBRID dialect files.
Vault: 5 relevant references, 0 unusable for missing notes (read in REFERENCES.md).

---

## 1. Design Read

```
Delivery: BUILD.
Reading this as an auction-marketplace home for buyers and consignors of $300k–$3M collector and exotic cars, leaning auction-catalog.
Mandate: REBRAND. Only the name GOLDEN LION AUCTIONS is fixed. Palette, type, voice, structure and surface are invented; the lion, logo, video and poster are excluded.
Style mode: HYBRID. Anchor auction-editorial / contrast technical-luxury / signature none. Unifying principle: the lot is a record before it is an advertisement.
Dimensionality: ABSENT. The photos are flat showroom captures, so depth comes from tone, the plate edge and overlap; a scene would cost the scan.
```

**Why dark (DNA22).** The client won't accept light (BRIEF decision 4), so dark is a
constraint here, not a reason to believe dark means expensive. EVIDENCE C2e and D1 still
hold: nothing is known about Alex's colour preference, so everything past the ground is
derived (section 5).

**Control map.** auction-editorial owns composition and grid, hierarchy, spacing and
rhythm, motion, and colour restraint. technical-luxury owns information presentation (the
data line, the chassis line, the VIN decode, the ledger), containers (hairlines, square
machined edges) and image behaviour (evidential, comparable framing). The visitor's task
owns CTA rank. technical-luxury stops at the data layer: no mono prose, no crosshairs, no
fake instruments, and no figure without a source or a sample mark.

**Asset dependency (C17).** The identity is carried by the **record system**: the dark
mat, the square plate edge, the chassis line and the tabular data line. It is not carried
by the photographs. The photos come from a feed, they vary in framing (a wide room, a
tight three-quarter, two or three cars in one frame) and they will get worse as lots are
added. The test the build must pass: put the 300 SLR pair or the Cobra trio into the hero
slot and the page has to stay recognisably itself.

### Hero declaration: full-screen scene, not full-frame object

| | |
|---|---|
| viewport ownership | The full first screen (100svh minus the 64px header). |
| scene treatment | **The page's dark field is the scene. The photograph hangs in it as a lit print.** It is never full-bleed. A full-bleed shot would make Patton's busy room (the brand-logo wall, red curtains, a glossy white floor) the dominant, and C13 says the car has to be. |
| object scale | Car = 55–65% of the plate width, which is about 35–40% of the viewport width. |
| focal point | The Miura's nose and front wheel. The car faces left, so it gets lead room on the left of the plate. |
| negative-space region | Dark field above the record column and below the plate. It isolates the subject and gives the countdown room to be read. |
| text safe zone | Grid columns 1–4 on the left. Type never touches the plate. |
| desktop crop | Lot 73 at `main/l`, 1920×1279. Window x48 y113, 1550×1033 (3:2). The car sits at about 55% across, with the floor kept to ≤18% of the plate below the tyres. |
| mobile crop | Authored separately at 4:3: window x356 y380, 1090×818, car ≈85% of the width. The plate runs full width inside the 16px gutters and the record sits below it. |
| asset suitability | Suitable. The source width holds ≥1× at a 2× DPR on both crops. |

**Event statement:** one live lot with its clock already running.
**Primary subject:** the car. **Identity/headline mass:** the lot name in display serif,
with the one-line proposition above it. **Interface mass:** the data bar (bid, time,
bids, reserve). **CTA cluster:** View lot + Watch, under the data bar. **Active field:**
the ground. **Intentional negative space:** the band below the plate, which carries the
plate caption. **Excluded:** the header (persistent chrome) and the top edge of the feed
tabs if it shows at short heights.

---

## 2. Concept and signature

**Concept, in one sentence (it could be wrong):**
*Golden Lion files every car the way an examiner files evidence. The car is shown as the
photograph it is, named by its chassis, and given one live number, the bid. The page is
that register, not a showroom.*

**Signature move: filed under its chassis.** Every lot's second name is its chassis or
VIN, set in mono under the model name. Collectors already speak this way ("Miura SV
chassis 5066"), and only this product reads the VIN with AI. Feed masking is kept as it
is (`ZFF96NMAXN0XXXXXX` shows its Xs), and short pre-1981 chassis numbers stay short
(`5066`, `CSX 4532`, `MB6588`). At the peak the move opens up. The Aston Martin Valour's
full VIN, `SCFSBGKV0RGZ10077`, is set at display scale and split into its segments, each
with what the decode reads from it: maker SCF Aston Martin · model/body/engine codes ·
check digit 0, *valid* (computed: Σ=407, mod 11 = 0) · model year R = 2024 · plant ·
serial. It closes on a human sign-off line. It is static typography, so it survives
reduced motion and works on any photo, and none of the other builds could carry it. The
pedestal is parked, and nothing here depends on it.

---

## 3. HOME: five masses (header and footer counted separately)

PRODUCT-BRIEF's order is kept. **One change:** "Sell" and "The house" merge into a single
closing mass. On their own, "the house" is a logo line, and two small asks in a row make
the ending a tail. Merged, the page ends on an input, with the address of the people
behind it beside the field (DNA30).

| # | Mass | Job | Dominant | It is NOT |
|---|---|---|---|---|
| H | **Header** | Wordmark, Auctions · Results · Sell · How it works, search, Sign in, **Register to bid** | The wordmark, small | Not transparent, not changing state on scroll, no gold. Solid ground plus a bottom hairline from load. It is the only persistent layer (U10). |
| 1 | **The lead lot** (hero) | Says *car auction, live, now* in one look | The Miura plate | Not a carousel, not auto-rotating, not full-bleed, no headline over the photo, no scrim |
| 2 | **The floor** (live auctions) | Browse all 12, filter by tab, watch | The grid of plates, read as one collection | Not a bento, masonry or featured-size card. No Place Bid on cards, no badges. No pin. Equal cards are argued (DNA9): the lots really are parallel and equal in rank, and the Semler SRP keeps exactly this |
| 3 | **The record** (Golden Lion Verified), **the peak** | Shows the one thing BaT doesn't have, on one real car | The VIN at display scale beside the Valour plate | Not four icon columns, not a scanning animation, no AI sparkle, not a fake dashboard. Not abstract: it is one car, examined (C20 holds, because the buyer's motive is owning *this* car safely) |
| 4 | **Recently sold** | Calibrates value | A hairline ledger of six rows | Not cards (it is a different kind of mass, so the change of register is the pause). Not presented as Golden Lion auction results (see judgment calls) |
| 5 | **Consign, and the house** (closing) | Start a listing from a VIN; say who stands behind it | The VIN field | Not a full-bleed photo CTA band, not a newsletter, not a third repeat of the primary CTA |
| F | **Footer** | Nav, legal, the page-wide sample-data notice | — | Not an empty fade-out (C19) |

**Grid (DNA10).** 12 columns, 24px gutter, max content 1440px, side margin
`clamp(16px, 4vw, 64px)`. **Bleed rule: nothing bleeds.** Every photograph is a plate
inside the grid with square edges. The ground is the only full-width element.

**Ledger (read down the columns).** One ground throughout, with **one tonal exception:**
the closing mass sits on `--g1`, so the ending lands. Two voices on every section. Plates
are square-edged and unfiltered everywhere. Motion: countdowns tick in 1, 2 and 4, the
tabs crossfade in 2, and the pin runs in 3 only. The `ask` column runs act (1) → browse
(2) → read (3) → browse (4) → act (5), so no two adjacent masses make the same demand.

---

## 4. Feeling curve, shots, peak, silence, pins

| Act | Feeling, then its cause | Shot | Device |
|---|---|---|---|
| 1 Lead lot | **Appetite with a pulse.** The Miura and a clock already running | Reveal: a held establishing frame | None. Only the digits change |
| 2 Floor | **Absorbed choosing.** Twelve cars at one scale, each with its own number | Dolly: an even track down the rows | Tab crossfade |
| 3 Record | **Assurance.** A car's identity read out character by character and signed by a person | Push-in to macro: the VIN read up close | DNA95 pin, hold, scrubbed exit |
| 4 Sold | **Calibration.** What cars like these made | Cutlist: tight rows, quick | None |
| 5 Consign + house | **Invitation, grounded.** Your car to the same standard, with a street address beside it | Release: the page settles on an input | None |

**The peak is act 3, the record.** It takes the page's largest interval in front of it,
the most scroll room (≈1.9 viewports including the pin) and its largest typographic
event. The hero stays strong but is pitched lower: it is the plain fact. That way the page
develops toward something instead of spending itself on the first screen.

**Silence** sits between the floor and the record. It is the page's largest gap (≈20vh),
holding nothing but the record's single serif sentence as the section enters, and then
the DNA95 hold, where nothing moves. It is the one place the page stops selling.

**Pins: one only, the record (DNA95).** It pins at the section top, holds for about the
first half, then the text block (sentence, VIN decode and four-step ledger) rises 60–90px
and fades out, scrub 0.35, `ease:'none'`. The section releases with ≈0.9vh pinned on
desktop. The Valour plate stays still. The feed, sold ledger and closing never pin.
One pin means the peak owns the page's only held moment.

The four steps inside the record are a short numbered ledger, not columns:
VIN read by AI → third-party specialist captures the car (full photo set, start-up
video) → AI drafts the listing and flags missing shots → a Golden Lion person signs off.
The sign-off line carries the gold hairline. Durations, inspector counts and guarantees
are **not stated** (PRODUCT-BRIEF: no invented facts).

---

## 5. Palette and type

**Grounds and ink.** A cool graphite, deliberately. A warm brown-black next to gold is
the casino register BRIEF warns against, and it is also the generating model's default
(color-taste I5). Graphite reads as machined metal and stays neutral against the photos,
whose tops are black ceilings and walls.

| Token | Value | Use | On g0 / g1 |
|---|---|---|---|
| `--g0` | `#111316` | Page ground, header | — |
| `--g1` | `#181B1F` | The one tonal exception: the closing mass, plus the VIN field fill | — |
| `--ink` | `#ECE9E2` | Names, values, body, primary button fill | 15.35 / 14.25 |
| `--ink-2` | `#A8A59E` | Keys, chassis line, captions, form-field borders (also the ≥3:1 boundary) | 7.57 / 7.03 |
| `--rule` | `#2A2D31` | Decorative hairlines only, never a boundary that carries meaning | 1.35 |
| `--brass` | `#BFA26A` | The accent, two roles only | 7.61 / 7.07 |

No third ink step: `#7E7C77` measured 4.46 and is dropped. No `#000` and no `#fff`.

**The accent, and where it comes from.** Brass at oklch chroma ≈0.08. *Derivation:* the
name. The lion passant is the assay hallmark struck on precious metal once it has been
tested, so Golden Lion's gold marks only what the house has attested. The material check
is Patton's own room: the brass stanchions and gilt lettering in nearly every lot photo.
*Judged where it lands:* brass also occupies the logo wall inside the photos, so **it
never sits on or against a plate.** It lives in the data layer under the plates.
**Exactly two roles:**
1. **Live:** the status dot plus the "Live" label (on cards, in the hero, on tabs as the active marker).
2. **Verified:** the hairline and label of the "Golden Lion Verified" mark (once in the hero, and on the sign-off line in the record).

Never on prices, headings, buttons, the wordmark, focus rings, or anywhere as a ground,
glow or gradient. Budget under 2% of pixels. The client sees gold on the first screen,
twice, which is his idea finished. "Ending soon" uses no hue: under an hour the timer
goes to full `--ink` and gets the label "Ending". Red is excluded because the photos are
full of it and it reads as alarm.

**Type: two voices** (I8; ≤3 allowed). A record is typeset text plus typewritten data,
and two voices say that more clearly than three.
- **Source Serif 4** (variable, `opsz` 8–60, true italic) carries the display, lot names,
  section sentences, body and the hero bid figure. *Reason:* the client's "serif caps"
  intent, at a moderate contrast that its optical-size axis keeps intact at 20–26px. I10
  forbids a didone wherever display ranks fall below 40px, and they do here (card names
  ≈22px). Newsreader is not used, because it has been spent on 360 Auto Care and CMC
  (DNA36). Display is sentence case, and the one italic word is allowed only in section
  sentences ("documented by the house").
- **IBM Plex Mono** (400/500) carries data, chassis/VIN, keys, nav, tabs, buttons and
  timers. Nav, keys, tabs and buttons are uppercase and tracked 0.08–0.12em; values stay
  in their own case. *Reason:* the signature typesets VINs, so the zero must be told apart
  from O and 8 from B. Verify in the render.
- **Tabular figures** (`font-variant-numeric: tabular-nums`) on every bid, timer, count
  and VIN, so the ticking digits never shift their neighbours.
- **14px floor** for everything readable: keys, captions, "sample" marks, legal.
  Indicative scale (≥1.6× between adjacent ranks): hero name ~64 · section sentence ~40 ·
  card name ~22 · body 18 · data/keys 14–16. Hero bid ~44 serif tabular.

---

## 6. Data anatomy (the Semler SRP principle)

The photo takes most of the card, the data sits as one quiet layer under it, and there is
one restrained action. `lots.json` gains **`frame: {x,y,w}`** (normalised source crop) and
**`frame_m`** (the authored mobile crop for the hero and peak lots). `ends_at` is stored
as an offset from page load, so the prototype never shows every lot as ended.

**Lot card, in rank:**
1. Plate, 3:2, authored crop. The whole card links to the lot.
2. Lot name: `1972 Lamborghini Miura P400 SV`, serif ~22px.
3. Chassis line: `Chassis 5066` / `VIN ZFF96NMAXN0XXXXXX`, mono 14px, `--ink-2`. Mileage is shown only when the feed has a non-zero value.
4. Hairline, then the data line: **current bid** (largest figure on the card) · **time left** · bids, as tabular mono. Time format is `2d 14h` / `14h 32m`, and seconds show only under an hour (`32m 08s`).
5. Status at the head of the data line: `● Live` (brass) / `Ending` (ink) / `Sold` (ink-2). `No reserve` and `Reserve met` appear as words in ink-2 when true.
6. Watch: an icon plus count, a real `<button>`, 44px target, separate from the card link.
7. "Sample" carried in the key itself: `Current bid · sample`.

**Hero, in rank:** proposition line (`Collector and exotic cars at auction, each
documented by Golden Lion.`) → `● Live · Lot 01` → name across two chosen lines
(`1972 Lamborghini` / `Miura P400 SV`) → chassis line → the Verified mark (brass
hairline) → **data bar of 4: current bid (serif ~44) · time left · bids · reserve**, with
keys in mono 14px and sample-marked → **View lot** (solid ink button) + **Watch** (hairline
button). Register to bid stays in the header, so the page has no third repeated CTA.

**Sold ledger row:** small plate (3:2, ~120px) · name · chassis · result (`sample`).
Six real sold cars from the feed, for example the 2022 Bugatti Chiron (27), the 2006
Ferrari 575 Superamerica (9), the 1956 Mercedes 300 SL (12) and the 2022 Ford GT Alan Mann
(15). No sale dates, because the feed has none.

---

## 7. Image rules for the as-is showroom photos

What the photos actually are (six opened): Patton's room, with a black ceiling, a
gold-lettered brand wall, red velvet curtains, red pillars and a **glossy white floor
that is the brightest region of every frame**. They are *not* one uniform shot. Framing
runs from a wide room with the car at ~45% width (Miura, Valour) to a tight three-quarter
that fills the frame (Alfa 33, SF90), and some carry two or three cars (300 SLR pair,
Cobra trio). Several look heavily processed at the source.

1. **A plate, not an atmosphere.** Every photo is a square-edged print hung on the dark
   ground. It is never dissolved into the page with a gradient: over a white floor a fade
   to black makes grey mud and flattens the car. The hard edge between bright floor and
   graphite is what makes it read as a document.
2. **No type on any photo, ever,** and therefore no scrim anywhere. Legibility is solved
   by position (color-taste I4, the first rung of the ladder), and the white floor can
   never fail a contrast check.
3. **The car's size is the constant, not the frame's.** A per-lot authored crop puts the
   car at 70–80% of the plate width on cards and 55–65% in the hero and peak, so twelve
   different shots read as one collection. Uniform scale does here what Semler's single
   studio did there. Crops zoom inside a 3:2 window and never change the aspect.
4. **Crop limits:** never cut the car (bumpers, mirrors and wheels whole, DNA26). Floor
   below the tyres ≤18% of plate height. Lead room in the direction the car faces.
   Source width displayed ≥1× CSS width at 2× DPR, which means `main/l` everywhere.
   `object-fit: cover` with no authored position is a defect.
5. **Multi-car frames:** crop to the lot car if that is possible without cutting it.
   If it isn't (the 300 SLR pair), keep the frame and caption the lot (`Lot car: left,
   #658`).
6. **Nothing altered.** No CSS filters, grading, blur, vignette or overlay on any image,
   because each of those would alter the car too. No generated pixels (pedestal parked,
   GI3).
7. **The room is provenance, not a problem.** Under the hero and peak plates only, one
   mono caption: `Photographed at Patton Motors, Pompano Beach`. It is visibly true from
   the room itself, and it puts it on record that the car was in front of the house, not
   in a seller's driveway. Cards get no caption (device budget).
8. **Feed order is never re-sequenced for looks.** The tab decides the order (by `ends_at`).
   Rule 3 does the unifying.
9. **Hero lot = Miura (73)** (iconic, and blue against a red/black room). **Peak plate =
   Valour (79)**, because it has the only complete 17-character VIN among the lots.

---

## 8. Motion

**Budget.** *Moves:* the Lenis scroll layer (DNA90, from the first build, on
`gsap.ticker`, `autoRaf:false`, `anchors:true`); countdown digits, changing in place with
no flip or roll; tab content, as a crossfade ≤200ms with travel ≤8px; card hover, where
the hairline under the plate firms to `--ink-2` and the plate lifts 2px; and the single
DNA95 exit in the record. *Still:* every photograph (no Ken Burns, parallax or reveal),
every headline, the hero, the sold ledger, the closing. Bids are never animated or
simulated upward, because a sample bid that ticks invents activity. GSAP core plus
ScrollTrigger exist only for the one pin. Everything else is CSS. Under one hour only
seconds tick, so one viewport rarely holds more than one or two moving digits (MJ2).

**Reduced motion.** Lenis is not constructed and there is no pin: the record sits in the
flow as its composed frame, with sentence, VIN decode, ledger and plate all visible at
once. That frame is the designed still, not a blank. The tabs swap instantly, the hover
changes the hairline only, and countdowns still update, because they are information. The
seconds rule above already keeps those updates to the last hour.

**Mobile.** Authored, not scaled. One column. The hero plate uses its own 4:3 crop with
the record below it. The tabs are three short labels that fit at 360px (no horizontal
page scroll). The feed shows six per tab, then "Show all", which expands below the
pointer and keeps parity with desktop. Cards stay 3:2 with the data line on one row (bid ·
time); bids drop to the second row. No pin: the record stacks as VIN decode, plate, then
ledger, and the VIN breaks between segments, never inside one. The VIN field and buttons
are full width, with 44px targets throughout.

---

## 9. Budgets (declared now, DNA38)

| | Desktop | Mobile |
|---|---|---|
| Lead lot | 1.0 vh | 1.3 vh |
| Floor | ≈2.8 vh (4 rows of 3, plus tabs) | ≈5 vh (6 cards, then Show all) |
| Silence + record | ≈2.1 vh (0.2 interval, 1.0 section, 0.9 pin) | ≈1.6 vh, unpinned |
| Sold | ≈0.9 vh | ≈1.2 vh |
| Closing + footer | ≈1.3 vh | ≈1.6 vh |
| **Page** | **≈8 vh** | **≈10.5 vh** |

Payload: first screen ≤1.0 MB (hero `main/l` ≈500 KB, preloaded with
`fetchpriority=high`; two variable font subsets ≈150 KB; Lenis, GSAP and ScrollTrigger
≈90 KB). All other plates lazy-load. Full scroll ≤7.5 MB, which is feed-limited and a
production resize service fixes it. **Largest asset:** one `main/l` JPEG, ≈600 KB max.
**LCP ≤2.5 s** (the hero plate is the LCP element). **CLS 0**, because every plate reserves
its `aspect-ratio`.

---

## 10. Judgment calls

- The photo is never full-bleed, even in the hero. The busy room would take the dominant from the car (C13), so the scene is the dark field instead.
- Display face Source Serif 4 rather than a didone: card and section ranks sit under 40px (I10).
- Two type voices, not the dialect's three: text plus data is the concept.
- Graphite rather than warm black: it keeps gold from reading as casino.
- Brass derived from the hallmark idea and kept off the plates, because the photos already contain gilt lettering.
- "Sell" and "The house" merged so the page ends on an input, not a logo line.
- One pin, not two, so the peak owns the only held moment.
- The peak is the record, not the hero. The page develops instead of spending itself on the first screen.
- The Valour sits at the peak because it has the only full, check-digit-valid VIN. Masked VINs are shown masked and classic chassis numbers are shown short, never padded or invented.
- The sold section uses Patton's real sold cars, titled "Recently sold" and not "Results", with every price marked sample. These cars sold as dealer stock, not at a Golden Lion auction, and saying otherwise would be a false claim.
- Bids never tick upward in the prototype. Only clocks move, because simulated bidding is invented activity.
- No "unretouched" claim on captions: the source photos look processed, and we can't vouch for them.
- The zebra/alternating-band rhythm is refused. There is one tonal exception, at the ending (the RM Sotheby's anti-reference).
