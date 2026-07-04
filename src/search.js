export function recipeMatchesSearch(recipe, query) {
  const value = query.trim().toLowerCase();
  if (!value) {
    return true;
  }

  const haystack = [
    recipe.title,
    recipe.category,
    recipe.strictness,
    recipe.dairy,
    recipe.difficulty,
    recipe.notes,
    ...recipe.ingredients,
    ...recipe.steps,
    ...recipe.equipment,
    ...recipe.tags
  ].join(" ").toLowerCase();

  return haystack.includes(value);
}
