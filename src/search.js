export function recipeMatchesSearch(recipe, query) {
  const value = query.trim().toLowerCase();
  if (!value) {
    return true;
  }

  const recommendedMethod = recipe.recommendedMethod;
  const recommendedMethodText = recommendedMethod && typeof recommendedMethod === "object"
    ? [recommendedMethod.type, recommendedMethod.label, recommendedMethod.reason, ...(recommendedMethod.instructions || [])].join(" ")
    : recommendedMethod;

  const haystack = [
    recipe.title,
    recipe.chapter,
    recipe.category,
    recipe.description,
    recipe.strictness,
    recipe.dairy,
    recipe.difficulty,
    recipe.notes,
    recommendedMethodText,
    recipe.recommendedReason,
    ...recipe.ingredients.map((ingredient) => typeof ingredient === "string" ? ingredient : `${ingredient.quantity || ""} ${ingredient.unit || ""} ${ingredient.item || ingredient.original || ""}`),
    ...recipe.steps,
    ...recipe.equipment,
    ...recipe.tags,
    ...Object.entries(recipe.methods || {}).flatMap(([method, value]) => [method, value.quality, value.note, ...(value.instructions || [])])
  ].join(" ").toLowerCase();

  return haystack.includes(value);
}
