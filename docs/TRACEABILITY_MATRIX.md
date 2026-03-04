# Traceability Matrix: MealMate

The following matrix maps the Functional Requirements (FR) to the implementing modules/components and the corresponding test cases for project validation.

| FR ID | Requirement Name | Component / Module | Test Case ID |
| :--- | :--- | :--- | :--- |
| FR-1 | Recipe Filtering | `RecipeLibrary.jsx` | `test-filter-diet` |
| FR-2 | Serving Scaling | `RecipeDetail.jsx`, `useScaling.js` | `test-scale-ingredients` |
| FR-3 | Weekly Planning | `WeeklyPlanner.jsx` | `test-add-to-plan` |
| FR-4 | Grocery Aggregation | `GroceryList.jsx` | `test-aggregate-grocery` |
| FR-5 | Budget Tracking | `BudgetTracker.jsx` | `test-budget-update` |
| FR-6 | Pantry Deduction | `PantryManager.jsx`, `GroceryList.jsx`| `test-pantry-deduction` |
| FR-7 | Pantry Autocomplete| `PantrySearch.jsx` | `test-autocomplete-hint` |

## 2. Non-Functional Requirements (NFR) Traceability

| NFR ID | Attribute | Implementing Mechanism / Component | Verification Method |
| :--- | :--- | :--- | :--- |
| **NFR-1** | Performance | Vite build optimization, Code splitting | Lighthouse Performance Audit, Chrome DevTools |
| **NFR-2** | Reliability | Backend API, SQLite, `localStorage` (cache) | Manual session persistence testing |
| **NFR-3** | Usability | CSS Media Queries, Semantic HTML | Lighthouse Accessibility Audit (Score ≥ 95) |
| **NFR-4** | Portability | `Dockerfile` (Alpine-based), Docker Compose | `docker build` and `docker run` validation |

## 3. Verification Summary
- **Automated Tests**: Handled by Vitest, focusing on pure functions (scaling, deduction logic).
- **Audit Tools**: Google Lighthouse for Performance (NFR-1), Accessibility (NFR-3).
- **Manual QA**: Verifying the UI flow (e.g., adding to plan and checking if the grocery list reflects the new items correctly) and session persistence (NFR-2).
