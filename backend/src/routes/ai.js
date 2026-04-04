const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const systemPrompt = "You are the MealMate AI Assistant. You help users decide what to cook based on their ingredients, and you provide complete cooking recipes when asked. Keep your answers concise, well-formatted, and enthusiastic.";

        const ollamaHost = process.env.OLLAMA_HOST || 'http://host.docker.internal:11434';

        const response = await fetch(`${ollamaHost}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                prompt: systemPrompt + '\n\nUser: ' + message,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();

        res.json({ reply: data.response });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'AI processing failed', details: error.message });
    }
});

module.exports = router;
