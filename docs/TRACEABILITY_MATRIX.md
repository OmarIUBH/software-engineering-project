# Traceability Matrix: MealMate

The following matrix maps the Functional Requirements (FR) to the implementing modules/components and the corresponding test cases for Phase 2 validation.

| FR ID | Requirement Name | Component / Module | Test Case ID |
| :--- | :--- | :--- | :--- |
| FR-1 | Recipe Filtering | `RecipeLibrary.jsx` | `test-filter-diet` |
| FR-2 | Serving Scaling | `RecipeDetail.jsx`, `useScaling.js` | `test-scale-ingredients` |
| FR-3 | Weekly Planning | `WeeklyPlanner.jsx` | `test-add-to-plan` |
| FR-4 | Grocery Aggregation | `GroceryList.jsx` | `test-aggregate-grocery` |
| FR-5 | Budget Tracking | `BudgetTracker.jsx` | `test-budget-update` |
| FR-6 | Pantry Deduction | `PantryManager.jsx`, `GroceryList.jsx`| `test-pantry-deduction` |
| FR-7 | Pantry Autocomplete| `PantrySearch.jsx` | `test-autocomplete-hint` |

## Verification Summary
- **Unit Tests**: Handled by Vitest, focusing on pure functions (scaling, deduction logic).
- **Manual QA**: Verifying the UI flow (e.g., adding to plan and checking if the grocery list reflects the new items correctly).
