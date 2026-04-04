/**
 * Cloudflare Pages Function: /api/nutrition
 * Uses Workers AI to calculate per-serving nutritional values
 * from a recipe's ingredient list.
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
        const { recipeName, ingredients, servings } = await request.json();

        if (!ingredients || ingredients.length === 0) {
            return new Response(JSON.stringify({
                calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, dietTags: []
            }), { headers: { 'Content-Type': 'application/json' } });
        }

        // Build a clear ingredient list for the AI
        const ingredientList = ingredients
            .map(ing => `- ${ing.qty || ing.quantity || 1} ${ing.unit || ''} ${ing.name}`.trim())
            .join('\n');

        const prompt = `You are a nutrition expert. Calculate the nutritional values for this recipe.

Recipe: "${recipeName}"
Serves: ${servings} people

Ingredients (total for ${servings} servings):
${ingredientList}

Calculate the PER SERVING nutritional values. Return ONLY a valid JSON object with these exact fields (integers only):
{
  "calories": <number>,
  "protein": <number>,
  "carbs": <number>,
  "fat": <number>,
  "fiber": <number>,
  "dietTags": [<list of applicable tags from: "vegetarian", "vegan", "high-protein", "dairy-free", "gluten-free">]
}

Rules:
- Use standard nutritional databases (USDA) for your estimates
- calories in kcal, all macros in grams, all per serving
- Only include diet tags that clearly apply to this recipe
- Return ONLY the JSON, no explanation text`;

        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                {
                    role: 'system',
                    content: 'You are a precise nutrition calculator. You always respond with valid JSON only, no markdown, no explanation.'
                },
                { role: 'user', content: prompt }
            ],
            stream: false,
            max_tokens: 300,
            temperature: 0.1  // Low temperature for deterministic numeric output
        });

        const rawText = response.response || response.choices?.[0]?.message?.content || '';

        // Extract JSON from the response (handle cases where model adds text around it)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI did not return valid JSON');
        }

        const macros = JSON.parse(jsonMatch[0]);

        // Validate and sanitize the response
        const result = {
            calories: Math.round(Math.abs(Number(macros.calories) || 0)),
            protein:  Math.round(Math.abs(Number(macros.protein)  || 0)),
            carbs:    Math.round(Math.abs(Number(macros.carbs)    || 0)),
            fat:      Math.round(Math.abs(Number(macros.fat)      || 0)),
            fiber:    Math.round(Math.abs(Number(macros.fiber)    || 0)),
            dietTags: Array.isArray(macros.dietTags) ? macros.dietTags.filter(t =>
                ['vegetarian', 'vegan', 'high-protein', 'dairy-free', 'gluten-free'].includes(t)
            ) : []
        };

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Nutrition AI error:', err);

        // Return a proper error so frontend can show a meaningful message
        return new Response(JSON.stringify({
            error: 'Could not calculate nutrition: ' + err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
