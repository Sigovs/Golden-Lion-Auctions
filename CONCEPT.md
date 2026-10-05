# Golden Lion Auctions: HOME concept, v2

Art director, 5 Oct 2026. Delivery mode is **BUILD**: one direction, no variants. v1 is
kept in `CONCEPT-v1.md`. Alex's verdict on it: the thinking is strong, but it reads like
a collector's record system, not a high-end auction launch.
v2 keeps v1's structure, data anatomy and credibility, and adds the stage, the event and
the brand. Where this file and the BRIEF.md decisions disagree, BRIEF.md wins.

Manifest: `/Users/alex/Desktop/WORK/design_dna/TASTE.md`. Build standard: DNA1–DNA95.
Read for this pass: color-taste, typography-taste, motion-taste, academic-composition
C17/C22, and the dialect files auction-editorial, cinematic-industrial,
technical-luxury and HYBRID.
Vault: 5 relevant references, 0 unusable for missing notes (REFERENCES.md).

---

## 1. Design Read

```
Delivery: BUILD.
Reading this as the launch home of a live auction house for buyers and consignors of $300k–$3M collector and exotic cars, leaning cinematic auction-catalog.
Mandate: REBRAND. Only the name GOLDEN LION AUCTIONS is fixed. The client's black/gold/lion intent is translated; his artefacts (logo.png, video, poster) are not used.
Style mode: DIRECTED HYBRID (Alex named all three). Anchor auction-editorial / contrast cinematic-industrial / signature technical-luxury. Unifying principle: the record, lit.
Dimensionality: SUPPORT. Depth comes from light fall-off, parallax and two section overlaps; with all of it removed, the page still stands.
```

**Control map.**

| Domain | Owner |
|---|---|
| Composition and grid, hierarchy, the floor, type rank, CTA restraint | auction-editorial (the anchor) |
| Light, image behaviour on the two stage sections, depth, motion weight, colour of the ground | cinematic-industrial (the contrast) |
| The data line, the chassis line, the VIN and hallmark record | technical-luxury (the signature) |
| CTA rank | the visitor's task, never a dialect |

**Where cinematic stops:** it never reaches the floor's grid, it never puts type over the
car, and it uses no smoke, flare, neon or wet-surface effects.

**Collision risk, from HYBRID.md for this exact pairing:** "both defer, and the page
becomes atmosphere with a caption." The guard is that every lit moment carries a fact:
the hero carries the bid and the clock, the peak carries the VIN and the mark.

**Why dark (DNA22).** It is a client constraint, not a mood (BRIEF decision 4). The
cinematic logic now gives it a job: the dark ground exists so that light means something.
The page shades from dark into lit, so it is never evenly black.

**Asset dependency (C17).** The identity has three carriers. The stage, meaning the light
pool, the brass stage line and the scale. The record, meaning the chassis line, the data
line and the hallmark. The type. The photographs carry the subject, not the identity.
Test: put the Cobra trio into the hero slot and the stage, the rostrum and the hallmark
still make it Golden Lion.

---

## 2. Concept and signature

**Concept, in one sentence (it could be wrong):**
*Every car arrives as the lot of the evening: lit on a stage the page builds out of
darkness, with the clock running and the bid on the rostrum. Behind it stands Golden
Lion's record, struck like a hallmark. Desire and proof arrive in the same frame.*

**Signature move: the hallmark is struck.** Golden Lion's mark is a **lion passant in an
assay cartouche**: a walking lion, one forepaw raised, drawn as a single brass line
inside a clipped-corner rectangle, the shape of a hallmark punch. The lion passant is the
real mark struck on precious metal once it has passed assay, so the client's lion becomes
the proof of the differentiator instead of a crest.
- Everywhere else it is small: the header lockup, the hero's Verified mark, the footer.
- At the peak it is struck once, large (~160px). The Valour's VIN reads true on one line
  at display scale, with three segment ticks: maker SCF Aston Martin · model year R 2024 ·
  check digit 0, valid. The VIN check digit is real (Σ407, mod 11 = 0).
- The cartouche then presses in: scale 1.06 to 1, opacity 0 to 1, 600ms, `--ease-out`.
  It is a weighted press, with no bounce and no shine.
- Nobody else can do it, because it fuses the name with the product.

**The VIN move is demoted.** In v1 it was the signature and a six-row annotation table,
which made the peak academic. Now it is **one line and three ticks**, and it exists to
earn the strike. The chassis line on every card stays as a typographic convention, not a
signature. The full decode moves to the lot page (stage 2).

---

## 3. HOME: five masses (header and footer counted separately)

The order is unchanged from v1: lead lot → floor → record → sold → consign + house.
Two masses are now **cinematic and full-bleed: the hero and the record.** They are the
two moments the page asks you to feel rather than scan: the occasion, and the proof.
Everything else stays on the disciplined grid.

| # | Mass | Job | Dominant | It is NOT |
|---|---|---|---|---|
| H | **Header** | Hallmark plus GOLDEN LION wordmark; Auctions · Results · Sell · How it works; search; Sign in; **Register to bid** | The lockup | Not transparent over the photo. It sits on the ground with a hairline; over the hero it is a 64px ground bar the scene starts beneath. Its only state change: none. It is the sole persistent layer |
| 1 | **The lead lot** (full-bleed stage) | A live auction moment: lot, clock, bid, occasion | The Miura, lit | Not a carousel. Not a photo hanging in darkness. No type over the car. Not a gold glow |
| 2 | **The floor** | Browse all 12 lots, tabs, watch | The collection, read as one grid | No pins, no bento, no featured-size card, no Place Bid on cards. Equal cards are argued (DNA9): the lots are genuinely parallel |
| 3 | **The record** (full-bleed stage, **the peak**) | Golden Lion Verified on one real car | The black-and-gold Valour, lit, then the struck hallmark | No four-column process, no scan animation, no AI sparkle, no annotation table |
| 4 | **Recently sold** | Calibrate value | A hairline ledger of six rows | Not cards. Not presented as Golden Lion auction results |
| 5 | **Consign, and the house** | Start from a VIN; who stands behind it | The VIN field on the lit `--g1` ground | No photo CTA band, no newsletter |
| F | **Footer** | Nav, legal, page-wide sample-data notice | — | Not an empty fade (C19) |

**Grid (DNA10):** 12 columns, 24px gutter, 1440px max, margin `clamp(16px, 4vw, 64px)`.
**Bleed rule:** only masses 1 and 3 bleed. Their type and data still sit on the grid
columns, so the grid holds even when the image does not.

**Overlaps (two, and no more):** with more than two, the layering stops registering. This follows the reasoning in Alex's vault record `hbbody-com-en-home`.
1. **The floor rises over the stage.** The hero scene is held (`position: sticky`, no
   hold phase) while the floor's opaque ground slides up over it. The hero photo
   parallaxes at 0.85× during that pass.
2. **The sold ledger rises over the released record.** Its ground covers the Valour as
   the pin lets go.

Nowhere else does one section cover another.

**Ledger, read down the columns:**
- **Ground:** the light pool on the stages; the plain ground on the floor and the ledger; `--g1` at the close.
- **Image:** the stage treatment on 1 and 3, plates on 2 and 4. Same photos, unaltered, at two roles: one is the stage, the other is the catalogue. The column change is carried by the concept, not drift.
- **Type:** the same three voices on every section.
- **Ask:** act → browse → read → browse → act.

---

## 4. Feeling curve, shots, peak, silence, pins

| Act | Feeling, then its cause | Shot | Device |
|---|---|---|---|
| 1 Lead lot | **Anticipation.** House lights come up on the Miura, the clock is already ticking, the bid stands on the rostrum | Reveal, then a slow push as you scroll | Light-open on load; the floor overlaps |
| 2 Floor | **Appetite.** Twelve lots revealed row by row, each with its own number moving | Dolly | Masked image reveals, tab crossfade |
| 3 Record | **Awe, then certainty.** The Valour lit full-bleed, its VIN reads true, the hallmark is struck | Push-in, then macro, then the strike | DNA95 pin with the hallmark press |
| 4 Sold | **Confidence.** What cars like these made | Cutlist | Rows rise in sequence |
| 5 Consign + house | **Ambition.** Your car, on this stage, and a real address | Release | One field, still |

**The peak is the record.** The hero is the overture and the record is the hammer.
- **Ranking:** the peak gets the largest image (full-bleed and pinned), the largest single mark (the 160px hallmark), the most scroll room (≈2 viewports) and the only silence.
- **Keeping the hero below it:** the hero is lit but shorter, and its biggest element is the lot name, not a mark.

**Silence:** a ≈25vh dark interval between the floor and the record. It carries one
display line, *Every lot is examined before it is offered.*, which rises into the dark.
Then the Valour lights up. The interval has one job, the pause before the hammer, and it
is not an empty black gap.

**Pins: one DNA95 pin, the record.**
- It pins at the section top, then holds for the first half: still and readable, with the
  hallmark already struck on entry.
- Then the text block (line, VIN, ticks, the four-step ledger, the seal) rises 60–90px and
  fades, scrub 0.35, `ease:'none'`.
- It releases after ≈0.9vh. The photo does not perform during the pin.
- The hero's sticky overlap has no hold phase, so it is not a second pin.

**The four steps,** as a short numbered ledger inside the record: VIN read by AI →
third-party specialist captures the car (full photo set, start-up video) → AI drafts and
flags missing shots → a Golden Lion person signs off, and the hallmark follows. No
durations, counts or guarantees are stated.

---

## 5. Palette, gold, the lion, type

**Ground.** Neutral graphite, never warm brown-black. Warm black plus gold is the casino
the brief bans. The ground has **light in it**: each stage section carries a pool, so the
page has fall-off rather than flat black.

| Token | Value | Use | Contrast on g0 |
|---|---|---|---|
| `--g0` | `#111316` | Page ground, header, rostrum | — |
| `--g-lit` | `#262A30` | Centre of a light pool, only ever as a radial ground fall-off to `--g0`, neutral and never tinted | — |
| `--g1` | `#181B1F` | The closing mass | — |
| `--ink` | `#ECE9E2` | Names, values, body, primary button | 15.35 |
| `--ink-2` | `#A8A59E` | Keys, chassis line, captions, ≥3:1 field borders | 7.57 |
| `--rule` | `#2A2D31` | Decorative hairlines | — |
| `--brass` | `#BFA26A` | Accent, solid only | 7.61 |

Every text pair is re-measured on the composited render, worst sample, and over the
stage photos too.

**Gold has more presence than in v1, and is still never casino.** Brass is a material
that marks things, never a light source. It has **three roles**, at up to ~4% of pixels:

1. **The hallmark:** the lockup, the Verified mark, and the struck seal at the peak.
2. **The stage line:** a 1px brass hairline across the full width wherever a stage ends.
   That means the top edge of the hero's rostrum and the base of the record. Plus the
   active-tab underline, which is the same line at small scale. This is the rail the lot
   stands on.
3. **Live:** the status dot and label.

Never on prices, headings, body or button fills. Never a ground, glow, gradient,
metallic sheen or texture.

The Valour at the peak is itself black with gold trim. The client's palette appears
there done right, by a real car, not by the UI.

**The lion: one mark, one form.** The lion passant cartouche described in the signature.
- **Status: a working mark.** It is drawn fresh as monoline SVG, never traced from the client's art.
- **Who decides:** it stays working until the client's logo question (BRIEF open item 2) resolves. If he supplies a vector mark he prefers, the cartouche shape and the hallmark behaviour stay and the glyph inside changes.
- **Never:** a lion head, a rampant lion, a shield crest, a watermark behind a car, a lion photo or render, or the tricolour.

**Type: three voices, each with a job no other voice can do.**
- **Display: Libre Caslon Display**, used only at ≥40px. It sets the lot names on the
  stages, the section lines, the silence line and the hero bid.
  - *Reason:* Caslon is the auction house's own historical register, and it brings back
    the client's "serif" intent with ceremony instead of costume.
  - *I10:* its contrast is only safe large, so it never goes below 40px.
  - *Not used:* Newsreader and Bodoni Moda (spent on 360 Auto Care), Playfair and
    Cormorant (exhausted).
  - *Italic:* it has no true italic, so the italic-accent-word move is dropped (typography D2 yields).
- **Text and UI: Hanken Grotesk** (400/500). It sets card lot names (~20px), body, the
  proposition and button text. *Reason:* the display face cannot go below 40px, so names
  at card size need a quiet face.
- **Data: IBM Plex Mono** (400/500). It sets bids on cards, the clock, counts, chassis
  numbers, VINs, keys, nav and tabs. *Reason:* the zero must be distinguishable in VINs,
  and the clock needs a fixed advance.
- **Tabular figures** on every number. **14px floor.**
- **Scale:** hero lot name ~104px · section line ~56 · hero bid 56 · hero clock 32 mono ·
  card name 20 · body 18 · data and keys 14–16. Ratios are ≥1.6× between adjacent ranks.

---

## 6. Hero anatomy: the live moment

**The scene** is 100svh below the header and full-bleed. Lot 73, the Miura, sits in the
**house light** (section 7). The car stands centre-right, lit, and the room falls into
shadow around it.

**Upper left,** over the room after it has been darkened by the light fall-off. Every
string here is measured at glyph level.
- The occasion line, mono 14px: `● Live · Lot 01 of 12`, with the dot in brass.
- `1972 Lamborghini`, Hanken 20px.
- **`Miura P400 SV`**, display ~104px, on two lines if needed, broken between words by
  choice.
- `Chassis 5066`, mono.
- The hallmark at 32px plus `Golden Lion Verified`.

**The rostrum,** a solid `--g0` band across the bottom ~20vh, with the **brass stage line
along its top edge.** It sits as a sibling layer over the photo's floor, so the photo's
bright floor runs into the stage edge and ends.
- Left: `Collector and exotic cars at auction, each examined by Golden Lion.` in Hanken
  16px, `--ink-2`.
- Then, in rank:
  1. **Current bid**, display 56px, ink (key: `Current bid · sample`).
  2. **Ends in**, mono 32px, `02 : 14 : 37 : 09`. In the hero the seconds always tick.
     This is the page's pulse and the first screen's one temporal idea (MJ2).
  3. Bids · Watching · reserve state, mono 16px.
- **View lot** (solid ink button) and **Watch** (hairline button).

**The event, as a system:**
- Subject: the car.
- Headline mass: the name block.
- Interface mass: the rostrum.
- CTA cluster: View lot and Watch.
- Active field: the light pool.
- Negative space: the darkened room above and right of the car, which is what isolates it.
- Excluded: the header.

**Mobile** is authored separately.
- The scene is 4:5 and tight, with the car at ~90% width.
- The name block sits over the dark ceiling at the top.
- The rostrum stacks below as a solid band: bid and clock on row 1, buttons on row 2.

---

## 7. Image handling: a stage built by the page, with the car untouched

**The photos as they really are.** Patton's room: a black ceiling, a brand wall with gilt
logos, red curtains and pillars, and a **glossy white floor that is the brightest region
in every frame.** Framing runs from wide room shots (car at ~45% width) to tight
three-quarter views. Some frames hold two or three cars.

**The house light (the two stage sections only).** This is how the page makes the
environment.
1. **A light pool on the ground.** Behind the photo, a neutral radial `--g-lit` → `--g0`,
   centred on the car.
2. **A luminance mask on the photo's edges.** `mask-image` is a radial ellipse centred on
   the car: fully opaque across the car's box plus a 6% margin, then a **fast fall-off**
   over ~15% into transparency, so the ground shows through.
   - The effect: the room sinks into the page's darkness and the car stays lit.
   - The fall-off is short on purpose, so that over the white floor it reads as the edge
     of a spotlight and not as grey mud.
3. **The stage edge.** The rostrum (hero) or the record's base band covers the lowest
   strip of floor, and the brass stage line sits on that seam. The lot stands on a rail.

**Per-lot data.** Each stage lot gets authored `light: {cx, cy, rx, ry}` and a
`car_box` in `lots.json`. **The mask's opaque zone must contain the car box: verified
from annotated renders at every viewport (`hero.json`).** If the car box is clipped, the
build fails.

**What is never done.**
- Nothing inside the car box is changed: no filter, grade, blur, vignette or sharpen on
  any pixel of the car.
- No generated pixels.
- No reflection or fake floor.
- The mask touches only the room.

**At full-bleed scale the busy room survives because of four things.**
1. A tight crop: the car is at ≥60% of the scene width (Miura window ≈1700 source px wide).
2. The mask takes the edges, where the logo wall, pillars and ceiling fixtures sit.
3. The rostrum takes the floor.
4. Type goes only where the mask has already darkened the room. If a frame cannot give a
   measured ≥4.5:1 under the name block, that lot is not a stage lot. That is the C22
   asset test.

**Stage lots.** **Miura (73)** for the hero: a blue car in a red-and-black room reads at
once. **Valour (79)** for the record: black and gold, and the only complete VIN.

**The floor and the ledger use plates.** Square-edged 3:2 prints on the plain ground, with
no mask.
- The car's size is the constant: an authored `frame` puts it at 70–80% of plate width,
  so twelve different shots read as one collection.
- Never cut the car. The floor stays ≤18% of the plate below the tyres.
- Images are always `main/l`.
- In multi-car frames, crop to the lot car. If that can't be done cleanly, caption it
  (`Lot car: left, #658`).
- Feed order is never re-sequenced for looks.

**Captions.** Under the two stages only, in mono: `Photographed at Patton Motors, Pompano
Beach`. The room is provenance.

**Resolution, flagged.** At full-bleed on a 2× screen, a 1700px crop is ~0.6 of native
resolution, so the car will be slightly soft on retina. It is acceptable for the
prototype. For launch, ask Patton for the original files (see the needs-a-call list
below).

### Recommendation for later, outside this concept

If Alex wants the logo wall and curtains gone entirely, the page cannot do that. Only a
generated environment can. The route is the one BRIEF decision 7 records:
1. Generate the surroundings onto the whole real photo.
2. Lay the original car cut-out back on top, pixel-identical.
3. Mark the result as a staged composite (GI3, GI6). The lot gallery stays as raw captures.

Use it **for the two stage lots only**, after a pilot passes the light and perspective
match that the first pilot failed. The v2 page needs no change to accept such a frame.
It would simply replace the stage image.

---

## 8. Lot card anatomy (Semler SRP, unchanged in rank)

1. Plate, 3:2, authored crop. The whole card is the link.
2. Lot name, Hanken ~20px: `1972 Lamborghini Miura P400 SV`.
3. Chassis line, mono 14px, `--ink-2`: `Chassis 5066` / `VIN ZFF96NMAXN0XXXXXX`. Masked
   VINs show their masks and short classic chassis numbers stay short. Mileage only when
   it is non-zero.
4. Hairline, then the data line: **current bid** (the largest figure on the card) · **time
   left** · bids, as tabular mono. Seconds appear only under an hour.
5. Status at the head of the data line: `● Live` (brass) / `Ending` (full ink plus label,
   no hue) / `Sold`. `No reserve` and `Reserve met` appear as words.
6. Watch: a `<button>` with a 44px target, separate from the link.
7. The sample mark is carried in the key: `Current bid · sample`.

No hallmark on cards: every lot is verified, so a universal badge says nothing.

**Data hooks** are as in v1, plus `frame`, `frame_m`, `light` and `car_box`. `ends_at`
is stored as an offset from load.

**Sold ledger row:** small plate · name · chassis · result (`sample`). Six real sold cars
from the feed (for example ids 27, 9, 12, 15), titled "Recently sold", with no dates.

---

## 9. Motion: a luxury tool

**Tokens:**

| Token | Value |
|---|---|
| `--dur-1` | 200ms (hover and state) |
| `--dur-2` | 450ms (tab swap) |
| `--dur-3` | 900ms (titles and text) |
| `--dur-4` | 1200ms (image reveals, light-open) |
| Enter | `cubic-bezier(0.22,1,0.36,1)` |
| Exit | `cubic-bezier(0.55,0,1,0.45)` |
| Scrub | linear |

No overshoot, bounce, elastic or spring anywhere. Each entrance plays once and does not
replay when you scroll back up. Only DNA95 reverses.

**What moves:**
- **Hero load, ≤1.4s total.** Comprehension never waits: the car, name and bid are present
  from frame 0, and only the timing of their arrival is choreographed.
  - The house light opens: the mask's fall-off radius grows from 0.85 to 1.0 over
    `--dur-4`. The car is lit first and the room emerges.
  - The name block steps in from the left: x −40 to 0 plus opacity, `--dur-3`, lines
    staggered 90ms.
  - The rostrum values rise: y 24 to 0, `--dur-3`, 150ms after.
  - The clock starts.
- **Titles** step in from the side (−40px). **Supporting text** rises from below (24px).
  Delay 120ms after the title.
- **Plates (floor and ledger)** reveal through a mask: `clip-path: inset(100% 0 0 0)` to
  `inset(0)`, `--dur-4`, while the image inside eases from scale 1.06 to 1.0. That
  counter-movement is what reads as weight. Stagger 80ms per card in a row.
- **Card hover:** the image scales 1.03 inside its fixed frame over 600ms, and the
  hairline under the data line turns brass, which is the stage line at small scale.
  Both reverse on leave.
- **Parallax:** the hero photo at 0.85× during the floor overlap. The Valour drifts in
  scale from 1.04 to 1.0 on approach only and is still during the pin.
- **Record:** the hallmark press (600ms), then the DNA95 hold and scrubbed exit.
- **The silence line** rises with the standard text entrance.
- **Countdowns:** the digits change in place.
- **Lenis** from the first build (DNA90: `gsap.ticker`, `autoRaf:false`, `anchors:true`).

**What stays still:**
- Every car, inside its frame, once it has arrived.
- Everything during the record's hold.
- The closing mass, apart from its title's entrance.
- The header.
- Bids: they never tick upward, because simulated bidding would invent activity.
- No ambient loops anywhere.

**Method.** CSS for hover, tabs and masks. GSAP with ScrollTrigger only for the overlap,
the parallax and the pin, at the lowest level that does the job (DNA45).

**Reduced motion.** Lenis is not constructed. There is no pin, no sticky overlap and no
parallax.
- Every entrance is skipped and content appears at its final state.
- The house light renders at its open state. It is a composed still, and it is the
  designed frame.
- The record sits in the flow with the hallmark already struck, and the VIN, ledger and
  photo all visible.
- Tabs swap instantly. Hover changes only the hairline colour.
- Countdowns keep updating, because they are information. The hero clock drops to
  minute resolution.

**Mobile.** Authored, not scaled.
- **Stages:** the hero is a 4:5 tight scene, and the house light is re-authored per frame
  through `light_m`. The rostrum is stacked.
- **Overlaps:** no sticky overlap and no parallax. Sections simply follow.
- **Motion:** entrances use opacity plus 16px travel only, and image reveals are a
  400ms opacity fade.
- **The record:** no pin. It stacks as the Valour scene, the silence line, the VIN
  (broken between segments), the seal, then the ledger. The hallmark still presses once.
- **Floor:** six lots per tab, then "Show all", which expands below the pointer.
- **Layout:** one column, 44px targets, and no horizontal page scroll (the tabs fit at
  360px).

---

## 10. Budgets (DNA38)

| | Desktop | Mobile |
|---|---|---|
| Lead lot (incl. overlap pass) | 1.0 vh | 1.3 vh |
| Floor | ≈2.8 vh | ≈5 vh |
| Silence + record (incl. 0.9 pin) | ≈2.2 vh | ≈1.8 vh |
| Sold | ≈0.9 vh | ≈1.2 vh |
| Closing + footer | ≈1.3 vh | ≈1.6 vh |
| **Page** | **≈8.2 vh** | **≈10.9 vh** |

**First screen:** ≤1.0 MB. That covers the hero `main/l` image (≈500 KB, preloaded,
`fetchpriority=high`), three font subsets (≈170 KB), Lenis, GSAP and ScrollTrigger
(≈90 KB) and the SVG mark.

**Full scroll:** ≤7.5 MB, lazy-loaded. **Largest asset:** one `main/l` image, ≈600 KB.

**Performance targets:** LCP ≤2.5s on the hero image, CLS 0 (every plate and the scene
reserve their ratio), and 60fps through the overlap. Only `transform`, `opacity`,
`clip-path` and `mask` are animated.

---

## 11. Judgment calls

- **Style mode:** DIRECTED HYBRID, with auction-editorial kept as the anchor. The floor
  is the product, so cinematic owns light and motion, never the grid.
- **Full-bleed:** only on the hero and the record. Those are the two moments to feel
  rather than scan. The floor stays a catalogue.
- **The environment comes from a light-fall-off mask on the room plus a ground light
  pool,** never touching the car box, and the box containment is verified per viewport.
  A generated environment is recorded as a separate later recommendation.
- **The hallmark (a lion passant in an assay cartouche) is the signature.** It turns the
  client's lion into proof instead of decoration.
- **The VIN decode is demoted** to one line and three ticks. The full decode belongs on
  the lot page.
- **Brass has three roles** (hallmark, stage line, Live) at ≤4% of pixels. It is solid
  only, never on prices, headings or fills.
- **The ground stays graphite, not warm black,** so the gold reads as hallmarked metal
  rather than casino.
- **The display face is Libre Caslon Display, at ≥40px only.** It reads as auction-house
  ceremony instead of book face. It forces a third voice (Hanken Grotesk) for names at
  card size.
- **The peak is the record and the hero is the overture.** The hero is lit but shorter,
  and its largest element is the name, not the mark.
- **The Valour is at the peak.** This car is black with gold trim, as the photo shows, and it has
  the only check-digit-valid VIN.
- **The hero clock always shows seconds. The cards show seconds only in the last hour.**
  That gives one pulse per viewport.
- **Two overlaps only** (floor over hero, ledger over record), because repeated intensity
  leaves no room for silence.
- **"Recently sold" not "Results", with prices marked sample.** Those cars were dealer
  sales, not Golden Lion auctions.
- **No hallmark on cards.** A mark every lot carries says nothing on a card; it belongs to
  the hero, the peak and the lot page.

**Needs a call:**
- **The original photo files from Patton.** At full-bleed on retina screens, `main/l` is
  soft.
- **The client's logo answer** decides whether the lion glyph inside the cartouche gets
  replaced.
