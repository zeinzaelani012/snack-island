# Snack Island — Master Prompt

Copy this whole document into Lovable after importing the repo. Follow it in
order. Do not skip the rules.

---

## WHO YOU ARE WORKING WITH

This is **Snack Island** — a finished, tested gamified English-learning app
for one Grade 6 learner (A2 level). It is complete and passing 93 tests. Your
only job in this phase is to **replace the placeholder SVG illustrations with
generated art**. You are the art director, not the developer.

## NON-NEGOTIABLE RULES — read before anything else

1. **English-only.** The app teaches English through pictures. There is no
   translation feature anywhere. Never add one, never add non-English strings.
2. **Art swaps only.** Do not modify, refactor or "improve" game logic, the
   store (`src/store/`), libraries (`src/lib/`), components, pages, tests, or
   the design system (`src/index.css`, `tailwind.config.ts`). Only image files
   under `public/img/` change in this phase.
3. **Keep every filename and path exactly as it is.** The app loads images
   from fixed paths (e.g. `/img/food/chocolate.svg`). When you generate a
   replacement, save it at the same path. If your generator outputs PNG, ask
   before changing any reference.
4. **One image per response.** Generate exactly one image, replace its file,
   then STOP and wait for my OK. Generating sets at once makes the style
   drift.
5. **NO TEXT, NO LETTERS, NO NUMBERS inside any image.** Every visible word in
   this app is HTML text. Images are art only.
6. **Palette and outline discipline.** Every image: flat vector style, thick
   3px dark-teal outline, limited palette of teal `#12726E`, sand `#F4E7D3`,
   coral `#C7421C`, gold `#F5B33C` (crates and stone faces use teal, sand and
   coral only), soft single shadow, generous margins.

## THE CONSISTENCY LOOP

After finishing each phase below: display all of that phase's images side by
side, compare them, and regenerate any that look like a different artist made
them — same prompt, same phase — before moving on.

---

## PHASE 1 — Food icons (16 images)

Template (substitute the word in brackets, one image per response):

> [food name] icon illustration, centred, generous margin around it. Flat
> vector illustration, thick 3px dark-teal outline, limited palette of teal
> #12726E, sand #F4E7D3, coral #C7421C and gold #F5B33C, soft single shadow,
> clean transparent background, NO TEXT, NO LETTERS.

Order and save paths (`public/img/food/`):

| # | Food name for the prompt | Replace file |
|---|---|---|
| 1 | chocolate bar | `chocolate.svg` |
| 2 | wrapped candy | `candy.svg` |
| 3 | stack of cookies | `cookies.svg` |
| 4 | popcorn box | `popcorn.svg` |
| 5 | french fries | `fries.svg` |
| 6 | bowl of cereal | `cereal.svg` |
| 7 | soda can with straw | `soda.svg` |
| 8 | milk carton | `milk.svg` |
| 9 | two apples | `apples.svg` |
| 10 | bunch of bananas | `bananas.svg` |
| 11 | fruit basket | `fruit.svg` |
| 12 | vegetables | `vegetables.svg` |
| 13 | tomatoes on the vine | `tomatoes.svg` |
| 14 | bowl of rice | `rice.svg` |
| 15 | bowl of soup | `soup.svg` |
| 16 | cup of yogurt | `yogurt.svg` |

Do a side-by-side consistency check of all 16 before Phase 2.

## PHASE 2 — R-blend word icons (9 images)

Same template as Phase 1. Save paths (`public/img/food/`):

| # | Word for the prompt | Replace file |
|---|---|---|
| 17 | plate of breakfast food | `breakfast.svg` |
| 18 | two brothers standing together | `brothers.svg` |
| 19 | open wooden drawer | `drawer.svg` |
| 20 | child's drawing with pencil | `drawing.svg` |
| 21 | two friends waving | `friends.svg` |
| 22 | green frog | `frog.svg` |
| 23 | elderly grandparents together | `grandparents.svg` |
| 24 | bunch of grapes | `grapes.svg` |
| 25 | princess with crown | `princess.svg` |

Consistency check of all 9 before Phase 3.

## PHASE 3 — Market crates (5 images)

Base prompt:

> A single wooden market crate seen from the front, empty inside, with a small
> chalk label area left blank. Flat vector illustration, thick 3px dark-teal
> outline, limited palette of teal #12726E, sand #F4E7D3 and coral #C7421C,
> soft single shadow, NO TEXT, NO LETTERS, plain background.

Five variants — **vary the wood tone (light to dark)** and add exactly one
small motif each. Save paths (`public/img/crates/`):

| # | Variant | Motif | Replace file |
|---|---|---|---|
| 26 | lightest wood | a leaf | `fruit.svg` |
| 27 | light wood | a carrot | `vegetables.svg` |
| 28 | medium wood | a wrapped sweet | `snacks.svg` |
| 29 | darker wood | a cup | `drinks.svg` |
| 30 | darkest wood | a bowl | `meals.svg` |

The bucket names (fruit, vegetables, snacks, drinks, meals) are HTML text the
app overlays on the chalk label area — the label must stay blank.

## PHASE 4 — The island map (1 image)

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

Replace `public/img/snack-island-map-square.svg`. The map is square and must
keep ten generous empty clearings — the app places its own nodes and HTML
labels on top.

## PHASE 5 — Story art (2 images)

**Stone faces** (stage 4 intro) — replace `public/img/stone-faces.svg`:

> Two carved stone faces side by side on a rocky headland, one smiling and one
> frowning, moss on the rock. Flat vector illustration, thick 3px dark-teal
> outline, limited palette of teal, sand and coral, soft single shadow, NO
> TEXT, NO LETTERS.

**Summit** (boss intro) — replace `public/img/snack-summit.svg`:

> A flat rock summit with a flag pole and a view of a whole tropical island
> below, morning light. Flat vector illustration, thick 3px dark-teal outline,
> limited palette of teal #12726E, sand #F4E7D3, coral #C7421C and gold
> #F5B33C, soft single shadow, NO TEXT, NO LETTERS.

## PHASE 6 — Badge patches (7 images)

Template:

> A circular embroidered patch with a single motif — [motif]. Flat vector,
> thick dark-teal outline, teal/sand/coral/gold palette, NO TEXT.

Save paths (`public/img/badges/`):

| # | Motif | Replace file |
|---|---|---|
| 31 | a speech bubble with a wave | `braveVoice.svg` |
| 32 | an apple | `wordCollector.svg` |
| 33 | a thumbs-up | `patternKeeper.svg` |
| 34 | two mirrored arrows | `echoTwin.svg` |
| 35 | an ear with sound waves | `clearSpeaker.svg` |
| 36 | a tidepool | `tideRunner.svg` |
| 37 | a plate with a star | `snackProfiler.svg` |

---

## DEFINITION OF DONE

- Every file listed above is replaced with generated art at the same path
- No text, letters or numbers baked into any image
- Style is consistent across all 37 images
- The app runs, no broken images on the map, profile, badges, stages, dash or
  teacher screens
- No other file in the repository was changed

Do all of this by following the phases in order, one image per response.
