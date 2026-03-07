const { db } = require('../src/db');

const seedData = () => {
    console.log('Seeding database...');

    // Ensure default user exists
    db.prepare('INSERT OR IGNORE INTO users (id, name) VALUES (?, ?)').run(1, 'Demo User');

    const insertIngredient = db.prepare('INSERT OR IGNORE INTO ingredients (name, default_unit) VALUES (?, ?)');
    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
    const insertPrice = db.prepare('INSERT OR IGNORE INTO ingredient_prices (ingredient_id, price_per_unit, currency) VALUES (?, ?, ?)');

    const transaction = db.transaction(() => {
        // Tags
        const tags = ['Vegan', 'Vegetarian', 'Gluten-Free', 'High-Protein', 'Low-Carb', 'Breakfast', 'Lunch', 'Dinner', 'Italian', 'Mexican'];
        const tagMap = {};
        tags.forEach(name => {
            insertTag.run(name);
            const row = db.prepare('SELECT id FROM tags WHERE name = ?').get(name);
            tagMap[name] = row.id;
        });

        // Ingredients
        const ingredients = [
            { name: 'Oats', unit: 'g', price: 0.005 },
            { name: 'Milk', unit: 'ml', price: 0.002 },
            { name: 'Banana', unit: 'piece', price: 0.3 },
            { name: 'Peanut Butter', unit: 'g', price: 0.01 },
            { name: 'Bread', unit: 'slice', price: 0.1 },
            { name: 'Egg', unit: 'piece', price: 0.2 },
            { name: 'Cheese', unit: 'g', price: 0.015 },
            { name: 'Tomato', unit: 'piece', price: 0.5 },
            { name: 'Onion', unit: 'piece', price: 0.4 },
            { name: 'Garlic', unit: 'clove', price: 0.1 },
            { name: 'Pasta', unit: 'g', price: 0.003 },
            { name: 'Chicken Breast', unit: 'g', price: 0.012 },
            { name: 'Rice', unit: 'g', price: 0.002 },
            { name: 'Beans', unit: 'g', price: 0.004 },
            { name: 'Spinach', unit: 'g', price: 0.02 },
            { name: 'Olive Oil', unit: 'ml', price: 0.02 },
            { name: 'Salt', unit: 'g', price: 0.001 },
            { name: 'Black Pepper', unit: 'g', price: 0.05 },
            { name: 'Bell Pepper', unit: 'piece', price: 0.8 },
            { name: 'Avocado', unit: 'piece', price: 1.5 },
            { name: 'Cumin', unit: 'g', price: 0.1 },
            { name: 'Paprika', unit: 'g', price: 0.08 },
            { name: 'Ground Beef', unit: 'g', price: 0.015 },
            { name: 'Potato', unit: 'g', price: 0.002 },
            { name: 'Carrot', unit: 'piece', price: 0.2 },
            { name: 'Broccoli', unit: 'g', price: 0.008 },
            { name: 'Soy Sauce', unit: 'ml', price: 0.01 },
            { name: 'Ginger', unit: 'g', price: 0.05 },
            { name: 'Lemon', unit: 'piece', price: 0.5 },
            { name: 'Butter', unit: 'g', price: 0.015 },
            { name: 'Flour', unit: 'g', price: 0.002 },
            { name: 'Sugar', unit: 'g', price: 0.002 },
            { name: 'Yeast', unit: 'g', price: 0.1 },
            { name: 'Honey', unit: 'g', price: 0.02 },
            { name: 'Yogurt', unit: 'g', price: 0.005 },
            { name: 'Cucumber', unit: 'piece', price: 0.6 },
            { name: 'Lettuce', unit: 'head', price: 1.2 },
            { name: 'Bacon', unit: 'slice', price: 0.5 },
            { name: 'Salmon', unit: 'g', price: 0.03 },
            { name: 'Shrimp', unit: 'piece', price: 0.4 },
            { name: 'Oregano', unit: 'g', price: 0.1 },
            { name: 'Basil', unit: 'leaf', price: 0.05 },
            { name: 'Mozzarella', unit: 'g', price: 0.02 },
            { name: 'Parmesan', unit: 'g', price: 0.03 },
            { name: 'Tofu', unit: 'g', price: 0.008 },
            { name: 'Mushrooms', unit: 'g', price: 0.01 },
            { name: 'Cream', unit: 'ml', price: 0.01 },
            { name: 'Beef Steak', unit: 'g', price: 0.04 },
            { name: 'Tortilla', unit: 'piece', price: 0.3 },
            { name: 'Chili Powder', unit: 'g', price: 0.08 },
            { name: 'Cilantro', unit: 'g', price: 0.15 },
            { name: 'Lime', unit: 'piece', price: 0.4 },
            { name: 'Corn', unit: 'g', price: 0.005 },
            { name: 'Oyster Sauce', unit: 'ml', price: 0.02 },
            { name: 'Sesame Oil', unit: 'ml', price: 0.03 },
            { name: 'Quinoa', unit: 'g', price: 0.01 },
            { name: 'Lentils', unit: 'g', price: 0.003 },
            { name: 'Chickpeas', unit: 'g', price: 0.004 },
            { name: 'Coconut Milk', unit: 'ml', price: 0.01 },
            { name: 'Curry Powder', unit: 'g', price: 0.1 }
        ];

        const ingredientMap = {};
        ingredients.forEach(ing => {
            insertIngredient.run(ing.name, ing.unit);
            const row = db.prepare('SELECT id FROM ingredients WHERE name = ?').get(ing.name);
            ingredientMap[ing.name] = row.id;
            insertPrice.run(row.id, ing.price, 'USD');
        });

        // Recipes
        const recipes = [
            {
                title: 'Simple Oatmeal',
                instructions: 'Boil milk, add oats, stir for 5 minutes. Top with sliced banana and peanut butter.',
                servings: 1,
                tags: ['Breakfast', 'Vegan', 'Healthy'],
                ingredients: [
                    { name: 'Oats', quantity: 50, unit: 'g' },
                    { name: 'Milk', quantity: 200, unit: 'ml' },
                    { name: 'Banana', quantity: 1, unit: 'piece' },
                    { name: 'Peanut Butter', quantity: 15, unit: 'g' }
                ]
            },
            {
                title: 'Classic Tomato Pasta',
                instructions: 'Boil pasta. Sauté garlic and onion. Add chopped tomatoes. Simmer and mix with pasta.',
                servings: 2,
                tags: ['Lunch', 'Dinner', 'Italian', 'Vegetarian'],
                ingredients: [
                    { name: 'Pasta', quantity: 200, unit: 'g' },
                    { name: 'Tomato', quantity: 3, unit: 'piece' },
                    { name: 'Garlic', quantity: 2, unit: 'clove' },
                    { name: 'Onion', quantity: 1, unit: 'piece' },
                    { name: 'Olive Oil', quantity: 20, unit: 'ml' },
                    { name: 'Basil', quantity: 5, unit: 'leaf' }
                ]
            },
            {
                title: 'Chicken Stir-Fry',
                instructions: 'Cut chicken and veggies. Fry everything in a wok with soy sauce and ginger.',
                servings: 2,
                tags: ['Dinner', 'High-Protein'],
                ingredients: [
                    { name: 'Chicken Breast', quantity: 300, unit: 'g' },
                    { name: 'Broccoli', quantity: 150, unit: 'g' },
                    { name: 'Carrot', quantity: 1, unit: 'piece' },
                    { name: 'Soy Sauce', quantity: 30, unit: 'ml' },
                    { name: 'Ginger', quantity: 10, unit: 'g' },
                    { name: 'Sesame Oil', quantity: 5, unit: 'ml' }
                ]
            },
            {
                title: 'Beef Tacos',
                instructions: 'Brown beef with spices. Serve in tortillas with avocado and lime.',
                servings: 3,
                tags: ['Dinner', 'Mexican'],
                ingredients: [
                    { name: 'Ground Beef', quantity: 400, unit: 'g' },
                    { name: 'Tortilla', quantity: 6, unit: 'piece' },
                    { name: 'Avocado', quantity: 1, unit: 'piece' },
                    { name: 'Lime', quantity: 1, unit: 'piece' },
                    { name: 'Chili Powder', quantity: 5, unit: 'g' },
                    { name: 'Cumin', quantity: 5, unit: 'g' }
                ]
            },
            {
                title: 'Lentil Soup',
                instructions: 'Simmer lentils with onions, carrots, and spices until soft.',
                servings: 4,
                tags: ['Lunch', 'Vegan', 'Healthy'],
                ingredients: [
                    { name: 'Lentils', quantity: 250, unit: 'g' },
                    { name: 'Onion', quantity: 1, unit: 'piece' },
                    { name: 'Carrot', quantity: 2, unit: 'piece' },
                    { name: 'Garlic', quantity: 3, unit: 'clove' },
                    { name: 'Vegetable Broth', quantity: 1000, unit: 'ml' }
                ]
            },
            {
                title: 'Greek Salad',
                instructions: 'Chop cucumber, tomato, and onion. Mix with olives, feta, and olive oil.',
                servings: 2,
                tags: ['Lunch', 'Vegetarian', 'Gluten-Free'],
                ingredients: [
                    { name: 'Cucumber', quantity: 1, unit: 'piece' },
                    { name: 'Tomato', quantity: 2, unit: 'piece' },
                    { name: 'Onion', quantity: 0.5, unit: 'piece' },
                    { name: 'Olive Oil', quantity: 15, unit: 'ml' },
                    { name: 'Lemon', quantity: 0.5, unit: 'piece' }
                ]
            },
            {
                title: 'Veggie Omelette',
                instructions: 'Whisk eggs. Sauté spinach and mushrooms. Pour eggs and top with cheese.',
                servings: 1,
                tags: ['Breakfast', 'Vegetarian', 'High-Protein'],
                ingredients: [
                    { name: 'Egg', quantity: 3, unit: 'piece' },
                    { name: 'Spinach', quantity: 50, unit: 'g' },
                    { name: 'Mushrooms', quantity: 50, unit: 'g' },
                    { name: 'Cheese', quantity: 30, unit: 'g' },
                    { name: 'Butter', quantity: 10, unit: 'g' }
                ]
            },
            {
                title: 'Beef & Broccoli',
                instructions: 'Thinly slice beef. Sauté with broccoli, soy sauce, and garlic.',
                servings: 2,
                tags: ['Dinner', 'High-Protein', 'Low-Carb'],
                ingredients: [
                    { name: 'Beef Steak', quantity: 300, unit: 'g' },
                    { name: 'Broccoli', quantity: 200, unit: 'g' },
                    { name: 'Soy Sauce', quantity: 20, unit: 'ml' },
                    { name: 'Garlic', quantity: 2, unit: 'clove' },
                    { name: 'Sesame Oil', quantity: 5, unit: 'ml' }
                ]
            },
            {
                title: 'Shrimp Scampi',
                instructions: 'Sauté shrimp in butter and garlic. Toss with pasta and lemon juice.',
                servings: 2,
                tags: ['Dinner', 'Italian'],
                ingredients: [
                    { name: 'Shrimp', quantity: 10, unit: 'piece' },
                    { name: 'Pasta', quantity: 150, unit: 'g' },
                    { name: 'Butter', quantity: 30, unit: 'g' },
                    { name: 'Garlic', quantity: 3, unit: 'clove' },
                    { name: 'Lemon', quantity: 1, unit: 'piece' }
                ]
            },
            {
                title: 'Quinoa Bowl',
                instructions: 'Cook quinoa. Top with black beans, corn, avocado, and cilantro.',
                servings: 2,
                tags: ['Lunch', 'Vegan', 'Gluten-Free'],
                ingredients: [
                    { name: 'Quinoa', quantity: 150, unit: 'g' },
                    { name: 'Beans', quantity: 100, unit: 'g' },
                    { name: 'Corn', quantity: 50, unit: 'g' },
                    { name: 'Avocado', quantity: 1, unit: 'piece' },
                    { name: 'Cilantro', quantity: 10, unit: 'g' }
                ]
            },
            {
                title: 'Salmon with Asparagus',
                instructions: 'Bake salmon and asparagus with lemon and olive oil at 200°C for 15 mins.',
                servings: 2,
                tags: ['Dinner', 'Healthy', 'Gluten-Free'],
                ingredients: [
                    { name: 'Salmon', quantity: 300, unit: 'g' },
                    { name: 'Olive Oil', quantity: 20, unit: 'ml' },
                    { name: 'Lemon', quantity: 1, unit: 'piece' },
                    { name: 'Salt', quantity: 2, unit: 'g' }
                ]
            },
            {
                title: 'Classic Burger',
                instructions: 'Grill beef patty. Serve in bun with lettuce, tomato, and cheese.',
                servings: 1,
                tags: ['Dinner'],
                ingredients: [
                    { name: 'Ground Beef', quantity: 200, unit: 'g' },
                    { name: 'Bread', quantity: 1, unit: 'piece' },
                    { name: 'Cheese', quantity: 1, unit: 'slice' },
                    { name: 'Tomato', quantity: 1, unit: 'slice' },
                    { name: 'Lettuce', quantity: 2, unit: 'leaf' }
                ]
            },
            {
                title: 'Berry Smoothie',
                instructions: 'Blend yogurt, milk, and honey with frozen berries.',
                servings: 1,
                tags: ['Breakfast', 'Healthy'],
                ingredients: [
                    { name: 'Yogurt', quantity: 200, unit: 'g' },
                    { name: 'Milk', quantity: 100, unit: 'ml' },
                    { name: 'Honey', quantity: 15, unit: 'g' }
                ]
            },
            {
                title: 'Potato Salad',
                instructions: 'Boil potatoes. Mix with onions, mayonnaise, and herbs.',
                servings: 4,
                tags: ['Lunch', 'Vegetarian'],
                ingredients: [
                    { name: 'Potato', quantity: 800, unit: 'g' },
                    { name: 'Onion', quantity: 1, unit: 'piece' }
                ]
            },
            {
                title: 'Tofu Curry',
                instructions: 'Sauté tofu with onions and garlic. Add coconut milk and curry powder.',
                servings: 2,
                tags: ['Dinner', 'Vegan', 'Gluten-Free'],
                ingredients: [
                    { name: 'Tofu', quantity: 400, unit: 'g' },
                    { name: 'Coconut Milk', quantity: 400, unit: 'ml' },
                    { name: 'Curry Powder', quantity: 15, unit: 'g' },
                    { name: 'Onion', quantity: 1, unit: 'piece' }
                ]
            }
        ];

        // Check if recipes already exist
        const existingRecipesCount = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count;
        if (existingRecipesCount >= recipes.length) {
            console.log(`[SEED] Found ${existingRecipesCount} recipes already in database. Skipping recipe source-of-truth seed.`);
        } else {
            console.log(`[SEED] Syncing ${recipes.length} recipes...`);

            ['Vegetable Broth'].forEach(name => {
                if (!ingredientMap[name]) {
                    insertIngredient.run(name, 'ml');
                    const row = db.prepare('SELECT id FROM ingredients WHERE name = ?').get(name);
                    ingredientMap[name] = row.id;
                    insertPrice.run(row.id, 0.001, 'USD');
                }
            });

            recipes.forEach(r => {
                db.prepare('INSERT OR IGNORE INTO recipes (user_id, title, instructions, default_servings) VALUES (?, ?, ?, ?)')
                    .run(1, r.title, r.instructions, r.servings || 1);

                const recRow = db.prepare('SELECT id FROM recipes WHERE user_id = ? AND title = ?').get(1, r.title);
                const recipeId = recRow.id;

                r.tags.forEach(tagName => {
                    if (tagMap[tagName]) {
                        db.prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)').run(recipeId, tagMap[tagName]);
                    }
                });

                r.ingredients.forEach(ing => {
                    const ingredientId = ingredientMap[ing.name];
                    if (ingredientId) {
                        db.prepare('INSERT OR IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)').run(recipeId, ingredientId, ing.quantity, ing.unit);
                    }
                });
            });
        }

        // Meal Plan
        const weekStart = '2026-03-02';
        const existingMealPlan = db.prepare('SELECT id FROM meal_plans WHERE week_start_date = ?').get(weekStart);

        if (existingMealPlan) {
            console.log(`[SEED] Meal plan for ${weekStart} already exists. Skipping.`);
        } else {
            console.log(`[SEED] Creating meal plan for ${weekStart}...`);
            const resultMealPlan = db.prepare('INSERT INTO meal_plans (user_id, week_start_date, weekly_budget) VALUES (?, ?, ?)')
                .run(1, weekStart, 50.0);
            const mealPlanId = resultMealPlan.lastInsertRowid;

            const insertMealItem = db.prepare('INSERT OR IGNORE INTO meal_plan_items (meal_plan_id, day_of_week, meal_type, recipe_id, servings) VALUES (?, ?, ?, ?, ?)');
            const recipeIDs = db.prepare('SELECT id FROM recipes LIMIT 5').all().map(r => r.id);

            for (let day = 0; day < 7; day++) {
                insertMealItem.run(mealPlanId, day, 'Lunch', recipeIDs[day % recipeIDs.length], 2);
                insertMealItem.run(mealPlanId, day, 'Dinner', recipeIDs[(day + 1) % recipeIDs.length], 2);
            }
        }

        // Pantry
        console.log('[SEED] Syncing pantry items...');
        const insertPantry = db.prepare('INSERT OR IGNORE INTO pantry_items (user_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)');
        const commonIngs = ['Oats', 'Milk', 'Pasta', 'Rice', 'Olive Oil', 'Salt', 'Onion', 'Garlic', 'Sugar', 'Flour'];
        commonIngs.forEach(name => {
            insertPantry.run(1, ingredientMap[name], 500, 'g');
        });

    });

    transaction();
    console.log('Seeding process finished.');
};

seedData();
process.exit(0);
