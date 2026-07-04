const FAVOURITES_KEY = "carnivoreCookbook.favourites";
const STUDIO_DRAFT_KEY = "carnivoreCookbook.studioDraft";

export function getFavourites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVOURITES_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function saveFavourites(favourites) {
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify([...favourites]));
}

export function toggleFavourite(id) {
  const favourites = getFavourites();
  if (favourites.has(id)) {
    favourites.delete(id);
  } else {
    favourites.add(id);
  }
  saveFavourites(favourites);
  return favourites;
}

export function saveDraft(recipe) {
  localStorage.setItem(STUDIO_DRAFT_KEY, JSON.stringify(recipe));
}

export function loadDraft() {
  const raw = localStorage.getItem(STUDIO_DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearDraft() {
  localStorage.removeItem(STUDIO_DRAFT_KEY);
}
