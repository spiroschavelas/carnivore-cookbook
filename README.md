# Carnivore Cookbook

Static personal carnivore recipe cookbook with searchable recipes and recipe studio.

## What is included

- Searchable recipe cards loaded from `data/recipes.json`.
- Filters for category, strictness, equipment, tags, dairy level, time, and difficulty.
- Recipe detail view.
- Favourites stored in localStorage.
- Responsive mobile layout.
- `studio.html` for generating valid recipe JSON.

## Recipe Studio

Studio helps create recipe data, preview it, copy JSON, download one recipe, download an updated `recipes.json`, save a local draft, load a local draft, and clear the form.

Studio does not automatically update the deployed site. Commit the updated `data/recipes.json` and redeploy.

## Constraints

- Static HTML, CSS, and JavaScript only.
- No backend.
- No medical, weight-loss, or health claims.
