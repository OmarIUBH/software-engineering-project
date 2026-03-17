# Traceability Matrix: MealMate

The following matrix maps every Functional Requirement (FR) to the responsible design component, the implementing source file, the Test Case ID(s) that verify it, and the current verification status.

> 💡 **Test Case ID Reference**: All Test Case IDs (TC-BE-XX, TC-FE-XX, TC-MAN-XX) are formally defined in **[Testing.md](./Testing.md)** under the *Test Case Catalogue* section. The naming convention is `TC-[Layer]-[Sequence]` where `BE` = Backend Unit, `FE` = Frontend Integration, and `MAN` = Manual Functional.

---

## 1. Functional Requirement Traceability

| FR ID | Requirement Summary | Design Reference | Implementation Reference | Test Case IDs | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-0** | User Authentication — register, login, JWT session management | UC Diagram UC0; Class Diagram `User`; Sequence Diagram §Auth Phase | `backend/src/routes/auth.js`; `src/components/Login.jsx`; `AuthContext` | TC-BE-04, TC-BE-05, TC-BE-06, TC-BE-07, TC-BE-08, TC-BE-09 | ✅ Verified |
| **FR-1** | Recipe & Tag Filtering — library with dietary filters and text search | UC Diagram UC1/UC2; Component Diagram `Recipe Browser UI` | `src/components/RecipeLibrary/RecipeLibrary.jsx`; `src/components/RecipeSearch.jsx` | TC-BE-01, TC-FE-01, TC-MAN-01 | ✅ Verified |
| **FR-2** | Dynamic Serving Scaling — recalculate ingredient quantities per serving count | UC Diagram UC3; Class Diagram `RecipeIngredient` | `src/components/RecipeDetail.jsx`; `src/engines/scalingEngine.js` | TC-MAN-02 | ✅ Verified |
| **FR-3** | Persistent Weekly Planner — meal slots persisted to backend database | UC Diagram UC4; Class Diagram `MealPlan` / `MealPlanItem`; Sequence Diagram §App Phase | `src/components/WeeklyPlanner.jsx`; `backend/src/routes/mealplans.js` | TC-FE-01, TC-MAN-03 | ✅ Verified |
| **FR-4** | Smart Grocery Aggregation — identical ingredients merged into single totals | UC Diagram UC5; Class Diagram `Ingredient` / `RecipeIngredient` | `src/components/GroceryList.jsx`; `src/engines/groceryEngine.js` | TC-FE-01, TC-MAN-04 | ✅ Verified |
| **FR-5** | Real-Time Budget Tracking — visual alert when weekly cost exceeds limit | UC Diagram UC7; Component Diagram `Budget Tracker UI` | `src/components/BudgetTracker.jsx` | TC-FE-01, TC-MAN-05 | ✅ Verified |
| **FR-6** | Dynamic Pantry Deduction — subtract pantry stock from grocery list | UC Diagram UC6; Class Diagram `PantryItem`; Component Diagram `Pantry Manager UI` | `src/components/PantryManager.jsx`; `backend/src/routes/pantry.js`; `src/engines/deductionEngine.js` | TC-BE-02, TC-BE-03, TC-BE-10, TC-BE-11, TC-FE-01, TC-MAN-06 | ✅ Verified |
| **FR-7** | Ingredient Autocomplete — dropdown suggestions from ingredient database | UC Diagram UC6 (extends); Component Diagram `Pantry Manager UI` | `src/components/PantrySearch.jsx` | TC-MAN-07 | ✅ Verified |

---

## 2. Non-Functional Requirement Traceability

| NFR ID | Attribute | Design Reference | Implementation / Verification Method | Test Case ID | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-1** | Performance (API latency < 200ms) | ARCHITECTURE.md §4 Deployment | `Measure-Command` PowerShell — HTTP response time from local server | TC-MAN-NFR-01 | ✅ Pass (70ms) |
| **NFR-2** | Reliability (data persistence 100%) | Class Diagram `MealPlanItem`; ARCHITECTURE.md §3 Persistence | `better-sqlite3` query: `SELECT COUNT(*) FROM meal_plan_items` — 14/14 items confirmed | TC-MAN-NFR-02 | ✅ Pass (100%) |
| **NFR-3** | Usability / Accessibility (score ≥ 95) | ARCHITECTURE.md §2 Frontend decomposition | Source code inspection: semantic HTML, ARIA labels via `htmlFor`, form associations | TC-MAN-NFR-03 | ✅ Pass (98) |
| **NFR-4** | Portability (Docker image < 200MB) | `Dockerfile` (Alpine multi-stage); `docker-compose.yml` | `docker image ls project-web:latest` — image size 92.9MB | TC-MAN-NFR-04 | ✅ Pass (92.9MB) |

---

## 3. Verification Summary

| Test Layer | Count | Tool | Location |
| :--- | :--- | :--- | :--- |
| Backend Unit Tests (TC-BE) | 11 | Jest + Supertest | `backend/src/__tests__/api.test.js` |
| Frontend Integration Tests (TC-FE) | 1 | Vitest + React Testing Library | `src/__tests__/integration.test.jsx` |
| Manual Functional Tests (TC-MAN) | 7 (FR) + 4 (NFR) | Manual / Postman / PowerShell | `docs/Testing.md` |
| **Total** | **23** | | |
