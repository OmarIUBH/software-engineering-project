# MealMate Backend

This is the Node.js/Express backend for MealMate, featuring a SQLite database for persistent storage of recipes, meal plans, pantry inventory, and budgeting.

## Tech Stack
- **Framework**: Express.js
- **Database**: SQLite (via `better-sqlite3`)
- **Environment**: Node.js 18+
- **Containerization**: Docker & Docker Compose

## Repository Structure
- `src/`: Server and routing logic
  - `server.js`: Main entry point
  - `db.js`: Database connection and migration runner
  - `routes/`: API endpoint definitions
- `migrations/`: SQL schema files
- `seed/`: Initial data population script
- `data/`: Location of the SQLite database file (`mealmate.db`)

## Getting Started (Local Development)

### Prerequisites
- Node.js installed
- SQLite viewer (optional)

### Installation
```bash
cd backend
npm install
```

### Database Setup
```bash
# Run migrations to create tables
npm run migrate

# (Optional) Seed the database with initial data
npm run seed
```

### Running the Server
```bash
# Start in development mode (with nodemon)
npm run dev

# Start in production mode
npm start
```

## API Reference

### Recipes
- `GET /api/recipes`: List all recipes.
- `GET /api/recipes/:id`: Get detailed recipe with ingredients and tags.
- `POST /api/recipes`: Create a new recipe.
- `DELETE /api/recipes/:id`: Delete a recipe.

### Meal Plans
- `GET /api/mealplans?weekStart=YYYY-MM-DD`: Get meal plan for a specific week.
- `POST /api/mealplans`: Create a new container for a weekly meal plan.
- `POST /api/mealplans/:id/items`: Add a recipe to a specific day/meal slot.

### Pantry
- `GET /api/pantry`: List current pantry inventory.
- `POST /api/pantry`: Add item to pantry.
- `PUT /api/pantry/:id`: Update quantity or unit of a pantry item.

### Prices
- `GET /api/prices`: List ingredient prices.
- `PUT /api/prices/:ingredientId`: Set or update price for an ingredient.

## Docker Integration
The backend is integrated into the root `docker-compose.yml`. To run the full stack:
```bash
docker-compose up --build
```
The database volume is persisted in `mealmate-data`.
