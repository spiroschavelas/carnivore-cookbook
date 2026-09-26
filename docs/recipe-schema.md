# Recipe schema

Every recipe object in either `data/recipes.json` or `data/non-carnivore-recipes.json` should use this shape:

```json
{
  "id": "",
  "title": "",
  "chapter": "",
  "category": "",
  "description": "",
  "strictness": "strict | animal-based | practical | non-carnivore",
  "reason_not_strict": "",
  "dairy": "none | optional | included | heavy",
  "dairyLevel": "none | optional | included | heavy",
  "equipment": [],
  "time_minutes": 0,
  "prepTimeMinutes": 0,
  "difficulty": "easy | medium | hard",
  "baseServings": 1,
  "servings": 1,
  "ingredients": [
    {
      "quantity": 250,
      "unit": "g",
      "item": "ground beef",
      "original": "250 g ground beef"
    }
  ],
  "steps": [],
  "notes": "",
  "tags": [],
  "recommendedMethod": "oven | airFryer | blackstone",
  "recommendedReason": "",
  "methods": {
    "oven": {
      "available": true,
      "quality": "best | good | acceptable | notRecommended | unavailable",
      "note": "",
      "instructions": []
    },
    "airFryer": {
      "available": true,
      "quality": "best | good | acceptable | notRecommended | unavailable",
      "note": "",
      "instructions": []
    },
    "blackstone": {
      "available": true,
      "quality": "best | good | acceptable | notRecommended | unavailable",
      "note": "",
      "instructions": []
    }
  },
  "image": ""
}
```

For a true recommended method outside the three listed appliances, use an object:

```json
{
  "recommendedMethod": {
    "type": "other",
    "label": "Stovetop custard + ice cream maker",
    "reason": "This recipe needs gentle stovetop custard preparation and churning.",
    "instructions": []
  }
}
```

## Field rules

- `id`: unique lowercase slug using letters, numbers, and hyphens.
- `chapter`: display chapter shown on cards and detail pages.
- `category`: filter category.
- `description`: short practical card summary.
- `dairy` and `dairyLevel`: dairy is valid in this cookbook. Use these fields for filtering and clarity, not as a warning.
- `baseServings`: positive whole-number serving count used for ingredient scaling.
- `servings`: stored base serving value and normally the same as `baseServings`.
- `ingredients`: use structured numeric quantities where practical. Non-numeric items can use `quantity: null` and keep the original text.
- `recommendedMethod`: one of `oven`, `airFryer`, or `blackstone`, or an object with `type: "other"`, `label`, `reason`, and optional `instructions`.
- `recommendedReason`: short practical reason for appliance-string recommendations. Other-method recipes put the reason inside the `recommendedMethod` object.
- `methods`: include all three appliance keys. Usable methods need instructions. `notRecommended` and `unavailable` need a practical note and are treated by the current renderer as unsuitable rather than normal selectable method tabs.
- `image`: optional repository-relative image path under `assets/images/recipes/`. A cache-busting query string may be appended when deliberately required by deployment verification.

Avoid medical, weight-loss, and health claims in recipes, notes, and UI copy.

For recipes intentionally outside the carnivore scope, use `strictness: "non-carnivore"`, `chapter: "Non-carnivore"`, and `category: "non-carnivore"`, and store them in `data/non-carnivore-recipes.json`.

For the operational addition, image, deployment, cache, and acceptance sequence, follow `docs/adding-recipes.md`.
