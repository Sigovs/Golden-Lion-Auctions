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
