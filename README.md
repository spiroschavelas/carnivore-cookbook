# Carnivore Cookbook

Static personal recipe cookbook focused on carnivore cooking, with a clearly separated non-carnivore section and recipe studio.

Published site: https://spiroschavelas.github.io/carnivore-cookbook/

## What is included

- Searchable recipe cards loaded from `data/recipes.json`.
- Filters for category, strictness, equipment, tags, dairy level, time, and difficulty.
- Recipe detail view.
- Recommended cooking method with oven, air fryer, and Blackstone method selector.
- Serving calculator that scales ingredient quantities from each recipe's base servings.
- Favourites stored in localStorage.
- Responsive mobile layout.
- `studio.html` for generating valid recipe JSON.

## Recipe Studio

Studio helps create recipe data, preview it, copy JSON, download one recipe, download an updated `recipes.json`, save a local draft, load a local draft, and clear the form. It includes base servings, dairy level, recommended method, and per-appliance instructions.

Studio does not automatically update the deployed site. Commit the updated recipe data and redeploy.

## Maintenance

Use `docs/adding-recipes.md` as the authoritative project workflow for adding or updating a recipe, adding its image, recording image provenance, deploying through GitHub Pages, handling cache issues, and completing live verification.

Use `docs/recipe-schema.md` for the recipe field reference.

## Constraints

- Static HTML, CSS, and JavaScript only.
- No backend.
- No medical, weight-loss, or health claims.
