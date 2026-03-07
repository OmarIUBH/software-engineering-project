# Changelog

All notable changes to the **MealMate** project will be documented in this file.

---

## [1.0.0] — 2026-03-07
### ✨ Added
- **Persistent Serving Preferences**: Users can now save their preferred portion sizes for every recipe.
- **Interactive Meal Planner**: Ability to view full recipe details directly from the planner grid.
- **Dynamic Portion Adjustments**: Real-time grocery list and budget updates when adjusting portions in the planner.
- **Hybrid Mock Mode**: Implemented "Graceful Degradation" for seamless live demo experiences without a server.

### 🧹 Improved
- **Pantry Synchronization**: Resolved unit mapping inconsistencies (e.g., "piece" vs "pcs").
- **UI Responsiveness**: Enhanced transitions and added glassmorphism elements to the dashboard.
- **Documentation**: Finalized professional architecture and requirements documents.

---

## [0.5.0-beta] — 2026-03-04
### 🚀 Added
- **Smart Grocery List**: Automatic aggregation of ingredients from the weekly plan.
- **Pantry Management**: Real-time inventory tracking with "to-buy" deduction logic.
- **Budget Tracking**: Visual warnings for weekly financial constraints.
- **Docker Production Setup**: Multi-container architecture with NGINX and Node.js.

### 🛠 Fixed
- **Authentication**: Resolved JWT token refresh issues in long sessions.
- **Seeding Logic**: Added idempotency to the database seed scripts.

---

## [0.1.0-alpha] — 2026-02-28
### ✨ Added
- **Core API**: Developed Node.js/Express REST endpoints for Recipes and Users.
- **Recipe Library**: Initial collection of 15+ recipes with dietary tagging.
- **User Authentication**: Secure JWT-based registration and login system.
- **Database Schema**: Established relational SQLite models for persistence.

