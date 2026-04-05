import { supabase } from './supabaseClient.js';

const RECIPE_SELECT = `
    *,
    recipe_ingredients(quantity, unit, ingredients(name)),
    recipe_tags(tags(name))
`;

/**
 * Maps Supabase recipe row (with joins) to frontend recipe shape
 */
function mapRecipe(r) {
    if (!r) return r;

    let instructions = r.instructions;
    if (typeof instructions === 'string') {
        try {
            instructions = JSON.parse(instructions);
        } catch (e) {
            instructions = instructions.split('\n').filter(Boolean);
        }
    }

    const ingredients = (r.recipe_ingredients || []).map(ri => ({
        name: ri.ingredients?.name || 'Unknown',
        quantity: ri.quantity,
        qty: ri.quantity,   // alias used by scalingEngine & RecipeModal
        unit: ri.unit || 'pcs',
    }));

    const dietTags = (r.recipe_tags || [])
        .map(rt => rt.tags?.name)
        .filter(Boolean);

    return {
        ...r,
        name: r.title || r.name || 'Untitled Recipe',
        servings: r.default_servings || r.servings || 1,
        prepTime: r.prep_time || r.prepTime || 20,
        description: r.description || 'A delicious meal.',
        category: r.category || 'Main Course',
        dietTags,
        ingredients,
        instructions: Array.isArray(instructions) ? instructions : [instructions].filter(Boolean),
        estimatedCostPerServing: parseFloat(r.estimated_cost_per_serving || r.estimatedCostPerServing || 5.0),
    };
}

export const recipesApi = {
    /**
     * Get the currently logged-in user
     */
    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Fetch ALL recipes the user can see: their own + all public community recipes.
     * Used by MealPlanner and GroceryList so plan slots are always resolvable.
     */
    getAllForPlanning: async () => {
        const { data: { user } } = await supabase.auth.getUser();

        // Always fetch public recipes
        const { data: publicData, error: pubError } = await supabase
            .from('recipes')
            .select(RECIPE_SELECT)
            .eq('is_public', true);

        if (pubError) throw new Error(pubError.message);

        let ownData = [];
        if (user) {
            const { data, error } = await supabase
                .from('recipes')
                .select(RECIPE_SELECT)
                .eq('user_id', user.id)
                .eq('is_public', false); // avoid duplicates with public
            if (!error) ownData = data || [];
        }

        // Merge and deduplicate by id
        const all = [...(publicData || []), ...ownData];
        const seen = new Set();
        const unique = all.filter(r => {
            if (seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
        });

        return unique.map(mapRecipe);
    },

    /**
     * Fetch all recipes belonging to the current user
     */
    getAll: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('recipes')
            .select(RECIPE_SELECT)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return (data || []).map(mapRecipe);
    },

    /**
     * Fetch all public/community recipes
     */
    getCommunity: async () => {
        const { data, error } = await supabase
            .from('recipes')
            .select(RECIPE_SELECT)
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return (data || []).map(mapRecipe);
    },

    /**
     * Fetch a single recipe by ID
     */
    getById: async (id) => {
        const { data, error } = await supabase
            .from('recipes')
            .select(RECIPE_SELECT)
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return mapRecipe(data);
    },

    /**
     * Create a new recipe with ingredients and tags
     */
    create: async (recipe) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 1. Insert the recipe
        const { data: newRecipe, error: recipeError } = await supabase
            .from('recipes')
            .insert({
                user_id: user.id,
                title: recipe.name || recipe.title || 'Untitled Recipe',
                instructions: Array.isArray(recipe.instructions)
                    ? JSON.stringify(recipe.instructions)
                    : recipe.instructions,
                default_servings: recipe.servings || recipe.default_servings || 1,
                is_public: recipe.is_public || false,
                author_name: recipe.author_name || user.user_metadata?.name || user.email,
            })
            .select()
            .single();

        if (recipeError) throw new Error(recipeError.message);

        // 2. Upsert ingredients and link to recipe
        const ingredients = recipe.ingredients || [];
        for (const ing of ingredients) {
            const name = typeof ing === 'string' ? ing : (ing.name || 'Unknown');

            const { data: ingredient } = await supabase
                .from('ingredients')
                .upsert({ name }, { onConflict: 'name' })
                .select()
                .single();

            if (ingredient) {
                await supabase.from('recipe_ingredients').insert({
                    recipe_id: newRecipe.id,
                    ingredient_id: ingredient.id,
                    quantity: parseFloat(ing.quantity) || 1,
                    unit: ing.unit || 'pcs',
                });
            }
        }

        // 3. Upsert tags and link to recipe
        const tagNames = recipe.dietTags || recipe.tags || [];
        for (const tagEntry of tagNames) {
            const name = typeof tagEntry === 'string' ? tagEntry : tagEntry.name;
            if (!name) continue;

            const { data: tag } = await supabase
                .from('tags')
                .upsert({ name }, { onConflict: 'name' })
                .select()
                .single();

            if (tag) {
                await supabase.from('recipe_tags').insert({
                    recipe_id: newRecipe.id,
                    tag_id: tag.id,
                });
            }
        }

        return newRecipe;
    },

    /**
     * Delete a recipe by ID
     */
    delete: async (id) => {
        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { message: 'Deleted' };
    },

    /**
     * "Clones" a community recipe to the current user's personal collection
     */
    duplicate: async (recipeId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // 1. Fetch original recipe with ALL details
        const fullRecipe = await recipesApi.getById(recipeId);

        // 2. Insert new recipe copy
        const { data: copy, error: copyError } = await supabase
            .from('recipes')
            .insert({
                user_id: user.id,
                title: `${fullRecipe.name || fullRecipe.title} (Copy)`,
                instructions: JSON.stringify(fullRecipe.instructions),
                default_servings: fullRecipe.servings || 1,
                is_public: false, // Personal copy
                author_name: user.user_metadata?.name || user.email,
            })
            .select()
            .single();

        if (copyError) throw new Error(copyError.message);

        // 3. Clone ingredients (non-blocking — recipe is already saved)
        for (const ing of fullRecipe.ingredients) {
            try {
                // First try to find the existing ingredient
                let ingredient;
                const { data: existing } = await supabase
                    .from('ingredients')
                    .select('id')
                    .eq('name', ing.name)
                    .single();

                if (existing) {
                    ingredient = existing;
                } else {
                    // Only insert if it doesn't exist
                    const { data: created } = await supabase
                        .from('ingredients')
                        .insert({ name: ing.name })
                        .select()
                        .single();
                    ingredient = created;
                }

                if (ingredient) {
                    await supabase.from('recipe_ingredients').insert({
                        recipe_id: copy.id,
                        ingredient_id: ingredient.id,
                        quantity: ing.quantity || 1,
                        unit: ing.unit || 'pcs',
                    });
                }
            } catch (e) {
                console.warn('Could not clone ingredient:', ing.name, e.message);
            }
        }

        // 4. Clone tags (non-blocking)
        for (const tagName of (fullRecipe.dietTags || [])) {
            try {
                let tag;
                const { data: existing } = await supabase
                    .from('tags')
                    .select('id')
                    .eq('name', tagName)
                    .single();

                if (existing) {
                    tag = existing;
                } else {
                    const { data: created } = await supabase
                        .from('tags')
                        .insert({ name: tagName })
                        .select()
                        .single();
                    tag = created;
                }

                if (tag) {
                    await supabase.from('recipe_tags').insert({
                        recipe_id: copy.id,
                        tag_id: tag.id,
                    });
                }
            } catch (e) {
                console.warn('Could not clone tag:', tagName, e.message);
            }
        }

        return copy;
    }
};
