/**
 * Cloudflare Pages Function: /api/scrape
 * Uses Jina AI to fetch markdown from a URL, then Workers AI to parse it into structured recipe JSON.
 */
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    if (!env.AI) {
        return new Response(JSON.stringify({
            error: 'AI binding not configured.'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const body = await request.json();
        const { url, measurementSystem = 'metric' } = body;

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 1. Fetch raw markdown via Jina AI reader
        const jinaResponse = await fetch('https://r.jina.ai/' + url, {
            headers: { 'Accept': 'text/plain' }
        });

        if (!jinaResponse.ok) {
            throw new Error(`Failed to fetch URL content (Status: ${jinaResponse.status})`);
        }

        const pageMarkdown = await jinaResponse.text();

        // 2. Strip nav/footer noise, keep up to 15000 chars
        const cleanedContent = pageMarkdown
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/#{1,6}\s*(menu|nav|navigation|footer|header|cookie|subscribe|newsletter)/gi, '')
            .trim()
            .substring(0, 15000);

        const unitSystem = measurementSystem === 'imperial' ? 'imperial' : 'metric';
        const unitExamples = unitSystem === 'metric'
            ? 'g, kg, ml, l, tsp, tbsp, cup'
            : 'oz, lb, fl oz, tsp, tbsp, cup';

        // 3. Structured extraction prompt
        const prompt = `You are an expert culinary AI. Extract the recipe from the webpage text below.
The user's preferred measurement system is: ${unitSystem.toUpperCase()}.

Webpage Text:
---
${cleanedContent}
---

Return ONLY a raw JSON object with this exact structure:
{
  "title": "Recipe Title",
  "ingredients": [
    { "qty": 500, "unit": "g", "name": "boneless chicken" },
    { "qty": 0.5, "unit": "tsp", "name": "Kashmiri red chili powder" }
  ],
  "instructions": "1. Do this.\\n2. Do that."
}

INGREDIENT RULES — follow every one strictly:
1. STRUCTURED: Each ingredient must be an object with "qty" (number), "unit" (string), "name" (string).
2. ONE UNIT SYSTEM: Use ${unitSystem} units only (${unitExamples}). If the recipe lists both (e.g. "500g (1.1 lbs)"), pick the ${unitSystem} one and discard the other.
3. DECIMALS ONLY: Convert all fractions to decimals. ½ → 0.5, ¼ → 0.25, ¾ → 0.75, ⅓ → 0.33, ⅔ → 0.67, ⅛ → 0.125.
4. RESOLVE RANGES: For ranges like "½ to ¾ tsp", pick the midpoint: 0.625. For "1 to 2 tbsp", pick 1.5.
5. NAME ONLY: The "name" field must contain ONLY the ingredient name — no quantities, no units, no parenthetical alternatives like "(1.1 lbs)" or "(hung curd/thick curd)". Strip those out.
6. LANGUAGE: If the page is in Arabic or another language, keep name in that language.
7. NO HALLUCINATION: Extract ONLY what is on the page. Do not invent ingredients.
8. Output ONLY the raw JSON object — no markdown, no \`\`\`json, no explanation.`;

        const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [
                {
                    role: 'system',
                    content: 'You are a precise data extractor. Output valid JSON only. No code blocks. No explanation. Follow all rules exactly.'
                },
                { role: 'user', content: prompt }
            ],
            stream: false,
            max_tokens: 3000,
            temperature: 0.1
        });

        let rawText = response.response || response.choices?.[0]?.message?.content || response;
        
        let parsed;
        if (typeof rawText === 'object' && rawText !== null) {
            // AI already returned a parsed JSON object (often happens with strong system prompts)
            parsed = rawText;
        } else {
            // Need to parse string
            rawText = String(rawText);
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('AI did not return valid JSON. Got: ' + rawText.substring(0, 300));
            }
            parsed = JSON.parse(jsonMatch[0]);
        }

        if (!parsed.title || !parsed.ingredients || parsed.ingredients.length === 0) {
            throw new Error('Could not extract recipe from this page. The site may block scrapers.');
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
            error: 'Failed to scrape URL',
            details: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


