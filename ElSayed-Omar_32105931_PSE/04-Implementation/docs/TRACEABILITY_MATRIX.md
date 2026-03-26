# Traceability Matrix: MealMate

The following matrix maps the Functional Requirements (FR) to the implementing modules/components and the corresponding test cases for project validation.

> 💡 **Reference**: All Test Case IDs below are documented in **[Testing.md](./Testing.md)**:
> - **Functional test cases** (`test-*`) — see the [Functional Requirement Verification](./Testing.md#2-functional-requirement-verification-fr) section.
> - **Backend API integration tests** (`TC-B01` to `TC-B11`) — see the [Backend API Integration Tests (Jest + Supertest)](./Testing.md#backend-api-integration-tests-jest--supertest) section.
> - **Frontend integration test** (`TC-F01`) — see the [Frontend Integration Test (Vitest + JSDOM)](./Testing.md#frontend-integration-test-vitest--jsdom) section.

## 1. Functional Requirements (FR) Traceability

| FR ID | Requirement Name | Component / Module | Implementation Detail | Test Case ID | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-0** | User Authentication | `AuthContext.jsx`, `backend/routes/auth.js` | JWT-based session management with `bcrypt` password hashing and protected Express middleware. | `TC-B04` – `TC-B09` | Automated (API Integration) |
| **FR-1** | Recipe Filtering | `RecipeLibrary.jsx` | Client-side filtering logic using `Array.filter()` against multiple dietary boolean flags. | `test-filter-diet` | Manual + Integration |
| **FR-2** | Serving Scaling | `RecipeDetail.jsx`, `useScaling.js` | Dynamic ingredient quantity recalculation using a custom hook and utility conversion functions. | `test-scale-ingredients` | Manual |
| **FR-3** | Weekly Planning | `WeeklyPlanner.jsx` | Grid-based drag-and-drop / click interface with backend persistence to the `meal_plan_items` table. | `test-add-to-plan`, `TC-F01` | Manual + Integration |
| **FR-4** | Grocery Aggregation | `GroceryList.jsx` | Algorithm that sums quantities for identical ingredient IDs while maintaining unit compatibility. | `test-aggregate-grocery`, `TC-F01` | Manual + Integration |
| **FR-5** | Budget Tracking | `BudgetTracker.jsx` | Reactive calculation of total cost vs. user-defined weekly budget, with visual threshold alerts. | `test-budget-update`, `TC-F01` | Manual + Integration |
| **FR-6** | Pantry Deduction | `PantryManager.jsx`, `GroceryList.jsx` | Logic that subtracts quantities found in `pantry_items` from the total grocery list requirements. | `test-pantry-deduction`, `TC-B02`, `TC-B03` | Manual + API Integration |
| **FR-7** | Pantry Autocomplete | `PantrySearch.jsx` | Frontend fuzzy search against the consolidated ingredient master list for fast data entry. | `test-autocomplete-hint` | Manual |

## 2. Non-Functional Requirements (NFR) Traceability

| NFR ID | Attribute | Implementing Mechanism / Component | Verification Method |
| :--- | :--- | :--- | :--- |
| **NFR-1** | Performance | Backend API Optimization | Postman API Performance Audit (< 200ms latency) |
| **NFR-2** | Reliability | Backend API, SQLite database | Postman Automated Collection Tests |
| **NFR-3** | Interface Consistency | Standardized JSON Responses | Postman JSON Schema Validations |
| **NFR-4** | Portability | `Dockerfile` (Alpine-based), Docker Compose | `docker build` and `docker run` validation |

## 3. Verification Summary
- **Automated Tests**: 11 backend API integration tests (Jest + Supertest) covering auth, pantry CRUD, and API contracts. 1 frontend integration test (Vitest + JSDOM) covering the full user journey (add recipe → grocery list → pantry).
- **Audit Tools**: Postman Automated Collection Runner for Performance (NFR-1) and Reliability/Validations (NFR-2, NFR-3).
- **Manual QA**: Verifying the UI flow (e.g., adding to plan and checking if the grocery list reflects the new items correctly) and session persistence.
