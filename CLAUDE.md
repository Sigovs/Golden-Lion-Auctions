# Golden Lion Auctions — working rules

New product by Patton Motors (Pompano Beach): an online car auction, working name
**GOLDEN LION AUCTIONS**. Brief and assets: [BRIEF.md](BRIEF.md). Sits inside the
PATTON MOTORS folder, so `../CLAUDE.md` loads too. Of its rules, only these apply
here: imagery (GI3), sample data marked as such, and the 14px type floor.
GI3 here means the **car is never generated**. The stage, pedestal, light and
background around his real cars **are** generated, as the client wants (BRIEF.md,
decision 3).

**Built from zero.** The Patton work (`../mockup/`, index3–index7, the hero passes,
the AAN theme overrides, the REDESIGN mandate) is **not** the starting point and is
not reused. It's a different product.

## Repo

**https://github.com/Sigovs/Golden-Lion-Auctions.git** (added by Alex on 5 Oct 2026;
empty when checked). The prototype goes here: the stage 1 deliverable is "local +
git" (BRIEF.md decision 1). This folder currently sits inside the PATTON MOTORS git
repo, so set up the git link deliberately when the build starts. Push only when
Alex says so.

**Jarvis** (GDBURO project intelligence) follows this repo: https://jarvis.gdburo.com/#project/5.
It reads the repo, starting from README.md. Keep README.md current at every
milestone, and write commit bodies that say what changed and the project's state.

## The brief will keep contradicting itself — work with it

Alex, 5 Oct 2026: there is no order in the brief or in the agreement with the client,
so mismatches (names, logos, scope) are normal here. **Don't block on them.** Take a
working decision, write it into BRIEF.md as *working*, keep the question in "Open
with the client", and move on. Don't stop the work to ask the same question twice.

## The client's material: look at it, don't use it

Alex, 5 Oct 2026: the client sends cheap AI drafts (he says himself they aren't
ready). Alex's job is to steer him away from them gently, without him noticing.
**Take the intent out of every item, never the artefact.** Translate it up to a
finished level so that he recognises his own idea, executed properly. Every new
item from the client gets one line in BRIEF.md: *what he wants to say → how we
say it*. Never present it as "we didn't use yours"; the framing is "your idea,
finished".

## Skills — load before the work, not after

**`design-dna` first**, before any visual work. It routes to
`/Users/alex/Desktop/WORK/design_dna/TASTE.md` and the taste skills
(`academic-composition`, `anti-patterns`, `spacing-taste`, `typography-taste`,
`color-taste`, `motion-judgment`, `motion-taste`, `dimensionality`,
`generated-imagery`, `content-provenance`). Invariants never yield.

Also in play on this project, all installed globally:

- `impeccable:impeccable`: build pipeline and finish review
- `frontend-design:frontend-design`: frontend build
- `genjutsu:paint` / `genjutsu:cast`: art direction / motion and micro-interactions
- `ui-ux-pro-max:*`: design system and UI styling
- `scroll-site`: before any markup on a scroll-led or pinned page
- `gsap-implementation` + `gsap-skills:*`: once motion is approved
- `redesign-existing-projects`, `high-end-visual-design`, `design-taste-frontend`
- **OpenDesign** (`nexu-io/open-design`): exploration and critique *before*
  implementation, per `design_dna/GDBURO_PRODUCTION_PIPELINE.md`. It never
  replaces production code.

Agents: `art-director` before the build, `design-critic` after it,
`motion-designer` once the structure exists.

## Lenis from the first build

DNA90. Lenis goes in with the first markup, before any pinned section is tuned.

## Big sections: pin, hold, the content leaves, then the section follows

Alex's standing pattern for every large section (DNA95 in
`design_dna/.claude/rules/design-dna.md`). It is the first answer, so don't open a
debate about slide-ins or slide-outs:

1. **Pin** when the section's top reaches the top of the viewport. Only one pin at a time.
2. **Hold.** Roughly the first half of the pinned distance is a read pause and nothing moves.
3. **Content leaves, scrubbed.** The text block alone rises ~60–90px and fades to 0,
   `ease: 'none'`, scrub ≈0.35, and comes back when scrolling up.
4. **Release.** Once the content is gone the pin lets go and the whole section
   scrolls away after it.

The media doesn't perform: a still photo or an ambient loop, with no reveal on top.
Pinned length is ≈0.9 of a viewport (≈90vh) on desktop. No pin on phones or under `prefers-reduced-motion`.
Animate the block's own `opacity`/`y`. A block centred with `translate(-50%)` gets
`yPercent: -50` handed to GSAP first. Avoid long empty black gaps between sections.

## Feedback log

- **No decorative rules beside labels** (Alex, 6 Oct 2026: "полосочки не надо"). A section
  label is plain tracked text; if a line is wanted at all, it is short and sits *under* the
  text. The same goes for hairline frames around ledger cells and stage lines on panels:
  separate by space, not by stripes.
- **The old brass `#BFA26A` reads as "Claude brown"** (Alex, 6 Oct 2026). Gold is now
  champagne gilt `#D9C48A`, sampled from the Valour's gold trim, used on the dark ground only
  as a dot, a short line, the hallmark or an active state. Never a button fill or a chip block.
  The primary button is solid ivory ink.
- **Nothing covers the car** (Alex, 6 Oct 2026, on v1's inspection-record card over the
  Valour). Panels and records sit beside or below a car photo, never over it.
- **HOME v1 rated 5/10; v2 rejected as "Claude slop"** (6 Oct 2026). The tells Alex reads as
  slop: one head formula repeated in every section (tracked micro-label + short rule + serif
  heading + grey lede), mono data type, flat card-less ground, everything "tastefully" quiet.
- **Current direction: `index-v3.html`** (6 Oct 2026). On Alex's instruction, cards, shadows
  and background gradients are allowed here, against the house dialect. Each section takes a
  different layout from the concept boards: hero scene + floating glass bid console (2/74),
  cards + "Closing next" rail (2/79, 2/81), atmospheric banner + paper dossier (2/79, 2/76),
  dark results card on a cream band (2/77), CONSIGN as a wide poster word (2/80), finale scene.
  Type: Archivo Expanded for display caps, Libre Caslon only for car names, no mono.
  Gold is a metallic champagne gradient on buttons and chips; never the old brown.
- **v3 still "slop, not creative" → three directions built for Alex to choose** (6 Oct 2026):
  `index-v4.html` Evening Sale (model name huge behind the car cut-out, lots called 01→12,
  split-flap "Next to close" board), `index-v5.html` Dossier (paper catalogue on a dark desk,
  file-divider tabs, VIN anatomy), `index-v6.html` The Hall (pinned scroll walk past all 12
  platforms, 2.5D car/hall layers). BaT mechanics they share are in `BAT-NOTES.md`; the
  two-minute rule is shown as *proposed*. Car layers: `assets/stage/car-cut-<id>.webp` (now the
  complete v6 cut-outs); v6's `assets/v6/plate-<id>.jpg` are halls with the car removed by
  OpenCV fill (setting only, car pixels untouched).
- **v4–v6 approved as a base, not as finished** (Alex, 6 Oct 2026: "как база очень солидно",
  but "доработка и докрутка по images/photos требуется мощная"). The layouts and ideas are the
  foundation; the imagery is the open job and it is Alex's (BRIEF decision 8). Known image
  weak points: one generated hall repeated across all 12 lots; car pixels come from 1920px
  feed photos, soft at full width on retina; v6 car-removed plates are OpenCV fill and seam in
  motion. Don't fall back to v2/v3 grammar.
- **v7 = v6 revised on Alex's notes** (6 Oct 2026): the champagne/khaki gold reads brown —
  gold is now a true light gold (`#FFF0C2` / `#F2CF6B` / `#EBC665`, `#D9A93A` for lines only;
  large numerals use the paler `--gilt-type` gradient, the full metal reads olive on big type).
  The hall never takes vertical scroll: it is its own horizontal stage (arrows, ticks, drag,
  sideways wheel); nav is always visible; sections get real air (`--sec` 96–176px); Recently
  sold is a photo gallery. "How the hammer falls" is scroll-driven by Alex's call: the clock
  stays pinned, the right column steps 01→04 and the time follows the scroll, ending on SOLD.
- **v7 accent moved from gold toward orange** (Alex, 6 Oct 2026: "золотой больше двинем в
  orange"): `--gilt #F0A04E`, `--gilt-hi #FFE2BE`, `--gilt-mid #F6B261`, `--gilt-lo #D47F2A`
  (lines only); big type uses `--gilt-type` #FFE2BE→#F0A04E. All ≥6.4:1 on the dark ground.
  The token names stay `--gilt-*` so the change is one place.
- **v8 = the synthesis (current base)** (6–7 Oct 2026), built from Alex's brief: v7 foundation +
  v4 auction drama + v5 paper records (three objects only) + v2 ivory bands. Follow-ups that bind:
  no glowing dots anywhere; no orange/brown tints on the dark ground (active plates, glows) —
  neutral graphite/ivory instead; Recently sold is neutral grey, not warm paper; the paper clip
  on the inspection record is gone ("cheap"); lot/price blocks sit high with air, never pinned to
  the bottom edge; On the block = pinned horizontal track of lots 01–06 with See more ↓.
- **HOW THE HAMMER FALLS** (v8): clock and right-column text tell one story (02:00 → late bid at
  00:07 → back to 02:00 → quiet to 00:00 → SOLD); MM:SS, every second, closing-window gauge,
  Going once / twice. A procedural dark-walnut 3D gavel (js/v8-gavel.js, Three.js lazy-loaded)
  falls onto the clock at 00:00 (p ≈ .78), then ~20% pinned hold, then release. Never block wheel
  input. Any 3D work loads the Design DNA skill `threejs-art-direction` (TA1–TA12).
- **The house** carries imitation copy (specialists, hours, 555 phone) marked "Sample copy";
  replace with Patton's real details before launch.
- **Lot data = card** (approved): framed card, vertical dividers between cells, tags as pills sized to their text (never stretched), supporting text muted to `--ink-3`.
- **Spacing and padding, always** (repeated): nothing touches. Pills, titles, cards and buttons each get their own air; check the gaps by measuring, not by eye.
- **Gavel floats** (8 Oct 2026, Alex's three key frames; transitions are ours): F1 high by the clock, handle down-right · F2 closer/larger over the clock · F3 low by the steps, handle up-right · then a swing up over the clock and the strike on SOLD lands EXACTLY in F3 (his third frame = the last scene) and holds. Never invent a different end pose. F3 (Alex's frame): head upright, big (~half the section height), between the columns, top face seen from above; handle up-right toward the title. Sizes: F1 1.6, F2 2.0, F3 2.9 × base. Smooth lag behind the scroll, slow suspended drift when the scroll rests, no smoothing through the strike. May overlap type (allowed). ≥1200×640 only.
- **Hero lot plate = On the block rostrum**: pill "Lot NN of 12", name + chassis on one line, price card, actions bottom-right. The big "01" numeral is gone. On the block starts at lot 02 (lot 01 is the hero).
- **Prices realised**: paper card stays; only the header is ink. Don't restyle the whole sheet when asked for one element — change exactly what was named.
- **Gavel is draggable** (8 Oct 2026): free rotation in every direction (angle + tilt) about its middle; a short throw, then it stays as turned — never springs back. Scroll choreography continues underneath the user's turn.
- **Status colours on the lot plate** (8 Oct 2026): lot pill red `--lot-red #c4262e`, "Reserve met" green `--res-green #1e7a4c`, both white text; "Reserve not yet met" stays neutral. Same in hero and On the block.
- **v8 is frozen** as the shared concept (with the client crest in the header/footer). **v9 = v8 in Inter Tight** (display and text; Big Shoulders kept for called type and catalogue figures, Chivo Mono for data; caps lockup) **+ the catalogue as v4 cards** (staged hall photo, Lot NN + reserve tag, serif name, Big Shoulders bid/time, watch). Recently sold: leave as is.
- **Header** (8 Oct 2026): 96px tall at ≥1024 so the crest has ~17px above and below; clear gaps crest→name→nav→actions. Every one-screen section re-measured against it (hero, On the block, hammer). Nothing may sit closer than ~40px under the header.
- **Client copy to use** (Alex, 6 Oct 2026): slogan *"Curated cars. Smarter bids."* and primary CTA *"Join the online auction"*, both from the client's poster. Use them as written (BRIEF decision 9); the poster itself stays unused.
