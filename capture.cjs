const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const OUT_DIR = path.join(__dirname, 'docs/assets/screenshots');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    
    // Add some delay helper for animations
    const wait = ms => new Promise(res => setTimeout(res, ms));

    try {
        console.log("Navigating to Login...");
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 60000 });
        
        try {
            await wait(1000);
            await page.screenshot({ path: path.join(OUT_DIR, '01_login.png') });
            console.log("Captured 01_login.png");
        } catch (e) { console.error("Error at 01_login", e.message); }

        try {
            await page.waitForSelector('input[type="email"]');
            await page.type('input[type="email"]', 'demo@mealmate.com');
            await page.type('input[type="password"]', 'Demo1234!');
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
        } catch (e) { console.error("Error logging in", e.message); }

        try {
            // Wait for recipe cards to finish floating in
            await wait(1500);
            await page.screenshot({ path: path.join(OUT_DIR, '02_recipe_library.png') });
            console.log("Captured 02_recipe_library.png");
        } catch (e) { console.error("Error at 02_recipe_library", e.message); }

        try {
            const buttons = await page.$$('button');
            let veganBtn;
            for (let btn of buttons) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.includes('Vegan')) veganBtn = btn;
            }
            if (veganBtn) {
                await veganBtn.click();
                await wait(1000);
                await page.screenshot({ path: path.join(OUT_DIR, '03_recipe_filtered.png') });
                console.log("Captured 03_recipe_filtered.png");
                await veganBtn.click(); // Reset
                await wait(500);
            }
        } catch (e) { console.error("Error at 03_recipe_filtered", e.message); }

        try {
            const firstRecipe = await page.$('.recipeCard, [class*="recipeCard"]');
            if (firstRecipe) {
                await firstRecipe.click();
                await wait(1000); 
                await page.screenshot({ path: path.join(OUT_DIR, '07_meal_recipe.png') });
                console.log("Captured 07_meal_recipe.png");
                await page.keyboard.press('Escape');
                await wait(500);
            }
        } catch (e) { console.error("Error at 07_meal_recipe", e.message); }

        try {
            console.log("Navigating to Planner...");
            await page.goto(`${BASE_URL}/planner`, { waitUntil: 'networkidle0', timeout: 60000 });
            await wait(1500);

            // Populate planner
            await page.evaluate(async () => {
                const token = localStorage.getItem('mealmate_token');
                if(!token) return;
                const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
                
                const getMonday = (d) => {
                    d = new Date(d);
                    const day = d.getDay();
                    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                    return new Date(d.setDate(diff)).toISOString().split('T')[0];
                };
                const weekStart = getMonday(new Date());

                const pRes = await fetch(`/api/mealplans`, { method: 'POST', headers, body: JSON.stringify({ week_start_date: weekStart, weekly_budget: 50.0 }) });
                const pData = await pRes.json();
                const planId = pData.id || pData.meal_plan_id;

                if (planId) {
                    const rRes = await fetch('/api/recipes');
                    const recipes = await rRes.json();
                    if (recipes.length >= 2) {
                        try {
                            await fetch(`/api/mealplans/${planId}/items`, { method: 'POST', headers, body: JSON.stringify({ day_of_week: 0, meal_type: 'lunch', recipe_id: recipes[0].id, servings: 2 }) });
                            await fetch(`/api/mealplans/${planId}/items`, { method: 'POST', headers, body: JSON.stringify({ day_of_week: 0, meal_type: 'dinner', recipe_id: recipes[1].id, servings: 2 }) });
                            await fetch(`/api/mealplans/${planId}/items`, { method: 'POST', headers, body: JSON.stringify({ day_of_week: 1, meal_type: 'lunch', recipe_id: recipes[2].id, servings: 1 }) });
                        } catch(e) {}
                    }
                }
            });

            await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
            await wait(2000);
            await page.screenshot({ path: path.join(OUT_DIR, '04_meal_planner.png') });
            console.log("Captured 04_meal_planner.png");
        } catch (e) { console.error("Error at 04_meal_planner", e.message); }

        try {
            await page.waitForSelector('input[type="number"]', { timeout: 10000 });
            await page.click('input[type="number"]', { clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.type('input[type="number"]', '1');
            await wait(1500);
            await page.screenshot({ path: path.join(OUT_DIR, '08_meal_planner_overbudget.png') });
            console.log("Captured 08_meal_planner_overbudget.png");
        } catch (e) { console.error("Error at 08_meal_planner_overbudget", e.message); }

        try {
            console.log("Navigating to Grocery List...");
            await page.goto(`${BASE_URL}/grocery`, { waitUntil: 'networkidle0', timeout: 60000 });
            await wait(2000);
            await page.screenshot({ path: path.join(OUT_DIR, '05_grocery_list.png') });
            console.log("Captured 05_grocery_list.png");
        } catch (e) { console.error("Error at 05_grocery_list", e.message); }

        try {
            await page.emulateMediaType('print');
            await wait(1000);
            await page.screenshot({ path: path.join(OUT_DIR, '09_grocery_list_printable.png') });
            console.log("Captured 09_grocery_list_printable.png");
            await page.emulateMediaType('screen');
        } catch (e) { console.error("Error at 09_grocery_list_printable", e.message); }

        try {
            console.log("Navigating to Pantry...");
            await page.goto(`${BASE_URL}/pantry`, { waitUntil: 'networkidle0', timeout: 60000 });
            await wait(2000);
            await page.screenshot({ path: path.join(OUT_DIR, '06_pantry_manager.png') });
            console.log("Captured 06_pantry_manager.png");
        } catch (e) { console.error("Error at 06_pantry_manager", e.message); }

        console.log("All screenshots complete.");
    } catch (e) {
        console.error("Critical top-level runner error:", e);
    } finally {
        await browser.close();
    }
})();
