# Requirements Specification: MealMate

## 1. Functional Requirements (FR)

| FR-ID | Requirement Title | Description | Inputs | Outputs | Acceptance Criteria (Given/When/Then) | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-0** | User Authentication | System allows users to securely register and log in via a backend SQLite database. Sessions are managed using JSON Web Tokens (JWT). | Email,<br>Password | JWT Access<br>Token | **(Happy Path)** Given valid credentials, when the user logs in, then a JWT is provided and stored.<br>**(Edge Case)** Given an existing email, when the user tries to register, then a '409 Conflict' error is returned. | Must |
| **FR-1** | Recipe & Tags Filtering | System provides a library of 15+ recipes that users can browse and filter. Filtering utilizes a multi-tag approach (Vegan, Vegetarian, etc.) along with a text-based search that scans recipe names and ingredients. | Dietary tags,<br>Search query | Filtered list of<br>recipe cards | **(Happy Path)** Given the library, when the user selects 'Vegan', then only recipes with the 'Vegan' tag are shown.<br>**(Edge Case)** Given an active search, when the user enters a query with no matches (e.g., 'xyz123'), then an 'empty state' message is displayed.<br>**(Persistence)** Given a filtered state, when the user navigates away and clicks 'Back', then the previous filters and search query must be restored. | Must |
| **FR-2** | Dynamic Serving Scaling | Users can adjust the serving size for any recipe. The system instantly recalculates ingredient quantities using a proportional scaling algorithm to ensure accurate cooking ratios. | Serving count<br>(1-20) | Scaled<br>quantities | **(Happy Path)** Given a recipe for 2 people, when the user changes servings to 10, then all ingredient amounts must be multiplied by 5.<br>**(Edge Case)** Given the serving input, when the user enters '0' or a negative number, then the system must default to '1' or provide a validation error.<br>**(Units)** Given a scaled list, when quantities change, then units (e.g., 'grams') must remain consistent unless conversion thresholds are met. | Must |
| **FR-3** | Persistent Weekly Planning | Users schedule meals across a 7-day, 21-slot calendar. The system manages the assignment of recipe IDs to specific slots and ensures the plan is synchronized with the backend database. | Recipe ID, Date,<br>Meal slot | Backend-persisted<br>weekly schedule | **(Happy Path)** Given a selected recipe, when it is dropped into a calendar slot, then the slot must display the recipe name and estimated cost.<br>**(Edge Case)** Given an occupied slot, when a new recipe is dropped into it, then the previous recipe is replaced and the new state is saved.<br>**(Persistence)** Given a completed plan, when the page is refreshed, then the 7-day schedule must be re-loaded accurately from the backend database. | Must |
| **FR-4** | Smart Grocery Aggregation | System automatically generates a shopping list by summing requirements from all planned recipes. Identical ingredients are merged into single entries to prevent redundant shopping entries. | Weekly planner<br>data | Unified and<br>categorized list | **(Happy Path)** Given 3 recipes using 'Onion', when the grocery list is generated, then the total quantity of 'Onion' is shown as a single line item.<br>**(Edge Case)** Given recipes using 'flour' and 'Flour', when aggregated, then the system must treat them as identical (case-insensitive matching).<br>**(Units)** Given two recipes using incompatible units (e.g., '1 tsp' and '500g'), then the items must be listed separately to avoid invalid conversion. | Must |
| **FR-5** | Real-Time Budget Tracking | System maintains a budget monitor that compares the total estimated cost of the weekly plan against the user's defined limit. Visual alerts target users who exceed their financial constraints. | Budget limit,<br>Recipe prices | Budget status,<br>Price alerts | **(Happy Path)** Given a €40 budget, when the total plan cost is €35, then the budget bar remains green (ok).<br>**(Edge Case)** Given a plan cost of €45, when compared to a €40 budget, then a visual warning (red bar) and 'Over Budget' alert must be shown.<br>**(Sync)** Given a budget change, when the limit is updated in the UI, then the status bar must recalculate across all planner views instantly. | Should |
| **FR-6** | Dynamic Pantry Deduction | The system identifies which grocery items are already available in the user's pantry. It markers or subtracts these quantities to provide an accurate "to-buy" overview. | Pantry stock,<br>Grocery list | Adjusted shopping<br>list overview | **(Happy Path)** Given 500g pasta is needed and the pantry has 500g, when the grocery list is viewed, then the item must be marked as 'Owned'.<br>**(Edge Case)** Given 1kg needed and 200g in pantry, when calculated, then the list must show '800g needed' (Partial Deductioning).<br>**(Error)** Given a backend network error during pantry sync, when viewing the list, then the system should show the un-deducted list and a 'Sync Error' message. | Should |
| **FR-7** | Ingredient Autocomplete | System assists user data entry in the Pantry Manager by suggesting ingredient names from the pre-populated recipe database, ensuring naming consistency for later aggregation. | Text input<br>(e.g., 'Tom') | Suggested name<br>dropdown | **(Happy Path)** Given the pantry input, when the user types 'Pe', then 'Pepper' and 'Penne' should appear as suggestions.<br>**(Edge Case)** Given no matching results, when the user finishes typing a custom name, then the system must allow the custom entry without error.<br>**(Persistence)** Given a selected suggestion, when the item is added, then the backend must save the ingredient_id if a database match exists. | Could |

## 2. Non-Functional Requirements (NFR)

| NFR-ID | Quality Attribute | Requirement (measurable) | Target Value | How to Verify | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR-1** | Performance | Ensure API endpoints respond within acceptable limits under simulated load. | API Latency < 200ms | Postman API Performance Testing & Collection Runner. | Must |
| **NFR-2** | Reliability | Data manipulation (pantry, plan, settings) must accurately persist and return correctly validated responses. | 100% Pass Rate | Postman Automated Collection tests for CRUD workflows across backend SQLite database. | Must |
| **NFR-3** | Usability | The API responses shall be standardized, well-structured, and use standard HTTP error codes. | 100% JSON standard | Postman API JSON Schema Validation. | Must |
| **NFR-4** | Portability | System must support rapid deployment and local evaluation via Docker containers on any OS with Docker support. | Image size < 200MB | Run `docker images mealmate-frontend` to verify compressed size. | Should |

## 3. System Rules & Logic

### 3.1. Ingredient Matching Logic
The system uses "Normalizing" to prevent duplicate grocery entries:
1.  **Trimming**: Leading/trailing white space is removed from ingredient names.
2.  **Case-Insensitivity**: All names are compared using lower-case logic (e.g., 'Tomato' == 'tomato').
3.  **Exact Matching**: Only exact string matches after normalization are merged.

### 3.2. Unit Compatibility & Conversion
1.  **Compatible Units**: The system automatically sums items of the same unit (e.g., '200g' + '300g' = '500g').
2.  **Incompatible Entries**: If two identical ingredients have incompatible units (e.g., '3 units' vs '200g'), they are listed as **separate rows** in the grocery list to maintain structural integrity.

### 3.3. Pantry Deduction Algorithm
- **Full Coverage**: If `Pantry Quantity >= Needed Quantity`, the item is marked as "Owned" or hidden from the shopping list.
- **Partial Coverage**: If `Pantry Quantity < Needed Quantity`, the shopping list displays the remaining balance (`Needed - Pantry`).
- **Non-Negative Rule**: Quantities in the grocery list can never be less than zero.

### 3.4. Cost Calculation
- **Computation**: Total Cost = Σ (Planned Recipe * Estimated Cost Per Serving * Servings).
- **Trigger**: The budget warning triggers instantly whenever the Total Cost exceeds the user-defined `Weekly Budget` limit.

## 4. Acceptance Criteria Summary
- 100% of core unit tests for scaling logic and state management must pass.
- The Weekly Planner must allow adding/removing recipes without refreshing the page.
- The Grocery List must update instantly when the Pantry inventory changes.
