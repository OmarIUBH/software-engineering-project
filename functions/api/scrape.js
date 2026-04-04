/**
 * Cloudflare Pages Function: /api/scrape
 * Uses Jina AI to fetch markdown from a URL, then Workers AI to parse it into an organized recipe.
 */
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    if (!env.AI) {
        return new Response(JSON.stringify({
            error: 'AI binding not configured. Please ensure the AI binding is added in Cloudflare Pages settings.'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { url } = await request.json();

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Fetch raw markdown of the webpage using Jina AI's reader
        const jinaResponse = await fetch('https://r.jina.ai/' + url, {
            headers: { 'Accept': 'text/plain' }
        });

        if (!jinaResponse.ok) {
            throw new Error(`Failed to fetch URL content (Status: ${jinaResponse.status})`);
        }

        const pageMarkdown = await jinaResponse.text();

        // 2. Pass markdown to Cloudflare Workers AI for structured JSON extraction
        const prompt = `You are an expert culinary AI. Below is the full scraped text of a webpage. 
Please extract the recipe title, a strict list of ingredients, and the step-by-step instructions.
Format the instructions as a numbered string (e.g. "1. Do this.\\n2. Do that.").
Format the ingredients as an array of strings.

Webpage Text:
---
${pageMarkdown.substring(0, 8000)} 
---

Return ONLY a strict JSON object matching this structure:
{
    "title": "Recipe Title",
    "ingredients": ["1 cup milk", "2 eggs"],
    "instructions": "1. Mix.\\n2. Bake."
}

Rules:
- Make sure to read the webpage text provided.
- Do not output any markdown formatting like \`\`\`json.
- Output ONLY the raw JSON object.`;

        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
                {
                    role: 'system',
                    content: 'You are a precise data extractor. You always respond with valid JSON only, no code blocks, no explanation.'
                },
                { role: 'user', content: prompt }
            ],
            stream: false,
            max_tokens: 1000,
            temperature: 0.1
        });

        const rawText = response.response || response.choices?.[0]?.message?.content || '';

        // Extract JSON from the response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI did not return valid JSON');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (!parsed.title || !parsed.ingredients || parsed.ingredients.length === 0) {
            throw new Error("Could not extract recipe from this page (bot protection).");
        }

        return new Response(JSON.stringify({
            title: parsed.title,
            ingredients: parsed.ingredients,
            instructions: parsed.instructions
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('AI Scraper Error:', err);
        return new Response(JSON.stringify({
            error: 'Failed to intelligently scrape URL',
            details: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
