const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const OUT_DIR = path.join(__dirname, 'docs/assets/screenshots');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

(async () => {
    // We run headed to allow potential OS dialog simulation if possible, but keeping it headless="new" is usually safer
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new', // User can't see this anyway
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();
    const wait = ms => new Promise(res => setTimeout(res, ms));

    async function dragAndDrop(sourceSelector, targetSelector) {
        const sourceElement = await page.$(sourceSelector);
        const targetElement = await page.$(targetSelector);
        if (!sourceElement || !targetElement) throw new Error(`Missing drag elements: ${sourceSelector} or ${targetSelector}`);

        const sourceBox = await sourceElement.boundingBox();
        const targetBox = await targetElement.boundingBox();

        await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
        await page.mouse.down();
        await wait(200);
        await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
        await wait(200);
        await page.mouse.up();
    }

    try {
        console.log("Navigating to Login...");
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 60000 });
        
        // 1) Login: Insert credentials, take screenshot, click login
        try {
            await page.waitForSelector('input[type="email"]');
            await page.type('input[type="email"]', 'demo@mealmate.com');
            await page.type('input[type="password"]', 'Demo1234!');
            await wait(1000); // wait for typing to show
            await page.screenshot({ path: path.join(OUT_DIR, '01_login.png') });
            console.log("Captured 01_login.png (with credentials inserted)");
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
        } catch (e) { console.error("Error at Login Step", e.message); }

        // 2) Recipe: Take screenshot. Click meal, take details screenshot.
        try {
            await wait(2000); // let recipe cards load entirely
            await page.screenshot({ path: path.join(OUT_DIR, '02_recipe_library.png') });
            console.log("Captured 02_recipe_library.png");

            // Filter screenshot (optional but good to have)
            const buttons = await page.$$('button');
            for (let btn of buttons) {
                const text = await page.evaluate(el => el.textContent, btn);
                if (text.includes('Vegan')) {
                    await btn.click();
                    await wait(1000);
                    await page.screenshot({ path: path.join(OUT_DIR, '03_recipe_filtered.png') });
                    console.log("Captured 03_recipe_filtered.png");
                    await btn.click(); // Reset filter
                    await wait(1000);
                    break;
                }
            }

            const firstRecipe = await page.$('.recipeCard, [class*="recipeCard"]');
            if (firstRecipe) {
                await firstRecipe.click();
                await wait(1000); 
                await page.screenshot({ path: path.join(OUT_DIR, '07_meal_recipe.png') });
                console.log("Captured 07_meal_recipe.png (meal details)");
                await page.keyboard.press('Escape');
                await wait(500);
            }
        } catch (e) { console.error("Error at Recipe Step", e.message); }

        // 3) Meal Planner
        try {
            console.log("Navigating to Planner...");
            await page.goto(`${BASE_URL}/planner`, { waitUntil: 'networkidle0', timeout: 60000 });
            await wait(2000);
            
            // Clear planner if not empty by looping over removes, or just use UI if empty
            // we'll assume it's mostly empty for this current week, but dragging 1 meal into an empty slot
            const pickerCard = '[class*="pickerCard"]';
            const emptySlot = '[class*="slotEmpty"]';
            await page.waitForSelector(pickerCard);
            await page.waitForSelector(emptySlot);

            await dragAndDrop(pickerCard, emptySlot);
            await wait(1500);
            await page.screenshot({ path: path.join(OUT_DIR, '04_meal_planner.png') });
            console.log("Captured 04_meal_planner.png (1 meal dragged)");

            // Drag multiple meals to trigger overbudget naturally at budget 40
            // Set the budget input to 40
            await page.waitForSelector('input[type="number"]');
            await page.click('input[type="number"]', { clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.type('input[type="number"]', '40');
            await wait(1000);

            // Loop and drag the picker card to empty slots 15 times
            for(let i=0; i<15; i++) {
                try {
                    await dragAndDrop(pickerCard, emptySlot);
                    await wait(500); // Wait for drop animation and state update
                } catch(e) {
                    break; // stop if no more empty slots or error
                }
            }
            await wait(1500);
            
            await page.screenshot({ path: path.join(OUT_DIR, '08_meal_planner_overbudget.png') });
            console.log("Captured 08_meal_planner_overbudget.png (overbudget)");
        } catch (e) { console.error("Error at Planner Setp", e.message); }

        // 4) Grocery List
        try {
            console.log("Navigating to Grocery List...");
            await page.goto(`${BASE_URL}/grocery`, { waitUntil: 'networkidle0', timeout: 60000 });
            await wait(2000);
            await page.screenshot({ path: path.join(OUT_DIR, '05_grocery_list.png') });
            console.log("Captured 05_grocery_list.png (populated)");

            // Emulate print media to show what happens when export/print opens
            await page.emulateMediaType('print');
            await wait(1000);
            await page.screenshot({ path: path.join(OUT_DIR, '09_grocery_list_printable.png') });
            console.log("Captured 09_grocery_list_printable.png (Print pop-up layout)");
            await page.emulateMediaType('screen');
        } catch (e) { console.error("Error at Grocery List Step", e.message); }

        // 5) Pantry
        try {
            console.log("Navigating to Pantry...");
            await page.goto(`${BASE_URL}/pantry`, { waitUntil: 'networkidle0', timeout: 60000 });
            await wait(2000);

            // Insert item and take screenshot
            await page.type('input#pantry-name', 'Fresh Spinach');
            await page.type('input#pantry-qty', '500');
            await page.select('select#pantry-unit', 'g');
            // type date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 5);
            const dStr = tomorrow.toISOString().split('T')[0];
            await page.type('input#pantry-expiry', dStr);

            // wait for autocomplete animation
            await wait(1000);
            // click Add
            const addBtns = await page.$$('button[type="submit"]');
            if(addBtns.length > 0) {
                await addBtns[0].click();
            }
            
            await wait(1000); // Wait for success feedback text
            await page.screenshot({ path: path.join(OUT_DIR, '06_pantry_manager.png') });
            console.log("Captured 06_pantry_manager.png (Item inserted)");

        } catch (e) { console.error("Error at Pantry Step", e.message); }

        console.log("All requested meticulous screenshots complete.");
    } catch (e) {
        console.error("Critical top-level runner error:", e);
    } finally {
        await browser.close();
    }
})();
