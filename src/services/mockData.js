export const MOCK_USER = {
    id: 13,
    name: "Demo User (Offline Mode)",
    email: "demo@mealmate.com",
    token: "mock-jwt-token"
};

export const MOCK_RECIPES = [
    {
        id: 1,
        name: "Classic Spaghetti Carbonara",
        description: "A creamy Italian pasta dish with pancetta and parmesan.",
        category: "Main Course",
        prepTime: 20,
        servings: 4,
        dietTags: ["high-protein"],
        estimatedCostPerServing: 2.5,
        ingredients: [
            { name: "Spaghetti", qty: 400, unit: "g" },
            { name: "Egg", qty: 4, unit: "pcs" },
            { name: "Parmesan Cheese", qty: 100, unit: "g" }
        ],
        instructions: ["Boil pasta", "Fry pancetta", "Mix eggs and cheese", "Combine all"]
    },
    {
        id: 2,
        name: "Vegan Lentil Soup",
        description: "Hearty and healthy lentil soup with carrots and onions.",
        category: "Soup",
        prepTime: 45,
        servings: 6,
        dietTags: ["vegan", "vegetarian"],
        estimatedCostPerServing: 1.2,
        ingredients: [
            { name: "Red Lentils", qty: 250, unit: "g" },
            { name: "Carrot", qty: 2, unit: "pcs" },
            { name: "Vegetable Stock", qty: 1, unit: "L" }
        ],
        instructions: ["Sauté veggies", "Add lentils and stock", "Simmer for 30 mins"]
    }
];
