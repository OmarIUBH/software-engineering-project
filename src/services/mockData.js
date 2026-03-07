export const MOCK_USER = {
    id: 1,
    name: "Demo User (Offline Mode)",
    email: "demo@mealmate.com",
    token: "mock-jwt-token",
    isDemo: true
};

export const MOCK_RECIPES = [
    {
        id: 1,
        name: "Simple Oatmeal",
        description: "Boil milk, add oats, stir for 5 minutes. Top with sliced banana and peanut butter.",
        category: "Breakfast",
        prepTime: 10,
        servings: 1,
        dietTags: ["vegan"],
        ingredients: [
            { name: "Oats", qty: 50, unit: "g" },
            { name: "Milk", qty: 200, unit: "ml" },
            { name: "Banana", qty: 1, unit: "piece" },
            { name: "Peanut Butter", qty: 15, unit: "g" }
        ],
        instructions: ["Boil milk", "Add oats", "Stir for 5 mins", "Top with banana and peanut butter"]
    },
    {
        id: 2,
        name: "Classic Tomato Pasta",
        description: "Boil pasta. Sauté garlic and onion. Add chopped tomatoes. Simmer and mix with pasta.",
        category: "Lunch",
        prepTime: 20,
        servings: 2,
        dietTags: ["vegetarian"],
        ingredients: [
            { name: "Pasta", qty: 200, unit: "g" },
            { name: "Tomato", qty: 3, unit: "piece" },
            { name: "Garlic", qty: 2, unit: "clove" },
            { name: "Onion", qty: 1, unit: "piece" },
            { name: "Olive Oil", qty: 20, unit: "ml" },
            { name: "Basil", qty: 5, unit: "leaf" }
        ],
        instructions: ["Boil pasta", "Sauté garlic and onion", "Add chopped tomatoes", "Simmer and mix with pasta"]
    },
    {
        id: 3,
        name: "Chicken Stir-Fry",
        description: "Cut chicken and veggies. Fry everything in a wok with soy sauce and ginger.",
        category: "Dinner",
        prepTime: 25,
        servings: 2,
        dietTags: ["high-protein"],
        ingredients: [
            { name: "Chicken Breast", qty: 300, unit: "g" },
            { name: "Broccoli", qty: 150, unit: "g" },
            { name: "Carrot", qty: 1, unit: "piece" },
            { name: "Soy Sauce", qty: 30, unit: "ml" },
            { name: "Ginger", qty: 10, unit: "g" },
            { name: "Sesame Oil", qty: 5, unit: "ml" }
        ],
        instructions: ["Cut chicken and veggies", "Fry everything in a wok", "Add soy sauce and ginger"]
    },
    {
        id: 4,
        name: "Beef Tacos",
        description: "Brown beef with spices. Serve in tortillas with avocado and lime.",
        category: "Dinner",
        prepTime: 20,
        servings: 3,
        dietTags: [],
        ingredients: [
            { name: "Ground Beef", qty: 400, unit: "g" },
            { name: "Tortilla", qty: 6, unit: "piece" },
            { name: "Avocado", qty: 1, unit: "piece" },
            { name: "Lime", qty: 1, unit: "piece" },
            { name: "Chili Powder", qty: 5, unit: "g" },
            { name: "Cumin", qty: 5, unit: "g" }
        ],
        instructions: ["Brown beef with spices", "Serve in tortillas", "Top with avocado and lime"]
    },
    {
        id: 5,
        name: "Lentil Soup",
        description: "Simmer lentils with onions, carrots, and spices until soft.",
        category: "Lunch",
        prepTime: 40,
        servings: 4,
        dietTags: ["vegan"],
        ingredients: [
            { name: "Lentils", qty: 250, unit: "g" },
            { name: "Onion", qty: 1, unit: "piece" },
            { name: "Carrot", qty: 2, unit: "piece" },
            { name: "Garlic", qty: 3, unit: "clove" },
            { name: "Vegetable Broth", qty: 1000, unit: "ml" }
        ],
        instructions: ["Sauté aromatics", "Add lentils and broth", "Simmer until soft"]
    },
    {
        id: 6,
        name: "Greek Salad",
        description: "Chop cucumber, tomato, and onion. Mix with olives, feta, and olive oil.",
        category: "Lunch",
        prepTime: 15,
        servings: 2,
        dietTags: ["vegetarian", "gluten-free"],
        ingredients: [
            { name: "Cucumber", qty: 1, unit: "piece" },
            { name: "Tomato", qty: 2, unit: "piece" },
            { name: "Onion", qty: 0.5, unit: "piece" },
            { name: "Olive Oil", qty: 15, unit: 'ml' },
            { name: "Lemon", qty: 0.5, unit: "piece" }
        ],
        instructions: ["Chop veggies", "Mix with olives and feta", "Dress with olive oil and lemon"]
    },
    {
        id: 7,
        name: "Veggie Omelette",
        description: "Whisk eggs. Sauté spinach and mushrooms. Pour eggs and top with cheese.",
        category: "Breakfast",
        prepTime: 10,
        servings: 1,
        dietTags: ["vegetarian", "high-protein"],
        ingredients: [
            { name: "Egg", qty: 3, unit: "piece" },
            { name: "Spinach", qty: 50, unit: "g" },
            { name: "Mushrooms", qty: 50, unit: "g" },
            { name: "Cheese", qty: 30, unit: "g" },
            { name: "Butter", qty: 10, unit: "g" }
        ],
        instructions: ["Whisk eggs", "Sauté spinach and mushrooms", "Pour eggs and top with cheese"]
    },
    {
        id: 8,
        name: "Beef & Broccoli",
        description: "Thinly slice beef. Sauté with broccoli, soy sauce, and garlic.",
        category: "Dinner",
        prepTime: 20,
        servings: 2,
        dietTags: ["high-protein"],
        ingredients: [
            { name: "Beef Steak", qty: 300, unit: "g" },
            { name: "Broccoli", qty: 200, unit: "g" },
            { name: "Soy Sauce", qty: 20, unit: "ml" },
            { name: "Garlic", qty: 2, unit: "clove" },
            { name: "Sesame Oil", qty: 5, unit: "ml" }
        ],
        instructions: ["Slice beef", "Sauté with broccoli", "Add soy sauce and garlic"]
    },
    {
        id: 9,
        name: "Shrimp Scampi",
        description: "Sauté shrimp in butter and garlic. Toss with pasta and lemon juice.",
        category: "Dinner",
        prepTime: 15,
        servings: 2,
        dietTags: [],
        ingredients: [
            { name: "Shrimp", qty: 10, unit: "piece" },
            { name: "Pasta", qty: 150, unit: "g" },
            { name: "Butter", qty: 30, unit: "g" },
            { name: "Garlic", qty: 3, unit: "clove" },
            { name: "Lemon", qty: 1, unit: "piece" }
        ],
        instructions: ["Boil pasta", "Sauté shrimp in butter and garlic", "Toss together with lemon"]
    },
    {
        id: 10,
        name: "Quinoa Bowl",
        description: "Cook quinoa. Top with black beans, corn, avocado, and cilantro.",
        category: "Lunch",
        prepTime: 20,
        servings: 2,
        dietTags: ["vegan", "gluten-free"],
        ingredients: [
            { name: "Quinoa", qty: 150, unit: "g" },
            { name: "Beans", qty: 100, unit: "g" },
            { name: "Corn", qty: 50, unit: "g" },
            { name: "Avocado", qty: 1, unit: "piece" },
            { name: "Cilantro", qty: 10, unit: "g" }
        ],
        instructions: ["Cook quinoa", "Top with beans and corn", "Add avocado and cilantro"]
    },
    {
        id: 11,
        name: "Salmon with Asparagus",
        description: "Bake salmon and asparagus with lemon and olive oil.",
        category: "Dinner",
        prepTime: 20,
        servings: 2,
        dietTags: ["gluten-free"],
        ingredients: [
            { name: "Salmon", qty: 300, unit: "g" },
            { name: "Olive Oil", qty: 20, unit: "ml" },
            { name: "Lemon", qty: 1, unit: "piece" },
            { name: "Salt", qty: 2, unit: "g" }
        ],
        instructions: ["Arrange salmon and asparagus", "Drizzle with oil and lemon", "Bake at 200°C for 15 mins"]
    },
    {
        id: 12,
        name: "Classic Burger",
        description: "Grill beef patty. Serve in bun with lettuce, tomato, and cheese.",
        category: "Dinner",
        prepTime: 15,
        servings: 1,
        dietTags: [],
        ingredients: [
            { name: "Ground Beef", qty: 200, unit: "g" },
            { name: "Bread", qty: 1, unit: "piece" },
            { name: "Cheese", qty: 1, unit: "slice" },
            { name: "Tomato", qty: 1, unit: "slice" },
            { name: "Lettuce", qty: 2, unit: "leaf" }
        ],
        instructions: ["Grill beef patty", "Assemble in bun", "Add toppings"]
    },
    {
        id: 13,
        name: "Berry Smoothie",
        description: "Blend yogurt, milk, and honey with frozen berries.",
        category: "Breakfast",
        prepTime: 5,
        servings: 1,
        dietTags: [],
        ingredients: [
            { name: "Yogurt", qty: 200, unit: "g" },
            { name: "Milk", qty: 100, unit: "ml" },
            { name: "Honey", qty: 15, unit: "g" }
        ],
        instructions: ["Add all to blender", "Blend until smooth"]
    },
    {
        id: 14,
        name: "Potato Salad",
        description: "Boil potatoes. Mix with onions, mayonnaise, and herbs.",
        category: "Lunch",
        prepTime: 30,
        servings: 4,
        dietTags: ["vegetarian"],
        ingredients: [
            { name: "Potato", qty: 800, unit: "g" },
            { name: "Onion", qty: 1, unit: "piece" }
        ],
        instructions: ["Boil potatoes", "Cool and chop", "Mix with onions and dressing"]
    },
    {
        id: 15,
        name: "Tofu Curry",
        description: "Sauté tofu with onions and garlic. Add coconut milk and curry powder.",
        category: "Dinner",
        prepTime: 30,
        servings: 2,
        dietTags: ["vegan", "gluten-free"],
        ingredients: [
            { name: "Tofu", qty: 400, unit: "g" },
            { name: "Coconut Milk", qty: 400, unit: "ml" },
            { name: "Curry Powder", qty: 15, unit: "g" },
            { name: "Onion", qty: 1, unit: "piece" }
        ],
        instructions: ["Sauté tofu and onions", "Add curry powder", "Pour in coconut milk and simmer"]
    }
];
