# Architecture Documentation — MealMate

## 1. System Overview

MealMate is a **client-side Single Page Application (SPA)**. There is no backend server or database — all data is stored in the user's browser via `localStorage`. The application is served as a static bundle from Netlify's CDN.

```
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │         React 18 SPA (Vite)         │   │
│   │                                     │   │
│   │  ┌──────────┐   ┌───────────────┐   │   │
│   │  │  Router  │   │  Components   │   │   │
│   │  │(React    │──▶│  (UI Layer)   │   │   │
│   │  │ Router 6)│   └───────┬───────┘   │   │
│   │  └──────────┘           │           │   │
│   │                         ▼           │   │
│   │              ┌───────────────────┐  │   │
│   │              │  Engine Modules   │  │   │
│   │              │  (Business Logic) │  │   │
│   │              └────────┬──────────┘  │   │
│   │                       │             │   │
│   │              ┌────────▼──────────┐  │   │
│   │              │  storageService   │  │   │
│   │              │  (localStorage)   │  │   │
│   │              └───────────────────┘  │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
              ▲
              │  HTTPS (static assets)
              ▼
┌─────────────────────────────────────────────┐
│         Netlify CDN (Cloud Hosting)         │
│   - Serves dist/ static bundle              │
│   - SPA redirect: all routes → index.html   │
│   - Auto-deploy on push to GitHub main      │
└─────────────────────────────────────────────┘
```

---

## 2. Component Architecture

The UI is divided into four feature components, each with its own CSS module:

```
src/
├── App.jsx                          # Root: Router + Navbar + Route config
├── main.jsx                         # React DOM entry point
├── index.css                        # Global design tokens and base styles
│
├── components/
│   ├── RecipeLibrary/               # FR-01: Browse, search, filter, scale recipes
│   │   ├── RecipeLibrary.jsx
│   │   └── RecipeLibrary.module.css
│   │
│   ├── MealPlanner/                 # FR-02: Weekly drag-and-drop meal plan + budget
│   │   ├── MealPlanner.jsx
│   │   └── MealPlanner.module.css
│   │
│   ├── GroceryList/                 # FR-03: Auto-generated + pantry-deducted grocery list
│   │   ├── GroceryList.jsx
│   │   └── GroceryList.module.css
│   │
│   ├── PantryManager/               # FR-04: Add/update/remove pantry ingredients
│   │   ├── PantryManager.jsx
│   │   └── PantryManager.module.css
│   │
│   └── NotFound/                    # FR-05: 404 fallback page
│       ├── NotFound.jsx
│       └── NotFound.module.css
│
├── engines/                         # Pure business logic (no React, fully testable)
│   ├── scalingEngine.js             # Scale ingredient quantities by serving count
│   ├── filterEngine.js              # Filter recipes by dietary tags (AND logic)
│   ├── searchEngine.js              # Search recipes by name or ingredient
│   ├── groceryEngine.js             # Aggregate grocery list + pantry deduction + cost
│   ├── ingredientNormalizer.js      # Normalise ingredient names (e.g. "tomatoes" → "tomato")
│   └── unitConversions.js           # Convert between compatible units (ml, L, g, kg, tbsp…)
│
├── services/
│   └── storageService.js            # Thin wrapper around localStorage (get/set recipes, pantry, plan)
│
├── data/
│   └── seedData.js                  # 15 AI-generated seed recipes, 10 pantry items, 1 weekly plan
│
└── tests/
    ├── engines.test.js              # Unit tests for all 6 engine modules (Vitest)
    └── setup.js                     # Vitest setup file
```

---

## 3. Data Flow

### 3.1 Recipe Library
```
seedData.js → storageService → RecipeLibrary
                                    │
                             searchEngine.js
                             filterEngine.js
                             scalingEngine.js
```

### 3.2 Meal Planning → Grocery List
```
RecipeLibrary ──(add to plan)──▶ MealPlanner
                                      │
                               storageService (save plan)
                                      │
                               groceryEngine.generateGroceryList()
                                      │
                               groceryEngine.deductPantry()   ◀── storageService (pantry)
                                      │
                               GroceryList (display)
```

### 3.3 Budget Tracking
```
MealPlanner ──▶ groceryEngine.computeWeeklyCost() ──▶ display total vs budget
```

---

## 4. Routing

| URL Path | Component | Description |
|---|---|---|
| `/` | `RecipeLibrary` | Browse / search / filter recipes |
| `/planner` | `MealPlanner` | Weekly meal plan + budget tracker |
| `/grocery` | `GroceryList` | Auto-generated grocery list |
| `/pantry` | `PantryManager` | Home pantry stock management |
| `/*` | `NotFound` | 404 fallback for unknown routes |

---

## 5. Data Persistence

All data is stored in **browser `localStorage`** under the following keys:

| Key | Contents |
|---|---|
| `mealmate_recipes` | Array of recipe objects (seeded on first load) |
| `mealmate_pantry` | Array of pantry item objects |
| `mealmate_plan` | Weekly meal plan object (7 days × 3 slots) |
| `mealmate_grocery` | Current grocery list array |

---

## 6. Deployment Architecture

### Development (Docker)
```
docker compose -f docker-compose.dev.yml up --build
  └── Dockerfile.dev (node:20-alpine)
        └── npm run dev (Vite HMR on port 5173)
```

### Production (Docker + NGINX)
```
docker compose up --build
  └── Dockerfile (multi-stage)
        ├── Stage 1: node:20-alpine → npm run build → dist/
        └── Stage 2: nginx:alpine → serve dist/ on port 80
              └── docker/nginx.conf (SPA routing + caching headers)
```

### Cloud (Netlify)
```
GitHub push to main
  └── Netlify CI/CD (auto-triggered)
        └── npm run build → dist/
              └── Serve via Netlify CDN
                    └── netlify.toml: [[redirects]] /* → /index.html (SPA support)
```

---

## 7. Testing Strategy

| Type | Tool | Coverage |
|---|---|---|
| Unit Tests | Vitest | All 6 engine modules (scaling, filtering, search, grocery, normaliser, unit conversions) |
| Component Tests | React Testing Library | (Scaffolded — available for future expansion) |
| E2E Tests | Playwright | (Scaffolded — technical debt) |

**Run unit tests:**
```bash
npm test
```
