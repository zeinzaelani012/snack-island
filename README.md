# Snack Island 🏝️

A gamified English-learning app for one Grade 6 learner (A2 level). Explore an
island trail: name snack words, sort the market, agree with echoes, and face the
boss at Snack Summit. English-only — meaning is carried by pictures, simple
English and examples, never translation.

## Commands

```bash
npm run dev       # vite dev server
npm run build     # tsc && vite build
npm run test      # vitest run
npm run lint      # oxlint
```

## Design system (tokens, primitives, rules)

Tailwind v4 runs **CSS-first**: breakpoints and theme colors live in `@theme`
in `src/index.css`. `tailwind.config.ts` mirrors the breakpoints only so
tooling that reads a JS config stays in sync.

### Breakpoints

`xs 0px · sm 480px · md 768px · lg 1024px · xl 1280px · 2xl 1600px`

### Tokens — the only source of size

Every font size and width in the app reads from the custom properties on
`:root` in `src/index.css`. Hard-coded font sizes are banned, and Tailwind's
`text-[Xpx]` utilities must not be used — they would ignore the user's
text-scale setting.

| Group | Tokens |
| --- | --- |
| Type (fluid, capped) | `--fs-sm`, `--fs-body`, `--fs-option`, `--fs-h3`, `--fs-h2`, `--fs-h1`, `--fs-display` |
| Spacing | `--sp-1…6`, `--gap-section`, `--pad-page` |
| Containers | `--w-focus` 640px, `--w-focus-lg` 1120px, `--w-content` 1100px, `--w-map` 720px |
| Controls | `--h-control` 48→56px, `--radius`, `--radius-sm` |
| Readability caps | `--measure-body` 68ch, `--measure-instruction` 56ch, `--measure-reading` 62ch (also as `.measure-*` classes) |

Text scaling: `html { font-size: calc(100% * var(--text-scale, 1)) }`. The
Settings control writes `--text-scale` (1 / 1.15 / 1.3) on `<html>` via
`AppSettings`, so every rem-based size — type, spacing, containers — scales
together.

### Layout primitives (`src/components/layout/`)

Use these instead of ad-hoc wrapper divs:

- `<FocusColumn>` — width `var(--w-focus)`, centred, `var(--pad-page)` padding. Entry, onboarding, results.
- `<WideColumn>` — width `var(--w-focus-lg)`, centred. Dash, teacher views.
- `<ContentColumn>` — width `var(--w-content)`, centred. Broadest shell.
- `<PlayScreen>` — every stage and boss screen: `min-height 100dvh` (never
  `vh`), flex column, header/footer pinned via the `header`/`footer` props,
  content centred and allowed to shrink.

### Global rules

1. `box-sizing: border-box` on everything (enforced in `index.css`).
2. `body { overflow-x: hidden }` — nothing may exceed 100vw at 320px.
3. Images: `max-width: 100%`, `height: auto`, `display: block` (enforced).
4. No fixed pixel heights on text containers — let content define height.
5. `dvh` for any full-viewport surface, never `vh`.
6. Body copy gets a measure cap: `.measure-body` / `.measure-instruction` /
   `.measure-reading`.

### Play-screen height budget

The primary use is a teacher sharing their screen on a **1280×720 call**. An
item screen must fit at 1280×720 with **no vertical scrolling**:

```
header  ≤ 64px
footer  ≤ 72px
content = remaining ~584px, centred (design to ≤ 560px of content)
```

Verify any new item screen at exactly 1280×720 before merging.

---

## Lovable asset generation (final art)

All current illustrations are placeholders. Generate final art in Lovable with
these prompts, **one image at a time** (never as a set — the style drifts),
then view everything side by side and regenerate any outlier.

**Island map** (square, replaces `public/img/snack-island-map-square.svg` —
same prompt is also embedded in that file):

> Top-down illustrated treasure map of a single tropical island on a parchment
> background, composed as a square. A dotted path climbs from a wooden dock at
> the bottom through a cove of sweets, an orchard of banana and apple trees, a
> market with five wooden stalls, a rocky headland with two stone faces, a
> small cove between echoing cliffs, a cliff face, a shoreline, a grove of
> small trees, and a flat mountain summit with a flag. Ten landmark clearings
> along the path. Flat vector illustration, thick 3px dark-teal outline,
> limited palette of teal #12726E, sand #F4E7D3, coral #C7421C and gold
> #F5B33C, soft single shadow, ocean border, NO TEXT, NO LETTERS, no labels,
> generous empty space in the centre of each clearing.

**Market crates** (`public/img/crates/{fruit,vegetables,snacks,drinks,meals}.svg`
— five variants; vary the wood tone and add one small motif each: a leaf for
fruit, a carrot for vegetables, a wrapped sweet for snacks, a cup for drinks,
a bowl for meals):

> A single wooden market crate seen from the front, empty inside, with a small
> chalk label area left blank. Flat vector illustration, thick 3px dark-teal
> outline, limited palette of teal #12726E, sand #F4E7D3 and coral #C7421C,
> soft single shadow, NO TEXT, NO LETTERS, plain background.

Bucket names are HTML text overlaid on the crates — never baked into the
images.

**Food icons** (`public/img/food/{id}.svg`, one per word in `src/data/words.ts`:
chocolate, candy, cookies, popcorn, fries, cereal, soda, milk, apples,
bananas, fruit, vegetables, tomatoes, rice, soup, yogurt — substitute the food
name for the bracket):

> [food name] icon illustration, centred, generous margin around it. Flat
> vector illustration, thick 3px dark-teal outline, limited palette of teal
> #12726E, sand #F4E7D3, coral #C7421C and gold #F5B33C, soft single shadow,
> clean transparent background, NO TEXT, NO LETTERS.

**Stone faces** (stage 4 intro, `public/img/stone-faces.svg`):

> Two carved stone faces side by side on a rocky headland, one smiling and one
> frownng, moss on the rock. Flat vector illustration, thick 3px dark-teal
> outline, limited palette of teal, sand and coral, soft single shadow, NO
> TEXT, NO LETTERS.

**Boss summit** (boss intro, `public/img/snack-summit.svg`):

> A flat rock summit with a flag pole and a view of a whole tropical island
> below, morning light. Flat vector illustration, thick 3px dark-teal outline,
> limited palette of teal #12726E, sand #F4E7D3, coral #C7421C and gold
> #F5B33C, soft single shadow, NO TEXT, NO LETTERS.

**R-blend word icons** (stage 6, `public/img/food/{id}.svg`, one call each:
breakfast, brothers, drawer, drawing, friends, frog, grandparents, grapes,
princess — substitute the word for the bracket):

> [word] icon illustration, centred, generous margin. Flat vector
> illustration, thick 3px dark-teal outline, limited palette of teal, sand,
> coral and gold, soft single shadow, transparent background, NO TEXT.

**Badge patches** (`public/img/badges/{id}.svg`, one call each, motif in the
bracket): braveVoice (a speech bubble with a wave), wordCollector (an apple),
patternKeeper (a thumbs-up), echoTwin (two mirrored arrows), clearSpeaker (an
ear with sound waves), tideRunner (a tidepool), snackProfiler (a plate with a
star):

> A circular embroidered patch with a single motif — [motif]. Flat vector,
> thick dark-teal outline, teal/sand/coral/gold palette, NO TEXT.

---

This template originally shipped with Vite + React + Oxlint; see
[Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) to
extend `.oxlintrc.json`.
