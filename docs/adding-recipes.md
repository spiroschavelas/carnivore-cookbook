# Adding recipes

Use `studio.html` to create recipe data.

1. Open `studio.html` in the browser.
2. Complete the form.
3. Fix any validation messages.
4. Use `Copy JSON` for one recipe or `Download updated recipes.json` for the full file.
5. Replace `data/recipes.json` with the updated file.
6. Commit the changed JSON file.
7. Redeploy the static site.

Studio stores drafts in localStorage on the same browser. It does not automatically update the deployed site.

## Images

Put recipe images in `assets/images/recipes/` and set the recipe `image` field to that path. Images are optional.

## Data hygiene

- Keep recipe IDs stable after publishing.
- Use existing category and tag names where possible.
- Keep strict recipes free from `reason_not_strict`.
- Add a clear `reason_not_strict` for animal-based or practical recipes.
- Do not include medical, weight-loss, or health claims.
