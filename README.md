# MealMate – Meal Planner & Smart Grocery List

## Live Demo
Check out the live application hosted on Netlify: [https://mealmate-web-omariubh.netlify.app](https://mealmate-web-omariubh.netlify.app)

---

## Overview
MealMate is a browser‑native meal planning app built with **React 18** and **Vite 5**. It lets you browse recipes, generate a smart grocery list, manage your pantry, track a weekly budget, and more.

---

## Prerequisites
- **Node.js** ≥ 18 LTS ([nodejs.org](https://nodejs.org))
- **npm** ≥ 9 (comes with Node)
- **Docker Desktop** (optional, for containerised development/production)

---

## Local Development (without Docker)
```bash
# Clone the repository
git clone https://github.com/OmarIUBH/software-engineering-project.git
cd software-engineering-project

# Install dependencies
npm install

# Start the Vite dev server (hot‑reload)
npm run dev
# → Open http://localhost:5173 in your browser
```

---

## Development with Docker (hot‑reload)
```bash
# Build and start the development container
docker compose -f docker-compose.dev.yml up --build -d

# Follow logs (optional)
docker compose -f docker-compose.dev.yml logs -f

# Access the app
http://localhost:5173
```

---

## Production Build with Docker (NGINX)
```bash
# Build and run the production image
docker compose -f docker-compose.prod.yml up --build -d

# Access the optimized app
http://localhost:8080
```

---

## Testing
```bash
# Run unit tests (Vitest)
npm test

# Run end‑to‑end tests (Playwright)
npm run test:e2e
```

---

## License
MIT – see [LICENSE](LICENSE).

---

## Credits
See [CREDITS.md](CREDITS.md) for third‑party libraries and their licenses.
