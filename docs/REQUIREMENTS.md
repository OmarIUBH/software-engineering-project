# Requirements Specification: MealMate

## 1. Functional Requirements (FR)

| FR-ID | Requirement Title | Description (1 sentence) | Inputs | Outputs | Acceptance Criteria (Given/When/Then) | Priority (Must/Should/Could) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-1** | Recipe Filtering | Users shall filter the recipe database by predefined dietary tags. | Dietary tags, Search query | Filtered recipe list | Given a set of tags, when the user selects 'Vegan', then only vegan recipes are displayed. | Must |
| **FR-2** | Serving Scaling | The system shall adjust ingredient quantities based on user-defined serving sizes. | Serving count (1-20) | Scaled ingredient list | Given a recipe, when the servings are changed from 2 to 4, then all quantities double instantly. | Must |
| **FR-3** | Weekly Planning | Users shall allocate specific recipes to a 7-day calendar grid across three meal slots. | Recipe ID, Date, Meal slot | Updated weekly schedule | Given a selected recipe, when dropped into 'Monday/Lunch', then the planner persists this state. | Must |
| **FR-4** | Grocery Aggregation | The system shall generate a unified ingredient list by summing quantities from all planned meals. | Weekly planner data | Categorized shopping list | Given multiple recipes, when aggregation is triggered, then identical items are summed accurately. | Must |
| **FR-5** | Budget Tracking | Users shall monitor total estimated meal plan costs against a defined weekly limit. | Budget limit, Ingredient prices | Total cost, Budget delta | Given a weekly plan, when items are added, then the total cost updates and reflects budget status. | Should |
| **FR-6** | Pantry Deduction | The system shall subtract available pantry inventory from the generated grocery list. | Pantry stock, Grocery list | Adjusted shopping list | Given an item is in the pantry, when the grocery list is viewed, then that item is marked as 'owned'. | Should |
| **FR-7** | Pantry Autocomplete| The system shall provide ingredient name suggestions based on the existing recipe database. | Text input string | Top 5 matching names | Given a partial name, when the user types 'Chi', then 'Chicken' and 'Chickpeas' are suggested. | Could |

## 2. Non-Functional Requirements (NFR)

| NFR-ID | Quality Attribute | Requirement (measurable) | Target Value | How to Verify | Priority (Must/Should/Could) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-1** | Performance | The application shall minimize initial load and interaction latency. | FCP < 0.8s | Lighthouse Performance Audit | Must |
| **NFR-2** | Reliability | User-generated data must persist across browser sessions and reloads via the backend database. | 100% Persistence (DB-backed) | Manual session reload test | Must |
| **NFR-3** | Usability | The interface shall maintain responsiveness and accessibility standards. | Accessibility ≥ 95 | Lighthouse Accessibility Audit | Must |
| **NFR-4** | Portability | The system shall support rapid deployment via standardized containers. | Image size < 200MB | `docker images` command | Should |

## 3. Notes

- **Testing Support**: The Given/When/Then acceptance criteria provide a direct foundation for writing automated integration tests.
- **Traceability**: The explicit mapping of Inputs/Outputs ensures that data flow can be traced through the component architecture.
- **Verification**: Measurable NFR targets allow for objective pass/fail validation during the CI/CD build process.

## 4. Acceptance Criteria
- 100% of core unit tests for scaling logic and state management must pass.
- The Weekly Planner must allow adding/removing recipes without refreshing the page.
- The Grocery List must update instantly when the Pantry inventory changes.

## 5. Implementation Refinements
- **Enhanced Budgeting**: Added dynamic calculation of "Cost per Serving" during meal selection.
- **Pantry Sync**: Improved the cross-component synchronization between `PantryManager` and `GroceryList` to avoid stale data.
- **UI Consistency**: Standardized CSS variables for consistent "premium" look and feel.
