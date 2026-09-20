import { buildFilterOptions, populateSelect, readFilters, recipeMatchesFilters, resetFilters } from "./filters.js";
import { renderRecipeCards, renderRecipeDetail } from "./render.js";
import { recipeMatchesSearch } from "./search.js";
import { getFavourites, toggleFavourite } from "./storage.js";
import { validateRecipeCollection } from "./validation.js";

const state = {
  recipes: [],
  favourites: getFavourites(),
  section: "carnivore"
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
  clearFilters: document.querySelector("#clear-filters"),
  filterToggle: document.querySelector("#filter-toggle"),
  toolbar: document.querySelector(".toolbar"),
  sectionButtons: [...document.querySelectorAll("[data-section]")],
  libraryTitle: document.querySelector("#library-title")
};

init();

async function init() {
  try {
    const [carnivoreResponse, nonCarnivoreResponse] = await Promise.all([
      fetch("data/recipes.json"),
      fetch("data/non-carnivore-recipes.json")
    ]);
    if (!carnivoreResponse.ok) throw new Error(`Recipe data failed to load: ${carnivoreResponse.status}`);
    if (!nonCarnivoreResponse.ok) throw new Error(`Non-carnivore recipe data failed to load: ${nonCarnivoreResponse.status}`);
    const [carnivoreRecipes, nonCarnivoreRecipes] = await Promise.all([
      carnivoreResponse.json(),
      nonCarnivoreResponse.json()
    ]);
    state.recipes = [...carnivoreRecipes, ...nonCarnivoreRecipes];

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
  const options = buildFilterOptions(recipesForSection());
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
  elements.sectionButtons.forEach((button) => {
    button.addEventListener("click", () => setSection(button.dataset.section));
  });
  elements.toolbar.addEventListener("input", applySearchAndFilters);
  elements.toolbar.addEventListener("change", applySearchAndFilters);
  elements.filterToggle.addEventListener("click", () => {
    const expanded = elements.toolbar.classList.toggle("filters-open");
    elements.filterToggle.setAttribute("aria-expanded", String(expanded));
    elements.filterToggle.textContent = expanded ? "Hide filters" : "Show filters";
  });
  elements.clearFilters.addEventListener("click", () => {
    elements.search.value = "";
    resetFilters();
    applySearchAndFilters();
  });
}

function applySearchAndFilters() {
  const filters = readFilters();
  const query = elements.search.value;
  const sectionRecipes = recipesForSection();
  const visibleRecipes = sectionRecipes.filter((recipe) =>
    recipeMatchesSearch(recipe, query) && recipeMatchesFilters(recipe, filters, state.favourites)
  );

  renderRecipeCards(elements.list, visibleRecipes, state.favourites, {
    onView: openRecipe,
    onFavourite: (id) => {
      state.favourites = toggleFavourite(id);
      applySearchAndFilters();
    }
  });

  elements.total.textContent = sectionRecipes.length;
  elements.visible.textContent = visibleRecipes.length;
  elements.favouriteCount.textContent = sectionRecipes.filter((recipe) => state.favourites.has(recipe.id)).length;
  elements.empty.hidden = visibleRecipes.length > 0;
}

function setSection(section) {
  if (!["carnivore", "non-carnivore"].includes(section) || section === state.section) return;
  state.section = section;
  elements.sectionButtons.forEach((button) => {
    const active = button.dataset.section === section;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  elements.libraryTitle.textContent = section === "non-carnivore" ? "Non-carnivore" : "Carnivore";
  elements.search.value = "";
  setupFilters();
  resetFilters();
  applySearchAndFilters();
}

function recipesForSection() {
  const showNonCarnivore = state.section === "non-carnivore";
  return state.recipes.filter((recipe) =>
    showNonCarnivore ? recipe.strictness === "non-carnivore" : recipe.strictness !== "non-carnivore"
  );
}

function openRecipe(recipe) {
  renderRecipeDetail(elements.detail, recipe, state.favourites.has(recipe.id));
  elements.dialog.scrollTop = 0;
  elements.detail.scrollTop = 0;
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
