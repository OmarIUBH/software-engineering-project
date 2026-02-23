# Requirements Document — MealMate

## 1. Functional Requirements

### FR-01: Recipe Library
- The system shall display a filterable library of at least 10 recipes.
- Each recipe shall include: name, description, prep time, servings, estimated cost per serving, dietary tags, ingredients (with quantities and units), and step-by-step instructions.
- Users shall be able to search recipes by name or ingredient.
- Users shall be able to filter recipes by dietary tag (vegetarian, vegan, gluten-free, dairy-free, high-protein).
- Users shall be able to scale servings, with ingredient quantities adjusting automatically.

### FR-02: Meal Planner
- The system shall provide a 7-day weekly meal planner (Monday–Sunday).
- Each day shall have three meal slots: breakfast, lunch, and dinner.
- Users shall be able to assign recipes to meal slots via drag-and-drop.
- The weekly plan shall persist across browser sessions.
- The system shall display a running total of the estimated weekly food cost.
- The system shall indicate when the estimated total exceeds the user's set weekly budget.

### FR-03: Grocery List
- The system shall automatically generate a consolidated grocery list from the active weekly meal plan.
- The system shall aggregate duplicate ingredients across recipes (e.g., 200g + 150g = 350g).
- The system shall convert compatible units where possible (e.g., L → ml, kg → g).
- Users shall be able to check off individual grocery items.
- Users shall be able to optionally deduct pantry items from the grocery list.
- Users shall be able to manually add or remove grocery items.

### FR-04: Pantry Manager
- Users shall be able to add ingredients (name, quantity, unit) to their pantry.
- If an ingredient already exists in the pantry with the same unit, the quantity shall be merged.
- Users shall be able to update the quantity of a pantry item inline.
- Users shall be able to remove individual pantry items.
- Pantry data shall persist across browser sessions.

### FR-05: Navigation & Routing
- The application shall provide a persistent navigation bar accessible on all pages.
- Direct URL access to any valid route (e.g., `/pantry`, `/grocery`) shall load the correct view.
- Accessing an unknown URL shall display a user-friendly 404 "Page Not Found" page with a "Go Back Home" button.

---

## 2. Non-Functional Requirements

### NFR-01: Performance
- The production build shall load within **3 seconds** on a standard broadband connection.
- The Vite-optimised bundle size shall not exceed 300 kB (gzipped).

### NFR-02: Usability
- The interface shall be self-explanatory; a first-time user shall be able to navigate all features without any instructions.
- All interactive elements shall have descriptive labels and ARIA attributes where applicable.

### NFR-03: Persistence
- All user data (pantry items, meal plan, grocery list) shall be stored in `localStorage` and shall persist across browser sessions on the same device.

### NFR-04: Compatibility
- The application shall be fully functional in the latest versions of Chrome, Firefox, Edge, and Safari.

### NFR-05: Deployability
- The application shall be deployable via Docker (development and production) and as a cloud-hosted static site.
- All environment setup shall be achievable through a single command per the `README.md`.

### NFR-06: Maintainability
- Business logic shall be separated into dedicated engine modules (`src/engines/`) and tested independently of the UI.
- Unit tests shall cover all engine modules.

---

## 3. User Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | student | browse recipes filtered by "vegan" | I can find meals that match my diet |
| US-02 | user | search for "pasta" in the recipe library | I can quickly find what I'm looking for |
| US-03 | meal planner | drag a recipe into Monday's dinner slot | my week is planned without manual typing |
| US-04 | budget-conscious user | see my total weekly food cost | I can stay within my budget |
| US-05 | shopper | generate a grocery list from my weekly plan | I don't have to manually write what to buy |
| US-06 | household manager | mark what I already have in my pantry | my grocery list only shows what I need to buy |
| US-07 | user | check off grocery items in the store | I can track what I've already picked up |
| US-08 | user | have my data saved when I close the browser | I don't have to re-enter everything each time |

---

## 4. Technical Debt

| Item | Description | Priority |
|---|---|---|
| No backend/auth | Data is stored only in localStorage; not synced across devices | Low (student project scope) |
| No accessibility audit | ARIA roles and keyboard navigation not fully tested | Medium |
| No E2E tests | Playwright tests are scaffolded but not implemented | Medium |
| No offline support | No Service Worker / PWA capabilities | Low |
