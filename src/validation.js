const STRICTNESS = new Set(["strict", "animal-based", "practical"]);
const DAIRY = new Set(["none", "optional", "included", "heavy"]);
const DIFFICULTY = new Set(["easy", "medium", "hard"]);

export function normalizeList(value) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function recipeFromForm(form) {
  const data = new FormData(form);
  return {
    id: slugify(data.get("id")),
    title: clean(data.get("title")),
    category: clean(data.get("category")),
    strictness: clean(data.get("strictness")),
    reason_not_strict: clean(data.get("reason_not_strict")),
    dairy: clean(data.get("dairy")),
    equipment: normalizeList(data.get("equipment") || ""),
    time_minutes: Number(data.get("time_minutes")),
    difficulty: clean(data.get("difficulty")),
    servings: Number(data.get("servings")),
    ingredients: normalizeList(data.get("ingredients") || ""),
    steps: normalizeList(data.get("steps") || ""),
    notes: clean(data.get("notes")),
    tags: normalizeList(data.get("tags") || ""),
    image: clean(data.get("image"))
  };
}

export function validateRecipe(recipe) {
  const errors = [];
  if (!recipe.id) errors.push("ID is required.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.id)) errors.push("ID must use lowercase letters, numbers, and hyphens.");
  if (!recipe.title) errors.push("Title is required.");
  if (!recipe.category) errors.push("Category is required.");
  if (!STRICTNESS.has(recipe.strictness)) errors.push("Strictness must be strict, animal-based, or practical.");
  if (recipe.strictness !== "strict" && !recipe.reason_not_strict) errors.push("Reason not strict is required unless strictness is strict.");
  if (recipe.strictness === "strict" && recipe.reason_not_strict) errors.push("Reason not strict should be blank for strict recipes.");
  if (!DAIRY.has(recipe.dairy)) errors.push("Dairy must be none, optional, included, or heavy.");
  if (!Number.isInteger(recipe.time_minutes) || recipe.time_minutes < 1) errors.push("Time minutes must be a positive whole number.");
  if (!DIFFICULTY.has(recipe.difficulty)) errors.push("Difficulty must be easy, medium, or hard.");
  if (!Number.isInteger(recipe.servings) || recipe.servings < 1) errors.push("Servings must be a positive whole number.");
  if (!recipe.ingredients.length) errors.push("At least one ingredient is required.");
  if (!recipe.steps.length) errors.push("At least one step is required.");
  return errors;
}

export function validateRecipeCollection(recipes) {
  const errors = [];
  const ids = new Set();
  recipes.forEach((recipe, index) => {
    validateRecipe(recipe).forEach((error) => errors.push(`${recipe.id || `Recipe ${index + 1}`}: ${error}`));
    if (ids.has(recipe.id)) errors.push(`${recipe.id}: duplicate ID.`);
    ids.add(recipe.id);
  });
  return errors;
}

export function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clean(value) {
  return String(value || "").trim();
}
