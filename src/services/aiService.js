export const aiService = {
    /**
     * Sends a message to MealMate AI (powered by Cloudflare Workers AI).
     * Uses a Cloudflare Pages Function as a secure proxy to the AI binding.
     */
    chat: async (message, history = [], settings = {}) => {
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: history,
                    language: settings.language || 'en',
                    dialect: settings.dialect || ''
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to connect to the Cloud AI brain');
            }

            const data = await response.json();
            return { 
                reply: data.reply || 'Error: Empty reply'
            };
        } catch (err) {
            console.error('Cloud AI Error:', err);
            throw err;
        }
    }
};
