# Recipe schema

Every recipe in `data/recipes.json` must match this shape:

```json
{
  "id": "",
  "title": "",
  "category": "",
  "strictness": "strict | animal-based | practical",
  "reason_not_strict": "",
  "dairy": "none | optional | included | heavy",
  "equipment": [],
  "time_minutes": 0,
  "difficulty": "easy | medium | hard",
  "servings": 1,
  "ingredients": [],
  "steps": [],
  "notes": "",
  "tags": [],
  "image": ""
}
```

## Field rules

- `id`: unique lowercase slug using letters, numbers, and hyphens.
- `title`: display name shown on recipe cards and detail views.
- `category`: single category, for example `mains`, `breakfast`, or `desserts`.
- `strictness`: one of `strict`, `animal-based`, or `practical`.
- `reason_not_strict`: blank for strict recipes, required for non-strict recipes.
- `dairy`: one of `none`, `optional`, `included`, or `heavy`.
- `equipment`: array of equipment strings used by filters.
- `time_minutes`: positive whole number.
- `difficulty`: one of `easy`, `medium`, or `hard`.
- `servings`: positive whole number.
- `ingredients`: non-empty array of ingredient strings.
- `steps`: non-empty array of preparation steps.
- `notes`: optional plain text.
- `tags`: array of short labels used by filters and search.
- `image`: optional path to an image under `assets/images/recipes/`.

Avoid medical, weight-loss, and health claims in recipes, notes, and UI copy.
