# 🥗 MealMate

MealMate is a modern, high-performance meal planning and grocery management application. Built for efficiency and a premium user experience, it helps you organize your weekly meals, optimize your budget, and manage your pantry with ease.

## 🚀 Live Demo
**[Check out the live application on Cloudflare Pages](https://mealmate-835.pages.dev)**

---

## ✨ Key Features

### 📖 Smart Recipe Library
- Browse a curated collection of diverse recipes.
- **Dynamic Scaling**: Adjust serving sizes, and ingredients scale automatically.
- **Dietary Filters**: Quickly find Vegetarian, Vegan, High-Protein, and Gluten-Free options.

### 🗓️ Weekly Meal Planner
- Plan your meals for every day of the week.
- Simple, intuitive interface to assign recipes to breakfast, lunch, or dinner.

### 🛒 Smart Grocery List
- Automatically aggregates ingredients from your weekly plan.
- **Budget Tracking**: Real-time integration with your target budget (default: €40).
- **Print & Export**: Clean, minimalist layout for physical shopping lists.
- **Pantry Deduction**: Automatically substracts items you already have.

### 🥫 Pantry Manager
- Keep track of your kitchen inventory.
- **Search Helper**: Intelligent autocomplete suggests ingredient names from the recipe library as you type.
- Seamlessly integrates with the grocery list to prevent overbuying.

---

## 🛠️ Tech Stack

- **Core**: React 18 & Vite 5
- **Styling**: Vanilla CSS (Custom Variable System)
- **State & Storage**: Browser-native LocalStorage
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

## 📦 Deployment
The project is optimized for **Cloudflare Pages**. It includes a special `_redirects` configuration to handle Single Page Application (SPA) routing seamlessly.

---

## 📜 Credits
Developed as part of a software engineering project. See [CREDITS.md](CREDITS.md) for a list of third-party libraries used.
