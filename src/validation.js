const STRICTNESS = new Set(["strict", "animal-based", "practical"]);
const DAIRY = new Set(["none", "optional", "included", "heavy"]);
const DIFFICULTY = new Set(["easy", "medium", "hard"]);
const METHODS = ["oven", "airFryer", "blackstone"];
const METHOD_QUALITY = new Set(["best", "good", "acceptable", "notRecommended", "unavailable"]);

export function normalizeList(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeLines(value) {
  return String(value || "")
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function recipeFromForm(form) {
  const data = new FormData(form);
  const baseServings = Number(data.get("baseServings") || data.get("servings"));
  const selectedRecommendedMethod = clean(data.get("recommendedMethod"));
  const recommendedMethod = selectedRecommendedMethod === "other"
    ? {
        type: "other",
        label: clean(data.get("recommendedMethodLabel")),
        reason: clean(data.get("recommendedReason")),
        instructions: normalizeLines(data.get("recommendedMethodInstructions"))
      }
    : selectedRecommendedMethod;

  return {
    id: slugify(data.get("id")),
    title: clean(data.get("title")),
    chapter: clean(data.get("chapter") || data.get("category")),
    category: clean(data.get("category") || data.get("chapter")),
    description: clean(data.get("description")),
    strictness: clean(data.get("strictness")),
    reason_not_strict: clean(data.get("reason_not_strict")),
    dairy: clean(data.get("dairy")),
    dairyLevel: clean(data.get("dairy")),
    equipment: normalizeList(data.get("equipment") || ""),
    time_minutes: Number(data.get("time_minutes")),
    prepTimeMinutes: Number(data.get("prepTimeMinutes") || 0),
    difficulty: clean(data.get("difficulty")),
    baseServings,
    servings: baseServings,
    ingredients: normalizeLines(data.get("ingredients")).map(parseIngredientLine),
    steps: normalizeLines(data.get("steps")),
    notes: clean(data.get("notes")),
    tags: normalizeList(data.get("tags") || ""),
    recommendedMethod,
    ...(typeof recommendedMethod === "string" ? { recommendedReason: clean(data.get("recommendedReason")) } : {}),
    methods: buildMethods(data),
    image: clean(data.get("image"))
  };
}

function buildMethods(data) {
  return Object.fromEntries(METHODS.map((method) => {
    const quality = clean(data.get(`${method}Quality`) || "unavailable");
    return [method, {
      available: quality !== "unavailable" && quality !== "notRecommended",
      quality,
      note: clean(data.get(`${method}Note`)),
      instructions: normalizeLines(data.get(`${method}Instructions`))
    }];
  }));
}

export function parseIngredientLine(line) {
  const value = clean(line);
  const countOnlyMatch = value.match(/^(\d+(?:\.\d+)?)(?:\s+)(eggs?|egg yolks?|yolks?)$/i);
  if (countOnlyMatch) {
    return {
      quantity: Number(countOnlyMatch[1]),
      unit: "eggs",
      item: normalizeEggItem(countOnlyMatch[2]),
      original: value
    };
  }

  const match = value.match(/^(\d+(?:\.\d+)?)(?:\s+)(g|kg|ml|tbsp|tsp|eggs?|pieces?|slices?)\s+(.+)$/i);
  if (!match) {
    return { quantity: null, unit: "", item: value, original: value };
  }

  return {
    quantity: Number(match[1]),
    unit: normalizeUnit(match[2]),
    item: clean(match[3]),
    original: value
  };
}

export function validateRecipe(recipe) {
  const errors = [];
  const baseServings = recipe.baseServings ?? recipe.servings;
  const methods = recipe.methods || {};
  const recommendation = recipe.recommendedMethod;
  const isApplianceRecommendation = typeof recommendation === "string" && METHODS.includes(recommendation);
  const isOtherRecommendation = recommendation && typeof recommendation === "object" && recommendation.type === "other";
  const usableMethods = METHODS.filter((method) => {
    const quality = methods[method]?.quality;
    return quality && !["unavailable", "notRecommended"].includes(quality);
  });

  if (!recipe.id) errors.push("ID is required.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.id)) errors.push("ID must use lowercase letters, numbers, and hyphens.");
  if (!recipe.title) errors.push("Title is required.");
  if (!recipe.category && !recipe.chapter) errors.push("Chapter/category is required.");
  if (!recipe.description) errors.push("Description is required.");
  if (!STRICTNESS.has(recipe.strictness)) errors.push("Strictness must be strict, animal-based, or practical.");
  if (recipe.strictness !== "strict" && !recipe.reason_not_strict) errors.push("Reason not strict is required unless strictness is strict.");
  if (recipe.strictness === "strict" && recipe.reason_not_strict) errors.push("Reason not strict should be blank for strict recipes.");
  if (!DAIRY.has(recipe.dairy)) errors.push("Dairy must be none, optional, included, or heavy.");
  if (!Number.isInteger(recipe.time_minutes) || recipe.time_minutes < 1) errors.push("Time minutes must be a positive whole number.");
  if (!Number.isInteger(recipe.prepTimeMinutes) || recipe.prepTimeMinutes < 0) errors.push("Prep time must be zero or a positive whole number.");
  if (!DIFFICULTY.has(recipe.difficulty)) errors.push("Difficulty must be easy, medium, or hard.");
  if (!Number.isInteger(baseServings) || baseServings < 1) errors.push("Base servings must be a positive whole number.");
  if (!Array.isArray(recipe.ingredients) || !recipe.ingredients.length) errors.push("At least one ingredient is required.");
  if (!Array.isArray(recipe.steps) || !recipe.steps.length) errors.push("At least one preparation step is required.");
  if (!isApplianceRecommendation && !isOtherRecommendation) errors.push("Recommended method must be oven, airFryer, blackstone, or an other-method object.");
  if (isApplianceRecommendation && !recipe.recommendedReason) errors.push("Recommended reason is required for appliance recommendations.");
  if (isApplianceRecommendation && !usableMethods.includes(recommendation)) {
    errors.push("Recommended method should match an available appliance method.");
  }
  if (isOtherRecommendation && !clean(recommendation.label)) errors.push("Other recommended method label is required.");
  if (isOtherRecommendation && !clean(recommendation.reason)) errors.push("Other recommended method reason is required.");
  if (isOtherRecommendation && recommendation.instructions && !Array.isArray(recommendation.instructions)) {
    errors.push("Other recommended method instructions must be a list.");
  }

  METHODS.forEach((method) => {
    const methodData = methods[method];
    if (!methodData) {
      errors.push(`${method} method data is required.`);
      return;
    }
    if (!METHOD_QUALITY.has(methodData.quality)) errors.push(`${method} quality is invalid.`);
    if (!["unavailable", "notRecommended"].includes(methodData.quality) && !methodData.instructions?.length) {
      errors.push(`${method} instructions are required when the method is available.`);
    }
    if ((methodData.quality === "notRecommended" || methodData.quality === "unavailable") && !methodData.note) {
      errors.push(`${method} needs a practical note when unavailable or not recommended.`);
    }
  });

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

function normalizeUnit(unit) {
  const value = clean(unit).toLowerCase();
  if (value === "egg") return "eggs";
  if (value === "piece") return "pieces";
  if (value === "slice") return "slices";
  return value;
}

function normalizeEggItem(item) {
  const value = clean(item).toLowerCase();
  if (value === "egg" || value === "eggs") return "eggs";
  if (value === "yolk" || value === "yolks") return "egg yolks";
  return "egg yolks";
}

function clean(value) {
  return String(value || "").trim();
}
