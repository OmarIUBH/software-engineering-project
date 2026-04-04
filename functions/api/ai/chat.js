/**
 * Cloudflare Pages Function: AI Chat via Workers AI
 * This runs on the server-side in Cloudflare using the native AI binding.
 */
export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    // 1. Check if AI binding is available
    if (!env.AI) {
        return new Response(JSON.stringify({ 
            error: 'AI Binding not found. Please ensure "AI" binding is added in your Cloudflare Pages settings.' 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { message, history, language, dialect } = await request.json();

        let dialectInstruction = '';
        if (dialect) {
            dialectInstruction = ` You MUST speak in the ${dialect} dialect/accent.`;
        } else if (language && language !== 'en') {
            dialectInstruction = ` You MUST speak in ${language} language.`;
        }

        // 2. Prepare messages for Workers AI
        const messages = [
            { role: 'system', content: `You are MealMate AI, a helpful and slightly fun cooking assistant. You help users with recipes, ingredient substitutions, and meal planning. Keep your answers concise and helpful.${dialectInstruction}` },
            ...history.map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.text
            })),
            { role: 'user', content: message }
        ];

        // 3. Run the AI Model (using Llama 3.1 8B for better quality)
        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: messages,
            stream: false,
            max_tokens: 250,
            temperature: 0.7
        });

        // 4. Return the result in the format the frontend expects
        return new Response(JSON.stringify({ 
            reply: response.response || response.choices?.[0]?.message?.content || "I couldn't generate a response." 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('AI Error:', err);
        return new Response(JSON.stringify({ error: 'AI processing failed: ' + err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
