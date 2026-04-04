-- Fix RLS Policies for Supabase
-- If you are fully logged in and still get "Failed to save" when duplicating/creating recipes,
-- it is because Supabase defaults to blocking INSERTs on tables with RLS enabled unless a policy is explicitly defined.
-- Run this in the Supabase SQL Editor:

-- 1. Ensure authenticated users can create ingredients (since duplicating a recipe saves new ingredient instances)
CREATE POLICY "Allow auth insert ingredients" 
ON public.ingredients FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 2. Ensure authenticated users can create tags
CREATE POLICY "Allow auth insert tags" 
ON public.tags FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Ensure users can link their recipes to ingredients and tags
CREATE POLICY "Users can insert own recipe_ingredients" 
ON public.recipe_ingredients FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid())
);

CREATE POLICY "Users can insert own recipe_tags" 
ON public.recipe_tags FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid())
);
