import { renderPreview } from "./render.js";
import { clearDraft, loadDraft, saveDraft } from "./storage.js";
import { recipeFromForm, validateRecipe, validateRecipeCollection } from "./validation.js";

const form = document.querySelector("#recipe-form");
const jsonOutput = document.querySelector("#json-output");
const validationList = document.querySelector("#validation-list");
const livePreview = document.querySelector("#live-preview");
const statusLine = document.querySelector("#studio-status");
const categoryOptions = document.querySelector("#category-options");
const otherMethodFields = [...document.querySelectorAll("[data-other-method-field]")];

let existingRecipes = [];

init();

async function init() {
  existingRecipes = await loadExistingRecipes();
  populateCategoryOptions();
  bindEvents();
  updateOutput();
}

function bindEvents() {
  form.addEventListener("input", updateOutput);
  form.addEventListener("change", updateOutput);
  form.addEventListener("reset", () => {
    setTimeout(() => {
      clearDraft();
      setStatus("Form cleared and local draft removed.");
      updateOutput();
    });
  });

  document.querySelector("#copy-json").addEventListener("click", copyJson);
  document.querySelector("#download-recipe").addEventListener("click", downloadRecipe);
  document.querySelector("#download-recipes").addEventListener("click", downloadRecipesFile);
  document.querySelector("#save-draft").addEventListener("click", saveLocalDraft);
  document.querySelector("#load-draft").addEventListener("click", loadLocalDraft);
}

function updateOutput() {
  updateOtherMethodFields();
  const recipe = recipeFromForm(form);
  const errors = validateRecipe(recipe);
  jsonOutput.textContent = JSON.stringify(recipe, null, 2);
  renderValidation(errors);
  renderPreview(livePreview, recipe, errors);
}

function renderValidation(errors) {
  validationList.innerHTML = "";
  const items = errors.length ? errors : ["Recipe JSON is valid."];
  items.forEach((message) => {
    const item = document.createElement("li");
    item.textContent = message;
    item.className = errors.length ? "invalid" : "valid";
    validationList.append(item);
  });
}

async function copyJson() {
  const recipe = recipeFromForm(form);
  const errors = validateRecipe(recipe);
  if (errors.length) {
    setStatus("Fix validation errors before copying JSON.");
    return;
  }

  await navigator.clipboard.writeText(JSON.stringify(recipe, null, 2));
  setStatus("Recipe JSON copied.");
}

function downloadRecipe() {
  const recipe = recipeFromForm(form);
  const errors = validateRecipe(recipe);
  if (errors.length) {
    setStatus("Fix validation errors before downloading recipe JSON.");
    return;
  }

  downloadJson(`${recipe.id}.json`, recipe);
  setStatus("Recipe JSON downloaded.");
}

function downloadRecipesFile() {
  const recipe = recipeFromForm(form);
  const errors = validateRecipe(recipe);
  if (errors.length) {
    setStatus("Fix validation errors before downloading updated recipes.json.");
    return;
  }

  const withoutDuplicate = existingRecipes.filter((item) => item.id !== recipe.id);
  const updated = [...withoutDuplicate, recipe].sort((a, b) => a.title.localeCompare(b.title));
  const collectionErrors = validateRecipeCollection(updated);
  if (collectionErrors.length) {
    setStatus("Updated recipes.json has validation errors.");
    return;
  }

  downloadJson("recipes.json", updated);
  setStatus("Updated recipes.json downloaded. Commit it to data/recipes.json and redeploy.");
}

function saveLocalDraft() {
  const recipe = recipeFromForm(form);
  saveDraft(recipe);
  setStatus("Draft saved locally in this browser.");
}

function loadLocalDraft() {
  const draft = loadDraft();
  if (!draft) {
    setStatus("No local draft found.");
    return;
  }

  fillForm(draft);
  updateOutput();
  setStatus("Local draft loaded.");
}

function fillForm(recipe) {
  const baseServings = recipe.baseServings ?? recipe.servings;
  const recommendation = normalizeRecommendationForForm(recipe);
  Object.entries({
    id: recipe.id,
    title: recipe.title,
    chapter: recipe.chapter || recipe.category,
    category: recipe.category,
    description: recipe.description,
    strictness: recipe.strictness,
    reason_not_strict: recipe.reason_not_strict,
    dairy: recipe.dairy,
    equipment: (recipe.equipment || []).join(", "),
    time_minutes: recipe.time_minutes,
    prepTimeMinutes: recipe.prepTimeMinutes,
    difficulty: recipe.difficulty,
    baseServings,
    ingredients: (recipe.ingredients || []).map(formatIngredientForForm).join("\n"),
    steps: (recipe.steps || []).join("\n"),
    notes: recipe.notes,
    tags: (recipe.tags || []).join(", "),
    recommendedMethod: recommendation.method,
    recommendedMethodLabel: recommendation.label,
    recommendedReason: recommendation.reason,
    recommendedMethodInstructions: recommendation.instructions,
    ovenQuality: recipe.methods?.oven?.quality,
    ovenNote: recipe.methods?.oven?.note,
    ovenInstructions: (recipe.methods?.oven?.instructions || []).join("\n"),
    airFryerQuality: recipe.methods?.airFryer?.quality,
    airFryerNote: recipe.methods?.airFryer?.note,
    airFryerInstructions: (recipe.methods?.airFryer?.instructions || []).join("\n"),
    blackstoneQuality: recipe.methods?.blackstone?.quality,
    blackstoneNote: recipe.methods?.blackstone?.note,
    blackstoneInstructions: (recipe.methods?.blackstone?.instructions || []).join("\n"),
    image: recipe.image
  }).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field) field.value = value ?? "";
  });
  updateOtherMethodFields();
}

function normalizeRecommendationForForm(recipe) {
  const method = recipe.recommendedMethod;
  if (method && typeof method === "object" && method.type === "other") {
    return {
      method: "other",
      label: method.label,
      reason: method.reason,
      instructions: (method.instructions || []).join("\n")
    };
  }

  if (method === "none") {
    return {
      method: "other",
      label: "No listed appliance",
      reason: recipe.recommendedReason,
      instructions: ""
    };
  }

  return {
    method,
    label: "",
    reason: recipe.recommendedReason,
    instructions: ""
  };
}

function updateOtherMethodFields() {
  const isOther = form.elements.namedItem("recommendedMethod")?.value === "other";
  otherMethodFields.forEach((field) => {
    field.hidden = !isOther;
  });
}

async function loadExistingRecipes() {
  try {
    const response = await fetch("data/recipes.json");
    return response.ok ? response.json() : [];
  } catch {
    return [];
  }
}

function populateCategoryOptions() {
  const categories = [...new Set(existingRecipes.map((recipe) => recipe.category).filter(Boolean))].sort();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    categoryOptions.append(option);
  });
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function setStatus(message) {
  statusLine.textContent = message;
}

function formatIngredientForForm(ingredient) {
  if (typeof ingredient === "string") return ingredient;
  if (!ingredient || ingredient.quantity == null || !ingredient.unit) return ingredient?.original || ingredient?.item || "";
  return `${ingredient.quantity} ${ingredient.unit} ${ingredient.item}`.trim();
}
