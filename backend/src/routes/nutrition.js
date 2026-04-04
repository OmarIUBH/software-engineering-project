const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/', async (req, res) => {
    try {
        const { recipeName, ingredients, servings } = req.body;
        
        const prompt = `
        You are a strict nutritionist AI. Calculate the estimated total nutritional macros for ONE serving of this recipe and categorize its diet.
        Recipe Name: ${recipeName}
        Total Ingredients in Recipe:
        ${JSON.stringify(ingredients, null, 2)}
        Total Servings: ${servings}

        You MUST ONLY return a valid JSON object exactly matching this format, with numerical values representing grams/kcal. Include an array of applicable diet tags (e.g. "vegan", "vegetarian", "dairy-free", "gluten-free", "high-protein").
        {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "dietTags": string[]
        }
        `;
        
        const ollamaHost = process.env.OLLAMA_HOST || 'http://host.docker.internal:11434';

        const response = await fetch(`${ollamaHost}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                prompt: prompt,
                stream: false,
                format: 'json'
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        const macros = JSON.parse(data.response);

        res.json(macros);
    } catch (error) {
        console.error('Nutrition API Error:', error);
        res.status(500).json({ error: 'Failed to calculate macros.', details: error.message });
    }
});

module.exports = router;
