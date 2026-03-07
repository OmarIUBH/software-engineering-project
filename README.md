# 🥗 MealMate

MealMate is a modern, high-performance meal planning and grocery management application. Built for efficiency and a premium user experience, it helps you organize your weekly meals, optimize your budget, and manage your pantry with ease.

## 🚀 Live Demo
**[Check out the live application on Cloudflare Pages](https://mealmate-835.pages.dev)**

> **Demo Login Credentials:**
> - **Email**: `demo@mealmate.com`
> - **Password**: `Demo1234!`

---

## 🎓 Note for Tutors (Academic Context)

This project is built to demonstrate **Full-Stack Software Engineering** principles. While the Cloudflare link provides a functional UI demo, the true complexity of the project lies in its **Client-Server Architecture**:

*   **Real Backend & Database**: The project utilizes a **Node.js/Express** server and a relational **SQLite** database (located in `backend/data`).
*   **Architectural Decision: Hybrid Mock Mode**: To allow for a seamless live preview on Cloudflare (which lacks a persistent server), I implemented **Graceful Degradation**. The `apiClient.js` service detects backend availability; if the real server is unreachable, it falls back to an **offline mock layer** to preserve a professional demo experience.
*   **Independent API Validation**: All backend routes are JWT-protected and can be validated independently using the provided **[Postman Collection](docs/MealMate_Postman_Collection.json)**.
*   **Relational Quality**: The database schema includes foreign key constraints and join tables for tags and ingredients, demonstrating a high level of relational integrity.

---

## ✨ Key Features

### 📖 Smart Recipe Library
- Browse a curated collection of diverse recipes.
- **Dynamic Scaling**: Adjust serving sizes, and ingredients scale automatically.
- **Dietary Filters**: Quickly find Vegetarian, Vegan, High-Protein, and Gluten-Free options.

### 🗓️ Weekly Meal Planner
- Plan your meals for every day of the week.
- Simple, intuitive interface to assign recipes to breakfast, lunch, or dinner.
- **Weekly Planning**: Create and manage weekly meal rotations.
- **Pantry Integration**: Sync your inventory with planned recipes.
- **Persistent Backend**: Real-time API with SQLite database.

### 🛒 Smart Grocery List
- Automatically aggregates ingredients from your weekly plan.
- **Budget Tracking**: Real-time integration with your target budget (default: €40).
- **Print & Export**: Clean, minimalist layout for physical shopping lists.
- **Pantry Deduction**: Automatically substracts items you already have.

### 🥫 Pantry Manager
- Keep track of your kitchen inventory.
- **Search Helper**: Intelligent autocomplete suggests ingredient names from the recipe library as you type.
- Seamlessly integrates with the grocery list to prevent overbuying.

### ✨ Final Polish & Interactive Enhancements
- **Serving Memory**: The app remembers your preferred serving sizes for every recipe.
- **Planner Details**: Click any planned meal to view full recipe details without leaving the planner.
- **Dynamic Portions**: Adjust servings directly in the planner to see real-time budget and grocery updates.
- **Premium Aesthetics**: Fully responsive UI with smooth transitions and glassmorphism elements.

---

## Architecture
MealMate now follows a traditional Client-Server architecture:
- **Frontend**: React/Vite SPA.
- **Backend**: Node.js Express REST API.
- **Database**: SQLite for student-friendly, file-based persistence.

## Getting Started
### Docker (Recommended)
```bash
docker-compose up --build
```
The application will be available at [http://localhost:8080](http://localhost:8080) and the API at [http://localhost:3000/api](http://localhost:3000/api).

### Manual Development
Refer to [backend/README-backend.md](backend/README-backend.md) for detailed backend setup instructions.

---

## 🛠️ Tech Stack

- **Core**: React 18 & Vite 5
- **Styling**: Vanilla CSS (Custom Variable System)
- **Persistence**: SQLite (source of truth via backend API) + optional LocalStorage cache for UI convenience.
- **Testing**: Vitest & JSDOM
- **Hosting**: Cloudflare Pages (Unlimited Build Time)
- **Containerization**: Docker & NGINX

---

## 💻 Local Development

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Development
For a consistent development environment:
```bash
docker compose -f docker-compose.dev.yml up --build
```

### Testing
```bash
# Run unit tests
npm test
```

---

## 🚀 Deployment

The live version is hosted on **Cloudflare Pages**.

### Environment Variables
For local development and Docker, the frontend uses:
- `VITE_API_BASE_URL`: The URL of the backend API (e.g., `http://localhost:3000/api`).

## 🐳 Docker (Full Stack)

MealMate is fully containerized for both development and production.

### Development Mode
Runs the frontend with Vite (HMR) and the backend with Node:
```bash
docker compose -f docker-compose.dev.yml up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

### Production Mode
Runs the frontend served by NGINX and the backend with Node, including a persistent SQLite volume:
```bash
docker compose up --build -d
```
- Web Interface: `http://localhost:8080`

## 🛠 Backend & Database

The backend is built with **Node.js/Express** and uses **SQLite** for data persistence.

### Scripts
- `npm run migrate`: Initialize/update database schema.
- `npm run seed`: Populate database with sample recipes and ingredients.
- `npm run reset-db`: Wipe database, migrate, and seed (caution: deletes all data).

## 🧪 Testing

- **Frontend**: `npm test` (Vitest)
- **Backend API**: `cd backend && npm test` (Jest + Supertest)

## Submission & Versioning
To tag a release for submission:
```bash
git tag -a v1.0 -m "Final submission"
git push origin v1.0
```
The project is optimized for **Cloudflare Pages**. It includes a special `_redirects` configuration to handle Single Page Application (SPA) routing seamlessly. Cloudflare Pages is used for static hosting of the Vite build output (dist) because it is lightweight and suitable for an MVP web application.

---

## 📄 Documentation

Comprehensive project documentation is available in the [`/docs`](docs/) folder:

- **[Project Profile](docs/PROJECT_PROFILE.md)**: Objectives, scope, and project organization.
- **[Requirements Specification](docs/REQUIREMENTS.md)**: Detailed functional and non-functional requirements.
- **[Architecture Documentation](docs/ARCHITECTURE.md)**: System design and deployment view (includes Mermaid diagrams).
- **[Traceability Matrix](docs/TRACEABILITY_MATRIX.md)**: Mapping requirements to components and tests.

---

## 📜 Credits
Developed as part of a software engineering project. See [CREDITS.md](CREDITS.md) for a list of third-party libraries used.
