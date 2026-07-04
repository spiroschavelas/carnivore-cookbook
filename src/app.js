import { buildFilterOptions, populateSelect, readFilters, recipeMatchesFilters, resetFilters } from "./filters.js";
import { renderRecipeCards, renderRecipeDetail } from "./render.js";
import { recipeMatchesSearch } from "./search.js";
import { getFavourites, toggleFavourite } from "./storage.js";
import { validateRecipeCollection } from "./validation.js";

const state = {
  recipes: [],
  favourites: getFavourites()
};

const elements = {
  search: document.querySelector("#search-input"),
  list: document.querySelector("#recipe-list"),
  empty: document.querySelector("#empty-state"),
  total: document.querySelector("#total-count"),
  visible: document.querySelector("#visible-count"),
  favouriteCount: document.querySelector("#favourite-count"),
  dialog: document.querySelector("#recipe-dialog"),
  detail: document.querySelector("#recipe-detail"),
  clearFilters: document.querySelector("#clear-filters")
};

init();

async function init() {
  try {
    const response = await fetch("data/recipes.json");
    if (!response.ok) throw new Error(`Recipe data failed to load: ${response.status}`);
    state.recipes = await response.json();

    const validationErrors = validateRecipeCollection(state.recipes);
    if (validationErrors.length) {
      console.warn("Recipe validation warnings", validationErrors);
    }

    setupFilters();
    bindEvents();
    applySearchAndFilters();
    registerServiceWorker();
  } catch (error) {
    elements.empty.hidden = false;
    elements.empty.textContent = "Recipe data could not be loaded.";
    console.error(error);
  }
}

function setupFilters() {
  const options = buildFilterOptions(state.recipes);
  populateSelect(document.querySelector("#filter-chapter"), options.chapters, "Any chapter");
  populateSelect(document.querySelector("#filter-category"), options.categories, "Any category");
  populateSelect(document.querySelector("#filter-recommended-method"), options.recommendedMethods, "Any best method");
  populateSelect(document.querySelector("#filter-strictness"), options.strictness, "Any strictness");
  populateSelect(document.querySelector("#filter-equipment"), options.equipment, "Any equipment");
  populateSelect(document.querySelector("#filter-tags"), options.tags, "Any tag");
  populateSelect(document.querySelector("#filter-dairy"), options.dairy, "Any dairy level");
  populateSelect(document.querySelector("#filter-time"), options.time.slice(1), "Any time");
  populateSelect(document.querySelector("#filter-difficulty"), options.difficulty, "Any difficulty");
}

function bindEvents() {
  document.querySelector(".toolbar").addEventListener("input", applySearchAndFilters);
  document.querySelector(".toolbar").addEventListener("change", applySearchAndFilters);
  elements.clearFilters.addEventListener("click", () => {
    elements.search.value = "";
    resetFilters();
    applySearchAndFilters();
  });
}

function applySearchAndFilters() {
  const filters = readFilters();
  const query = elements.search.value;
  const visibleRecipes = state.recipes.filter((recipe) =>
    recipeMatchesSearch(recipe, query) && recipeMatchesFilters(recipe, filters, state.favourites)
  );

  renderRecipeCards(elements.list, visibleRecipes, state.favourites, {
    onView: openRecipe,
    onFavourite: (id) => {
      state.favourites = toggleFavourite(id);
      applySearchAndFilters();
    }
  });

  elements.total.textContent = state.recipes.length;
  elements.visible.textContent = visibleRecipes.length;
  elements.favouriteCount.textContent = state.favourites.size;
  elements.empty.hidden = visibleRecipes.length > 0;
}

function openRecipe(recipe) {
  renderRecipeDetail(elements.detail, recipe, state.favourites.has(recipe.id));
  if (typeof elements.dialog.showModal === "function") {
    elements.dialog.showModal();
  } else {
    elements.dialog.setAttribute("open", "");
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  }
}
