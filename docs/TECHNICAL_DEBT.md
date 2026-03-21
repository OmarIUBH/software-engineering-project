# Technical Debt Assessment: MealMate

As the project completes its primary development phases, several areas of "technical debt" have been identified. Addressing these would improve the system's maintainability, scalability, and robustness.

## 1. Architectural Inconsistencies

### Hybrid Source of Truth
- **The Issue**: The application currently splits state between the **Backend API (SQLite)** and **Browser LocalStorage**.
- **Impact**: Features like "Serving Preferences" and "Budget Targets" are stored locally. If a user logs in from a different device, their preferences won't be synchronized.
- **Recommendation**: Migrate all `storageService` dependencies to the backend API so that user settings are fully portable.

---

## 2. Component Structure & Maintainability

### Feature-Fat Components
- **The Issue**: `RecipeLibrary.jsx` and `MealPlanner.jsx` are "God Components" that handle data fetching, complex filtering logic, and UI rendering for multiple modals.
- **Impact**: Harder to unit test and more prone to side-effect bugs when modifying one part of the UI.
- **Recommendation**: Refactor into smaller, stateless UI components and move business logic into custom hooks (e.g., `useRecipes`, `useMealPlan`).

---

## 3. Testing & Robustness

### Engine Coverage Gap
- **The Issue**: While the integration test (`integration.test.jsx`) is excellent, the core logic engines (`filterEngine.js`, `scalingEngine.js`, `groceryEngine.js`) lack isolated unit tests.
- **Impact**: Subtle bugs in ingredient aggregation or rounding logic might go unnoticed in broader integration tests.
- **Recommendation**: Add a dedicated Vitest suite for `src/engines/`.

---

## 4. UI/UX Polishing

### Session Lifecycle
- **The Issue**: There is no automatic logout or token refresh logic.
- **Impact**: If a user leaves the app open for a very long time, their next action might fail silently due to an expired JWT.
- **Recommendation**: Implement a simple interceptor in `apiClient.js` to catch 401 Unauthorized errors and redirect to login.
