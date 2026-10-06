# Skills for this project: set up on another machine

Everything used on Golden Lion Auctions, in install order. These commands are run
once per machine, not once per project.

## 1. Design DNA (the house system: design-dna, taste skills, agents, vault)

```
git clone https://github.com/Sigovs/design_dna.git ~/Desktop/WORK/design_dna
cd ~/Desktop/WORK/design_dna && npm install && npm run setup-machine
```

`setup-machine` symlinks `design-dna`, `academic-composition`, `anti-patterns`,
`spacing-taste`, `typography-taste`, `color-taste`, `generated-imagery`,
`dimensionality`, `motion-judgment`, `motion-taste`, `scroll-site`,
`gsap-implementation` and `content-provenance` into `~/.claude/skills/`, and links
the agents (art-director, design-critic, motion-designer and the rest). It uses links,
never copies.

The three anti-slop skills are also vendored, with provenance, in
`design_dna/external/` (no-ai-slop, kill-ai-slop, anti-ui-slop). Those copies are
reading material. The live installs are in step 3.

## 2. Claude Code plugins

Run inside Claude Code:

```
/plugin marketplace add pbakaus/impeccable
/plugin marketplace add AThevon/genjutsu
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin marketplace add greensock/gsap-skills
/plugin marketplace add anthropics/claude-plugins-official

/plugin install impeccable@impeccable
/plugin install genjutsu@genjutsu
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
/plugin install gsap-skills@gsap-skills
/plugin install frontend-design@claude-plugins-official
/plugin install figma@claude-plugins-official
```

## 3. Anti-slop skills (npx skills)

```
npx skills add yetone/kill-ai-slop -y
npx skills add github/awesome-copilot --skill anti-ui-slop --agent claude-code -y
npx skills add petergyang/no-ai-slop --skill no-ai-slop --global --yes
```

- **kill-ai-slop:** a visual and copy de-slop pass with a scanner. Run it against
  this folder:
  `node ~/.claude/skills/kill-ai-slop/scripts/scan.mjs . --exclude=__CONCEPTS --exclude=assets`
  Intentional hits in this repo are pinned with `deslop-ignore`.
- **anti-ui-slop:** use the audit playbook only. Mockups are not products, so
  inert buttons are not findings.
- **no-ai-slop:** for copy (headlines, ledes, emails).

## 4. Services

- **fal** (image models, used for the staged lot images). It is an MCP connector in
  Claude Code and needs the fal account linked. Alex makes the images from here on,
  so it isn't needed for the next steps.
- **Context7** (`npx ctx7@latest …`) for library docs: Lenis, GSAP.

## 5. Project rules

Read `CLAUDE.md` in this folder first. It carries the project rules (Design DNA,
Lenis, the DNA95 pin rule, how to treat client material) and points to BRIEF.md
and README.md.
