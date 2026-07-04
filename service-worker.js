const CACHE_NAME = "carnivore-cookbook-v3";
const ASSETS = [
  "index.html",
  "studio.html",
  "manifest.json",
  "styles/main.css",
  "styles/studio.css",
  "src/app.js",
  "src/studio.js",
  "src/search.js",
  "src/filters.js",
  "src/render.js",
  "src/storage.js",
  "src/validation.js",
  "data/recipes.json",
  "data/categories.json",
  "data/tags.json"
];
const DATA_PATHS = new Set(["data/recipes.json", "data/categories.json", "data/tags.json"]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  const url = new URL(event.request.url);
  const relativePath = url.pathname.replace(/^\/carnivore-cookbook\//, "").replace(/^\//, "");

  if (DATA_PATHS.has(relativePath)) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
