const ANY = "any";

export const FILTER_DEFAULTS = {
  chapter: ANY,
  category: ANY,
  recommendedMethod: ANY,
  strictness: ANY,
  equipment: ANY,
  tags: ANY,
  dairy: ANY,
  time: ANY,
  difficulty: ANY,
  favouritesOnly: false
};

export function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function buildFilterOptions(recipes) {
  return {
    chapters: uniqueSorted(recipes.map((recipe) => recipe.chapter || recipe.category)),
    categories: uniqueSorted(recipes.map((recipe) => recipe.category)),
    recommendedMethods: [
      { label: "Oven", value: "oven" },
      { label: "Air fryer", value: "airFryer" },
      { label: "Blackstone", value: "blackstone" },
      { label: "Other method", value: "other" }
    ],
    strictness: ["strict", "animal-based", "practical"],
    equipment: uniqueSorted(recipes.flatMap((recipe) => recipe.equipment)),
    tags: uniqueSorted(recipes.flatMap((recipe) => recipe.tags)),
    dairy: ["none", "optional", "included", "heavy"],
    time: [
      { label: "Any time", value: ANY },
      { label: "15 minutes or less", value: "15" },
      { label: "30 minutes or less", value: "30" },
      { label: "60 minutes or less", value: "60" }
    ],
    difficulty: ["easy", "medium", "hard"]
  };
}

export function recipeMatchesFilters(recipe, filters, favourites) {
  if (filters.chapter !== ANY && (recipe.chapter || recipe.category) !== filters.chapter) return false;
  if (filters.category !== ANY && recipe.category !== filters.category) return false;
  if (filters.recommendedMethod !== ANY && recommendedMethodKey(recipe) !== filters.recommendedMethod) return false;
  if (filters.strictness !== ANY && recipe.strictness !== filters.strictness) return false;
  if (filters.equipment !== ANY && !recipe.equipment.includes(filters.equipment)) return false;
  if (filters.tags !== ANY && !recipe.tags.includes(filters.tags)) return false;
  if (filters.dairy !== ANY && recipe.dairy !== filters.dairy) return false;
  if (filters.time !== ANY && recipe.time_minutes > Number(filters.time)) return false;
  if (filters.difficulty !== ANY && recipe.difficulty !== filters.difficulty) return false;
  if (filters.favouritesOnly && !favourites.has(recipe.id)) return false;
  return true;
}

function recommendedMethodKey(recipe) {
  const method = recipe.recommendedMethod;
  if (method && typeof method === "object" && method.type === "other") return "other";
  if (method === "none") return "other";
  return method || "other";
}

export function readFilters(documentRef = document) {
  return {
    chapter: documentRef.querySelector("#filter-chapter").value,
    category: documentRef.querySelector("#filter-category").value,
    recommendedMethod: documentRef.querySelector("#filter-recommended-method").value,
    strictness: documentRef.querySelector("#filter-strictness").value,
    equipment: documentRef.querySelector("#filter-equipment").value,
    tags: documentRef.querySelector("#filter-tags").value,
    dairy: documentRef.querySelector("#filter-dairy").value,
    time: documentRef.querySelector("#filter-time").value,
    difficulty: documentRef.querySelector("#filter-difficulty").value,
    favouritesOnly: documentRef.querySelector("#filter-favourites").checked
  };
}

export function resetFilters(documentRef = document) {
  Object.entries({
    "#filter-chapter": ANY,
    "#filter-category": ANY,
    "#filter-recommended-method": ANY,
    "#filter-strictness": ANY,
    "#filter-equipment": ANY,
    "#filter-tags": ANY,
    "#filter-dairy": ANY,
    "#filter-time": ANY,
    "#filter-difficulty": ANY
  }).forEach(([selector, value]) => {
    documentRef.querySelector(selector).value = value;
  });
  documentRef.querySelector("#filter-favourites").checked = false;
}

export function populateSelect(select, options, label = "Any") {
  select.innerHTML = "";
  const anyOption = document.createElement("option");
  anyOption.value = ANY;
  anyOption.textContent = label;
  select.append(anyOption);

  options.forEach((option) => {
    const item = document.createElement("option");
    if (typeof option === "string") {
      item.value = option;
      item.textContent = option;
    } else {
      item.value = option.value;
      item.textContent = option.label;
    }
    select.append(item);
  });
}
