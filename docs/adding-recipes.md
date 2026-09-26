# Adding and publishing recipes

This is the authoritative project workflow for routine recipe and recipe-image maintenance in the Carnivore Cookbook.

Use this guide for normal content additions and corrections. The deployed application and the current repository implementation remain the technical source of truth. If this guide conflicts with the current code, inspect the implementation, fix the discrepancy, and update this guide in the same maintenance cycle.

## Authority map

- `data/recipes.json`: recipes whose `strictness` is `strict`, `animal-based`, or `practical`.
- `data/non-carnivore-recipes.json`: recipes whose `strictness` is `non-carnivore`.
- `docs/recipe-schema.md`: recipe field reference.
- `src/validation.js`: actual runtime validation rules.
- `src/render.js`: actual card, detail, serving-scaling, image, and cooking-method rendering behavior.
- `assets/images/recipes/`: deployed recipe images.
- `IMAGE_CREDITS.md`: image provenance and reuse information.
- `service-worker.js`: client cache behavior.
- GitHub `main`: implementation source of truth.
- GitHub Pages: production deployment.

Routine recipe maintenance does not need a Council review or Codex handoff when the schema, renderer, cache architecture, and deployment model remain unchanged. Use Council or Codex when a change introduces a new schema, rendering behavior, architecture decision, persistent deployment defect, or other material technical uncertainty.

## 1. Inspect before editing

Before changing data:

1. Read the current target data file.
2. Confirm the recipe ID does not already exist.
3. Read `docs/recipe-schema.md` and, when needed, `src/validation.js` and `src/render.js`.
4. Preserve established project conventions instead of inventing a second format.

Choose the correct data file from the recipe's actual strictness. A recipe intentionally outside carnivore scope belongs in `data/non-carnivore-recipes.json` with:

- `strictness: "non-carnivore"`
- `chapter: "Non-carnivore"`
- `category: "non-carnivore"`

## 2. Prepare the recipe data

Use a stable lowercase hyphenated ID. Do not change a published ID merely to improve wording.

Required practical controls:

- Title, chapter/category, description, strictness, dairy, equipment, time, difficulty, ingredients, preparation steps, tags, and cooking-method data must reflect the actual recipe.
- `baseServings` must be a positive whole number. `servings` should match it in stored data.
- Prefer structured numeric ingredient quantities when the value should scale with servings.
- Use `quantity: null` for items such as salt to taste that should not be mechanically scaled.
- Keep `original` ingredient wording as useful source context.
- Numeric ingredients scale in the UI. Cooking time does not scale linearly with servings or meat weight, so recipe text must preserve the real doneness or endpoint test.
- Record the recipe source or adaptation basis in `notes` when one exists.
- Do not invent source facts, quantities, temperatures, timings, provenance, or claims that were not established.
- Do not add medical, weight-loss, or health claims.

### Cooking methods

The supported appliance method keys are:

- `oven`
- `airFryer`
- `blackstone`

Use `best`, `good`, or `acceptable` for usable methods.

Use `notRecommended` or `unavailable` only with a practical note explaining why. The current renderer treats these methods as unsuitable and does not show them as normal selectable method tabs.

If the true recommendation is outside the three appliances, use the `recommendedMethod` object with `type: "other"`, a clear label, reason, and instructions.

## 3. Add the recipe image

Images are optional, but when an image is supplied the image work is part of the same acceptance path as the recipe.

### File preparation

Preferred cookbook convention:

- 16:9 image.
- 1600 x 900 where practical.
- WebP preferred for consistency and size.
- Correct file extension must match the actual encoded format.
- Use the recipe ID as the filename where practical.

Example:

`assets/images/recipes/braised-beef-red-wine-1kg.webp`

The renderer uses a 16:9 frame with `object-fit: cover`, so important food content should remain visible under a center crop.

### Recipe reference

Set the recipe's `image` field to the exact repository path.

Example:

`"image": "assets/images/recipes/braised-beef-red-wine-1kg.webp"`

A version query may be used when a deployed image needs an explicit cache-bust, for example:

`"image": "assets/images/recipes/braised-beef-red-wine-1kg.webp?v=20260926-2"`

Do not add a version query by habit. Use it when deployment verification shows stale client image state or when deliberately replacing an existing asset at the same path.

### Image rights and provenance

Every externally sourced or user-provided recipe image must have an `IMAGE_CREDITS.md` entry.

Record only what is actually known:

- source platform
- source URL
- author
- license or user-confirmed reuse permission
- attribution requirement
- any relevant crop or visual-match note

If the user confirms that an image is free to use but the original URL, author, or exact license is unknown, record that limitation explicitly. Do not invent missing attribution or license details.

## 4. Validate before committing

Before any write to `main`:

1. Parse the edited JSON successfully.
2. Run or reproduce the current collection validation behavior from `src/validation.js`.
3. Confirm there are no duplicate recipe IDs.
4. Confirm the target recipe is in the correct data file.
5. Confirm `baseServings` is a positive integer.
6. Confirm every usable cooking method has instructions.
7. Confirm every unavailable or not-recommended method has a practical note.
8. Confirm the image file exists at the exact referenced path.
9. Confirm the image extension and actual file format agree.
10. Confirm `IMAGE_CREDITS.md` contains the image record when applicable.

When the recipe and image are both ready, prefer one bounded commit containing recipe data, image asset, and image-credit update. A later image-only follow-up is acceptable when the image becomes available after the recipe was already published.

## 5. Commit and deploy

Normal production path:

1. Commit the bounded changes to `main`.
2. Record the resulting commit SHA.
3. Allow the existing GitHub Pages workflow to build and deploy automatically.
4. Verify the Pages workflow run is for the exact intended head SHA.
5. Require both build and deploy jobs to complete successfully.

A successful commit or successful Pages workflow is necessary evidence, but it is not final proof that the user can see the new recipe or image.

## 6. Verify the resulting deployed state

After deployment, perform repository and deployment readback:

1. Re-read the recipe from GitHub `main`.
2. Re-read the image path and `IMAGE_CREDITS.md` entry.
3. Confirm the image asset exists in the `main` tree.
4. Confirm the GitHub Pages deployment artifact contains the new recipe data and image asset when artifact inspection is available.
5. Confirm the deployment run head SHA matches the intended commit.

Do not declare the task complete from a tool success message alone.

## 7. Live application acceptance

Final acceptance is the actual user-visible application.

Use a fresh browser tab/session or a hard reload, especially after service-worker changes.

Check:

1. Open the correct Carnivore or Non-carnivore section.
2. The new recipe card appears.
3. The card image is visible and correctly framed.
4. Open the recipe detail.
5. The detail image is visible.
6. Title, description, ingredients, steps, notes, tags, and recommended method render correctly.
7. Base servings are correct.
8. Change servings and verify representative numeric ingredients scale correctly.
9. Non-numeric ingredients remain sensible.
10. Usable and unsuitable cooking methods appear as intended.
11. No obvious regression appears in an existing recipe or section.

The task is DONE only after the resulting live state is verified. For user-operated acceptance, record the user's confirmation when they verify the live application.

## 8. Image missing after a successful deployment

Do not assume the cause.

Use this sequence:

1. Confirm the exact image path in the recipe JSON.
2. Confirm the image exists at that exact path in GitHub `main`.
3. Confirm the deployed Pages artifact contains the image.
4. Confirm the Pages run succeeded for the exact target SHA.
5. Retry in a fresh browser session or after a hard reload.
6. Inspect `service-worker.js` and current cache behavior.
7. If evidence points to stale client state, add an explicit image version query and increment `CACHE_NAME`, then redeploy.
8. Verify the image in the live application again.

When changing `CACHE_NAME`, increment it deliberately, for example from `carnivore-cookbook-v9` to `carnivore-cookbook-v10`. Do not change cache behavior without a reason.

The 26 September 2026 braised-beef image incident is the reference case: the repository asset, JSON reference, and first Pages deployment were present, but the image was not visible to the user. A later deployment with explicit cache refresh controls was then user-verified as working. This supports the verification and recovery sequence above, but does not by itself prove one universal root cause for every future missing image.

## 9. Definition of done

A recipe addition with an image is complete only when all applicable items below are true:

- Recipe is in the correct authoritative JSON file.
- JSON parses and collection validation passes.
- Recipe ID is unique and stable.
- Source/adaptation information is recorded honestly.
- Base servings and scaling fields are correct.
- Cooking-method behavior matches the current renderer.
- Image asset exists at the referenced path.
- Image provenance is recorded in `IMAGE_CREDITS.md`.
- GitHub `main` contains the intended final state.
- GitHub Pages build and deploy succeeded for the exact intended SHA.
- Fresh-session live verification shows the recipe.
- Fresh-session live verification shows the image on card and detail views.
- Representative serving scaling works.
- Material limitations or untested areas are stated rather than assumed away.

If any item fails, keep the task open, diagnose the specific failed layer, correct it, redeploy when necessary, and verify the resulting state again.
