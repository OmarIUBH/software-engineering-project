export const MOCK_USER = {
    id: 13,
    name: "Demo User (Offline Mode)",
    email: "demo@mealmate.com",
    token: "mock-jwt-token"
};

export const MOCK_RECIPES = [
    {
        id: 1,
        name: "Simple Oatmeal",
        description: "A quick and healthy breakfast option. Cook oats with milk or water and top with fruits.",
        category: "Breakfast",
        prepTime: 10,
        servings: 1,
        dietTags: ["vegetarian", "healthy"],
        estimatedCostPerServing: 1.5,
        ingredients: [
            { name: "Oats", qty: 50, unit: "g" },
            { name: "Milk", qty: 200, unit: "ml" },
            { name: "Honey", qty: 1, unit: "tbsp" }
        ],
        instructions: ["Mix oats and milk", "Microwave for 2 mins", "Add honey"]
    },
    {
        id: 2,
        name: "Lentil Salad",
        description: "A fresh and protein-packed salad with lentils, tomatoes, and cucumbers.",
        category: "Lunch",
        prepTime: 15,
        servings: 2,
        dietTags: ["vegan", "vegetarian", "high-protein"],
        estimatedCostPerServing: 2.0,
        ingredients: [
            { name: "Cooked Lentils", qty: 200, unit: "g" },
            { name: "Tomato", qty: 1, unit: "piece" },
            { name: "Cucumber", qty: 0.5, unit: "piece" },
            { name: "Lemon", qty: 0.5, unit: "piece" }
        ],
        instructions: ["Chop veggies", "Mix with lentils", "Squeeze lemon over"]
    },
    {
        id: 3,
        name: "Beef Stir Fry",
        description: "Savory beef strips stir-fried with colorful vegetables and soy sauce.",
        category: "Main Dish",
        prepTime: 25,
        servings: 4,
        dietTags: ["high-protein"],
        estimatedCostPerServing: 4.5,
        ingredients: [
            { name: "Beef Strips", qty: 500, unit: "g" },
            { name: "Bell Pepper", qty: 2, unit: "pcs" },
            { name: "Broccoli", qty: 1, unit: "head" },
            { name: "Soy Sauce", qty: 2, unit: "tbsp" }
        ],
        instructions: ["Sear beef", "Add veggies", "Stir in soy sauce", "Cook until tender"]
    }
];
