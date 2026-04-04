-- ============================================================
-- MealMate Community Recipes Seed
-- Clears all public recipes and inserts fresh community ones
-- Run in: Supabase SQL Editor
-- ============================================================

-- Step 1: Clear existing public recipes (cascade deletes ingredients & tags links)
DELETE FROM recipe_tags WHERE recipe_id IN (SELECT id FROM recipes WHERE is_public = true);
DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE is_public = true);
DELETE FROM recipes WHERE is_public = true;

-- Step 2: Insert 8 community recipes

-- Recipe 1: Creamy Tuscan Garlic Chicken (Sofia M.)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Creamy Tuscan Garlic Chicken',
    'Sun-dried tomatoes, spinach and a rich garlic cream sauce make this weeknight chicken absolutely irresistible.',
    '["Season chicken breasts with salt, pepper and Italian seasoning.", "Heat olive oil in a large skillet over medium-high heat. Sear chicken 5-6 min per side until golden. Remove and set aside.", "In the same pan, saute garlic for 1 minute. Add sun-dried tomatoes and cook 2 minutes.", "Pour in heavy cream and chicken stock. Bring to a simmer.", "Stir in Parmesan cheese until melted and sauce thickens.", "Add spinach and cook until wilted, about 2 minutes.", "Return chicken to the pan. Simmer 3-4 minutes until cooked through.", "Serve over pasta or rice."]',
    4, true, 'Sofia Marchetti', 6.50
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('chicken breast') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('olive oil') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('garlic cloves') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('sun-dried tomatoes') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('heavy cream') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('chicken stock') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i7 AS (INSERT INTO ingredients (name) VALUES ('parmesan cheese') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i8 AS (INSERT INTO ingredients (name) VALUES ('spinach') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i9 AS (INSERT INTO ingredients (name) VALUES ('italian seasoning') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 4, 'whole' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 2, 'tbsp' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 4, 'cloves' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 0.5, 'cup' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 1, 'cup' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 0.5, 'cup' FROM new_recipe, i6 UNION ALL
SELECT new_recipe.id, i7.id, 0.5, 'cup' FROM new_recipe, i7 UNION ALL
SELECT new_recipe.id, i8.id, 2, 'cup' FROM new_recipe, i8 UNION ALL
SELECT new_recipe.id, i9.id, 1, 'tsp' FROM new_recipe, i9;

-- Recipe 2: Spicy Korean Beef Bowl (Jin Park)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Spicy Korean Beef Bowl',
    'A fiery, sweet and savoury ground beef bowl served over steamed rice with sesame and green onions.',
    '["Cook rice according to package directions.", "In a large skillet over medium-high heat, brown ground beef, breaking it into small pieces.", "Drain excess fat.", "In a bowl mix soy sauce, sesame oil, brown sugar, garlic, and gochujang.", "Add sauce to the beef and stir well. Cook 2-3 minutes.", "Serve over rice, topped with sesame seeds and sliced green onions.", "Add a fried egg on top if desired."]',
    4, true, 'Jin Park', 4.20
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('ground beef') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('white rice') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('soy sauce') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('sesame oil') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('garlic') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('green onion') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 1, 'lb' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 2, 'cup' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 3, 'tbsp' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 1, 'tsp' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 4, 'cloves' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 3, 'whole' FROM new_recipe, i6;

-- Recipe 3: Classic Margherita Pizza (Marco B.)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Classic Margherita Pizza',
    'Thin crispy crust, rich tomato sauce and fresh mozzarella - the timeless Italian classic.',
    '["Preheat oven to 250C (480F) with a pizza stone or baking sheet inside.", "Roll out pizza dough on a floured surface to your desired thickness.", "Spread tomato sauce evenly, leaving a 1cm border.", "Tear fresh mozzarella and distribute over the sauce.", "Drizzle with olive oil and season with salt.", "Slide pizza onto the hot stone/tray. Bake 8-10 minutes until crust is golden and cheese is bubbling.", "Remove from oven, top with fresh basil leaves immediately.", "Slice and serve hot."]',
    2, true, 'Marco Bellini', 5.80
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('all-purpose flour') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('tomato sauce') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('mozzarella') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('fresh basil') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('olive oil') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('salt') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 2, 'cup' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 0.5, 'cup' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 200, 'g' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 10, 'whole' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 2, 'tbsp' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 1, 'tsp' FROM new_recipe, i6;

-- Recipe 4: Coconut Lentil Curry (Priya N.)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Coconut Lentil Curry',
    'A fragrant, warming vegan curry with red lentils in a silky coconut and tomato sauce.',
    '["Heat coconut oil in a large pot over medium heat. Saute onion until soft, about 5 minutes.", "Add garlic and ginger, cook 1 minute.", "Stir in curry powder, cumin and turmeric. Cook 30 seconds until fragrant.", "Add red lentils, canned tomatoes and coconut milk. Stir well.", "Bring to a boil, then reduce heat and simmer 20-25 minutes until lentils are soft.", "Season with salt and squeeze of lemon juice.", "Serve over rice or with naan bread.", "Garnish with fresh cilantro."]',
    4, true, 'Priya Nair', 3.40
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('red lentils') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('coconut milk') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('canned tomatoes') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('onion') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('curry powder') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('turmeric') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i7 AS (INSERT INTO ingredients (name) VALUES ('cilantro') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i8 AS (INSERT INTO ingredients (name) VALUES ('lemon') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 1.5, 'cup' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 1, 'cup' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 400, 'g' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 1, 'whole' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 2, 'tsp' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 0.5, 'tsp' FROM new_recipe, i6 UNION ALL
SELECT new_recipe.id, i7.id, 0.25, 'cup' FROM new_recipe, i7 UNION ALL
SELECT new_recipe.id, i8.id, 1, 'whole' FROM new_recipe, i8;

-- Recipe 5: Avocado BLT Sandwich (Alex Carter)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Avocado BLT Sandwich',
    'The ultimate upgrade to a classic BLT - creamy avocado, crispy bacon, fresh tomato and crunchy lettuce.',
    '["Cook bacon in a skillet until crispy. Transfer to paper towel to drain.", "Toast bread slices to your liking.", "Mash avocado with a pinch of salt and a squeeze of lemon juice.", "Spread avocado mash on one side of each toast.", "Layer with lettuce, sliced tomato, and bacon.", "Top with the second slice of bread.", "Cut diagonally and serve immediately."]',
    2, true, 'Alex Carter', 4.80
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('bacon') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('avocado') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('bread') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('tomato') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('lettuce') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('lemon') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 6, 'slices' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 1, 'whole' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 4, 'slices' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 1, 'whole' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 2, 'whole' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 0.5, 'whole' FROM new_recipe, i6;

-- Recipe 6: Shakshuka (Leila Hassan)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Shakshuka',
    'Poached eggs in a spiced tomato and pepper sauce - a Middle Eastern breakfast or brunch classic.',
    '["Heat olive oil in a deep skillet over medium heat. Saute onion and red bell pepper until soft, 5 minutes.", "Add garlic and cook 1 minute.", "Stir in tomato paste, cumin, paprika, and chilli flakes. Cook 1 minute.", "Add canned tomatoes, season with salt and pepper. Simmer 10 minutes.", "Make 4 wells in the sauce and crack an egg into each.", "Cover and cook 5-8 minutes until eggs are set to your liking.", "Garnish with fresh parsley and crumbled feta.", "Serve straight from the pan with crusty bread."]',
    4, true, 'Leila Hassan', 3.20
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('egg') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('canned tomatoes') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('red bell pepper') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('onion') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('tomato paste') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('cumin') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i7 AS (INSERT INTO ingredients (name) VALUES ('paprika') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i8 AS (INSERT INTO ingredients (name) VALUES ('feta cheese') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i9 AS (INSERT INTO ingredients (name) VALUES ('parsley') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 4, 'whole' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 400, 'g' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 1, 'whole' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 1, 'whole' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 2, 'tbsp' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 1, 'tsp' FROM new_recipe, i6 UNION ALL
SELECT new_recipe.id, i7.id, 1, 'tsp' FROM new_recipe, i7 UNION ALL
SELECT new_recipe.id, i8.id, 50, 'g' FROM new_recipe, i8 UNION ALL
SELECT new_recipe.id, i9.id, 0.25, 'cup' FROM new_recipe, i9;

-- Recipe 7: Lemon Herb Baked Salmon (Emma T.)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Lemon Herb Baked Salmon',
    'Perfectly flaky salmon baked with lemon, garlic and fresh herbs - ready in under 20 minutes.',
    '["Preheat oven to 200C (400F). Line a baking sheet with foil.", "Place salmon fillets skin-side down on the sheet.", "Mix olive oil, minced garlic, lemon zest, parsley and thyme in a bowl.", "Brush the herb mixture generously over the salmon.", "Layer thin lemon slices on top.", "Season with salt and black pepper.", "Bake 12-15 minutes until salmon flakes easily with a fork.", "Serve with roasted asparagus or a green salad."]',
    2, true, 'Emma Thompson', 8.50
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('salmon') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('lemon') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('garlic') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('parsley') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('thyme') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('olive oil') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i7 AS (INSERT INTO ingredients (name) VALUES ('asparagus') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 2, 'whole' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 1, 'whole' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 3, 'cloves' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 2, 'tbsp' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 1, 'tsp' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 2, 'tbsp' FROM new_recipe, i6 UNION ALL
SELECT new_recipe.id, i7.id, 200, 'g' FROM new_recipe, i7;

-- Recipe 8: Classic Street Beef Tacos (Carlos R.)
WITH new_recipe AS (
  INSERT INTO recipes (title, description, instructions, default_servings, is_public, author_name, estimated_cost_per_serving)
  VALUES (
    'Classic Street Beef Tacos',
    'Juicy seasoned ground beef in corn tortillas with all the toppings - a crowd-pleasing family favourite.',
    '["Brown ground beef in a skillet over medium-high heat. Drain excess fat.", "Add chilli powder, cumin, garlic powder, onion powder, paprika, salt and pepper.", "Stir in a splash of water, cook 2-3 minutes until sauce thickens.", "Warm corn tortillas in a dry pan or microwave.", "Fill each tortilla with beef, then top with shredded cheddar, sour cream, salsa, and shredded lettuce.", "Squeeze fresh lime juice over the top.", "Serve immediately with lime wedges on the side."]',
    4, true, 'Carlos Rivera', 4.50
  ) RETURNING id
),
i1 AS (INSERT INTO ingredients (name) VALUES ('ground beef') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i2 AS (INSERT INTO ingredients (name) VALUES ('corn tortillas') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i3 AS (INSERT INTO ingredients (name) VALUES ('cheddar cheese') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i4 AS (INSERT INTO ingredients (name) VALUES ('sour cream') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i5 AS (INSERT INTO ingredients (name) VALUES ('salsa') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i6 AS (INSERT INTO ingredients (name) VALUES ('shredded lettuce') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i7 AS (INSERT INTO ingredients (name) VALUES ('lime') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i8 AS (INSERT INTO ingredients (name) VALUES ('chilli powder') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id),
i9 AS (INSERT INTO ingredients (name) VALUES ('cumin') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT new_recipe.id, i1.id, 1, 'lb' FROM new_recipe, i1 UNION ALL
SELECT new_recipe.id, i2.id, 8, 'whole' FROM new_recipe, i2 UNION ALL
SELECT new_recipe.id, i3.id, 1, 'cup' FROM new_recipe, i3 UNION ALL
SELECT new_recipe.id, i4.id, 0.5, 'cup' FROM new_recipe, i4 UNION ALL
SELECT new_recipe.id, i5.id, 0.5, 'cup' FROM new_recipe, i5 UNION ALL
SELECT new_recipe.id, i6.id, 1, 'cup' FROM new_recipe, i6 UNION ALL
SELECT new_recipe.id, i7.id, 2, 'whole' FROM new_recipe, i7 UNION ALL
SELECT new_recipe.id, i8.id, 1, 'tsp' FROM new_recipe, i8 UNION ALL
SELECT new_recipe.id, i9.id, 1, 'tsp' FROM new_recipe, i9;
