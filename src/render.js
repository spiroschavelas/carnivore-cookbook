const METHOD_LABELS = {
  oven: "Oven",
  airFryer: "Air fryer",
  blackstone: "Blackstone"
};

const APPLIANCE_METHODS = ["oven", "airFryer", "blackstone"];

export function renderRecipeCards(container, recipes, favourites, handlers) {
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  recipes.forEach((recipe) => {
    const card = document.createElement("article");
    card.className = "recipe-card";
    card.innerHTML = recipeCardMarkup(recipe, favourites.has(recipe.id));

    card.querySelector("[data-action='view']").addEventListener("click", () => handlers.onView(recipe));
    card.querySelector("[data-action='favourite']").addEventListener("click", () => handlers.onFavourite(recipe.id));
    fragment.append(card);
  });

  container.append(fragment);
}

export function renderRecipeDetail(container, recipe, isFavourite) {
  const baseServings = recipe.baseServings ?? recipe.servings;
  const selectedMethod = initialSelectedMethod(recipe);
  container.innerHTML = `
    <header class="detail-header">
      <p class="eyebrow">${escapeHtml(recipe.chapter || recipe.category)}</p>
      <h2>${escapeHtml(recipe.title)}</h2>
      <p class="detail-description">${escapeHtml(recipe.description || "")}</p>
      <p>${formatMeta(recipe)}</p>
      <p>${isFavourite ? "Saved as favourite" : "Not saved as favourite"}</p>
    </header>
    ${recipeImageMarkup(recipe, "detail-image-frame")}
    <section class="recommended-box">
      <h3>${escapeHtml(recommendationHeading(recipe))}</h3>
      <p>${escapeHtml(recommendedReason(recipe))}</p>
      ${recommendedInstructionsMarkup(recipe)}
    </section>
    ${recipe.reason_not_strict ? `<p class="notice">Practical note: ${escapeHtml(recipe.reason_not_strict)}</p>` : ""}
    <section class="ingredients-section">
      <div class="section-heading-row">
        <h3>Ingredients</h3>
        <label class="servings-control">
          <span>Servings</span>
          <input id="servings-input" type="number" min="1" step="1" value="${baseServings}">
        </label>
      </div>
      <p class="base-servings">Base recipe: ${baseServings} serving${baseServings === 1 ? "" : "s"}</p>
      <ul id="scaled-ingredients"></ul>
    </section>
    <section>
      <h3>Preparation</h3>
      <ol>${recipe.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>
    <section class="method-section">
      <h3>Cooking method</h3>
      <div class="method-tabs" role="tablist" aria-label="Cooking methods">
        ${APPLIANCE_METHODS.map((method) => methodButtonMarkup(recipe, method, selectedMethod)).join("")}
      </div>
      <div id="method-detail"></div>
    </section>
    ${recipe.notes ? `<section><h3>Notes</h3><p>${escapeHtml(recipe.notes)}</p><p class="scale-note">Cooking time may need adjustment for larger batches.</p></section>` : ""}
    <section>
      <h3>Tags</h3>
      <p class="tag-row">${recipe.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</p>
    </section>
  `;

  const ingredientsList = container.querySelector("#scaled-ingredients");
  const servingsInput = container.querySelector("#servings-input");
  const methodDetail = container.querySelector("#method-detail");

  const updateIngredients = () => {
    const servings = Math.max(1, Number(servingsInput.value) || baseServings);
    ingredientsList.innerHTML = recipe.ingredients
      .map((ingredient) => `<li>${escapeHtml(formatIngredient(ingredient, servings / baseServings))}</li>`)
      .join("");
  };

  const selectMethod = (method) => {
    container.querySelectorAll("[data-method]").forEach((button) => {
      button.classList.toggle("active", button.dataset.method === method);
      button.setAttribute("aria-selected", String(button.dataset.method === method));
    });
    methodDetail.innerHTML = methodDetailMarkup(recipe, method);
  };

  servingsInput.addEventListener("input", updateIngredients);
  container.querySelectorAll("[data-method]").forEach((button) => {
    button.addEventListener("click", () => selectMethod(button.dataset.method));
  });

  updateIngredients();
  selectMethod(selectedMethod);
}

export function recipeCardMarkup(recipe, isFavourite) {
  const availableMethods = APPLIANCE_METHODS
    .filter((method) => isUsableMethod(recipe.methods?.[method]))
    .map((method) => methodLabel(method))
    .join(", ");

  return `
    ${recipeImageMarkup(recipe, "card-image-frame")}
    <div class="card-top">
      <div>
        <p class="eyebrow">${escapeHtml(recipe.chapter || recipe.category)}</p>
        <h2>${escapeHtml(recipe.title)}</h2>
      </div>
      <button class="icon-button ${isFavourite ? "active" : ""}" type="button" data-action="favourite" aria-label="${isFavourite ? "Remove favourite" : "Add favourite"}">
        ${isFavourite ? "Saved" : "Save"}
      </button>
    </div>
    <p class="card-description">${escapeHtml(recipe.description || "")}</p>
    <p class="card-meta">${formatMeta(recipe)}</p>
    <p class="method-summary"><strong>Best:</strong> ${escapeHtml(recommendedLabel(recipe))}</p>
    <p class="method-summary"><strong>Methods:</strong> ${escapeHtml(availableMethods || "None listed")}</p>
    <p class="tag-row">${recipe.tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</p>
    <button class="text-button" type="button" data-action="view">View recipe</button>
  `;
}

function recipeImageMarkup(recipe, className) {
  if (!recipe.image) return "";
  const imagePath = escapeHtml(recipe.image);
  const altText = escapeHtml(recipe.title);
  return `
    <div class="recipe-image-frame ${className}">
      <img src="${imagePath}" alt="${altText}" loading="lazy" decoding="async" onerror="this.hidden=true; this.nextElementSibling.hidden=false;">
      <span class="recipe-image-placeholder" hidden>No image available</span>
    </div>
  `;
}

export function renderPreview(container, recipe, errors = []) {
  container.innerHTML = errors.length
    ? `<p class="empty-state">Complete the required fields to preview the recipe.</p>`
    : recipeCardMarkup(recipe, false);
}

export function formatMeta(recipe) {
  const baseServings = recipe.baseServings ?? recipe.servings;
  return `${recipe.time_minutes} min | ${recipe.difficulty} | base ${baseServings} serving${baseServings === 1 ? "" : "s"} | dairy ${recipe.dairy}`;
}

export function formatIngredient(ingredient, ratio) {
  if (typeof ingredient === "string") {
    return ingredient;
  }
  if (!ingredient || typeof ingredient.quantity !== "number" || !ingredient.unit) {
    return ingredient?.original || ingredient?.item || "";
  }

  const quantity = roundQuantity(ingredient.quantity * ratio, ingredient.unit);
  if (ingredient.unit === "eggs") {
    return formatEggIngredient(quantity, ingredient.item);
  }

  const unit = formatUnit(quantity, ingredient.unit);
  return `${quantity} ${unit} ${ingredient.item}`.trim();
}

function methodDetailMarkup(recipe, method) {
  const methodData = recipe.methods?.[method] || { quality: "unavailable", note: "No instructions available.", instructions: [] };
  const warning = methodData.quality === "notRecommended" || methodData.quality === "unavailable";
  return `
    <article class="method-detail ${warning ? "warning" : ""}">
      <p><strong>${escapeHtml(methodLabel(method))} quality:</strong> ${escapeHtml(methodData.quality)}</p>
      ${methodData.note ? `<p>${escapeHtml(methodData.note)}</p>` : ""}
      ${methodData.instructions?.length
        ? `<ol>${methodData.instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`
        : `<p>No cooking instructions for this method.</p>`}
    </article>
  `;
}

function methodButtonMarkup(recipe, method, selectedMethod) {
  const methodData = recipe.methods?.[method] || { quality: "unavailable" };
  const disabled = methodData.quality === "unavailable" ? "" : "";
  return `<button type="button" class="method-tab" data-method="${method}" aria-selected="${method === selectedMethod}" ${disabled}>${methodLabel(method)}</button>`;
}

function initialSelectedMethod(recipe) {
  if (APPLIANCE_METHODS.includes(recipe.recommendedMethod)) return recipe.recommendedMethod;
  return APPLIANCE_METHODS.find((method) => isUsableMethod(recipe.methods?.[method])) || "oven";
}

function recommendationHeading(recipe) {
  return `Recommended method: ${recommendedLabel(recipe)}`;
}

function recommendedLabel(recipe) {
  const method = recipe.recommendedMethod;
  if (method && typeof method === "object" && method.type === "other") return method.label || "Other method";
  if (method === "none") return "No appliance recommendation";
  return methodLabel(method);
}

function recommendedReason(recipe) {
  const method = recipe.recommendedMethod;
  if (method && typeof method === "object" && method.type === "other") return method.reason || "";
  return recipe.recommendedReason || "";
}

function recommendedInstructionsMarkup(recipe) {
  const method = recipe.recommendedMethod;
  const instructions = method && typeof method === "object" && method.type === "other" ? method.instructions || [] : [];
  if (!instructions.length) return "";
  return `<ol class="recommended-instructions">${instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
}

function isUsableMethod(methodData) {
  return methodData && !["unavailable", "notRecommended"].includes(methodData.quality);
}

function roundQuantity(value, unit) {
  if (unit === "g") return Math.max(5, Math.round(value / 5) * 5);
  if (unit === "kg") return Number(value.toFixed(value < 1 ? 2 : 1));
  if (unit === "ml") return Math.max(5, Math.round(value / 5) * 5);
  if (unit === "tbsp" || unit === "tsp") return Math.round(value * 2) / 2;
  if (unit === "eggs" || unit === "pieces" || unit === "slices") return Math.max(1, Math.round(value));
  return Number(value.toFixed(1));
}

function formatUnit(quantity, unit) {
  if (quantity === 1 && unit === "eggs") return "egg";
  if (quantity === 1 && unit === "pieces") return "piece";
  if (quantity === 1 && unit === "slices") return "slice";
  return unit;
}

function formatEggIngredient(quantity, item) {
  const normalized = String(item || "eggs").trim().toLowerCase();
  if (normalized === "egg" || normalized === "eggs") {
    return `${quantity} ${quantity === 1 ? "egg" : "eggs"}`;
  }
  if (normalized === "yolk" || normalized === "yolks" || normalized === "egg yolk" || normalized === "egg yolks") {
    return `${quantity} egg ${quantity === 1 ? "yolk" : "yolks"}`;
  }
  if (normalized.startsWith("egg ")) {
    return `${quantity} ${quantity === 1 ? normalized.replace(/s$/, "") : normalized}`;
  }
  return `${quantity} ${normalized}`;
}

function methodLabel(method) {
  return METHOD_LABELS[method] || method || "Other method";
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
