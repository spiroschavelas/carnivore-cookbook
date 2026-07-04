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
  container.innerHTML = `
    <header class="detail-header">
      <p class="eyebrow">${escapeHtml(recipe.category)}</p>
      <h2>${escapeHtml(recipe.title)}</h2>
      <p>${formatMeta(recipe)}</p>
      <p>${isFavourite ? "Saved as favourite" : "Not saved as favourite"}</p>
    </header>
    ${recipe.reason_not_strict ? `<p class="notice">Not strict: ${escapeHtml(recipe.reason_not_strict)}</p>` : ""}
    <section><h3>Ingredients</h3><ul>${recipe.ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
    <section><h3>Steps</h3><ol>${recipe.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></section>
    ${recipe.notes ? `<section><h3>Notes</h3><p>${escapeHtml(recipe.notes)}</p></section>` : ""}
    <section><h3>Tags</h3><p class="tag-row">${recipe.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</p></section>
  `;
}

export function recipeCardMarkup(recipe, isFavourite) {
  return `
    <div class="card-top">
      <div>
        <p class="eyebrow">${escapeHtml(recipe.category)}</p>
        <h2>${escapeHtml(recipe.title)}</h2>
      </div>
      <button class="icon-button ${isFavourite ? "active" : ""}" type="button" data-action="favourite" aria-label="${isFavourite ? "Remove favourite" : "Add favourite"}">
        ${isFavourite ? "Saved" : "Save"}
      </button>
    </div>
    <p class="card-meta">${formatMeta(recipe)}</p>
    ${recipe.reason_not_strict ? `<p class="reason">Not strict: ${escapeHtml(recipe.reason_not_strict)}</p>` : ""}
    <p class="tag-row">${recipe.tags.slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</p>
    <button class="text-button" type="button" data-action="view">View recipe</button>
  `;
}

export function renderPreview(container, recipe, errors = []) {
  container.innerHTML = errors.length
    ? `<p class="empty-state">Complete the required fields to preview the recipe.</p>`
    : recipeCardMarkup(recipe, false);
}

export function formatMeta(recipe) {
  return `${recipe.time_minutes} min | ${recipe.difficulty} | ${recipe.servings} serving${recipe.servings === 1 ? "" : "s"} | ${recipe.strictness} | dairy ${recipe.dairy}`;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
