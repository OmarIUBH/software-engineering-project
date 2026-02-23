import { useState, useCallback } from 'react';
import { storageService } from '../../services/storageService.js';
import { computeWeeklyCost } from '../../engines/groceryEngine.js';
import styles from './MealPlanner.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

function BudgetBar({ plan, recipes, budget, onBudgetChange }) {
    const cost = computeWeeklyCost(plan, recipes);
    const pct = Math.min(100, Math.round((cost / (budget || 1)) * 100));
    const over = cost > budget;

    return (
        <div className={styles.budgetBar}>
            <div className={styles.budgetLeft}>
                <span className={styles.budgetLabel}>Weekly Budget</span>
                <div className={styles.budgetInputRow}>
                    <span className={styles.currency}>€</span>
                    <input
                        type="number"
                        min="0"
                        value={budget}
                        onChange={(e) => onBudgetChange(parseFloat(e.target.value) || 0)}
                        className={styles.budgetInput}
                        aria-label="Weekly budget"
                    />
                </div>
            </div>
            <div className={styles.budgetRight}>
                <span className={over ? styles.costOver : styles.costOk}>
                    €{cost.toFixed(2)} estimated
                </span>
                <div className={styles.progressTrack}>
                    <div
                        className={`${styles.progressFill} ${over ? styles.progressOver : ''}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {over && <span className={styles.overAlert}>⚠ Over budget by €{(cost - budget).toFixed(2)}</span>}
            </div>
        </div>
    );
}

export default function MealPlanner() {
    const [planData, setPlanData] = useState(() => storageService.getPlan());
    const [recipes] = useState(() => storageService.getRecipes());
    const [budget, setBudget] = useState(() => storageService.getSettings().budget ?? 40);
    const [dragging, setDragging] = useState(null);

    const recipeMap = Object.fromEntries(recipes.map((r) => [r.id, r]));

    const savePlan = useCallback((updated) => {
        setPlanData(updated);
        storageService.setPlan(updated);
    }, []);

    const saveBudget = useCallback((val) => {
        setBudget(val);
        const s = storageService.getSettings();
        storageService.setSettings({ ...s, budget: val });
        const p = storageService.getPlan();
        storageService.setPlan({ ...p, budget: val });
    }, []);

    function getSlot(day, meal) {
        return planData.plan?.[day]?.[meal] ?? null;
    }

    function removeSlot(day, meal) {
        const updated = JSON.parse(JSON.stringify(planData));
        if (updated.plan[day]) updated.plan[day][meal] = null;
        savePlan(updated);
    }

    function handleDragStart(recipeId) {
        setDragging(recipeId);
    }

    function handleDrop(day, meal) {
        if (!dragging) return;
        const updated = JSON.parse(JSON.stringify(planData));
        if (!updated.plan[day]) updated.plan[day] = {};
        updated.plan[day][meal] = dragging;
        savePlan(updated);
        setDragging(null);
    }

    const totalMeals = DAYS.reduce((acc, day) =>
        acc + MEALS.filter((m) => getSlot(day, m)).length, 0
    );

    return (
        <div>
            <h1 className="section-title">Weekly Meal Planner</h1>
            <p className="section-subtitle">Assign recipes to meals · drag a planned meal between slots · track your budget</p>

            <BudgetBar plan={planData} recipes={recipes} budget={budget} onBudgetChange={saveBudget} />

            <div className={styles.summary}>
                <span>📅 {totalMeals} / 21 meals planned</span>
                <span>·</span>
                <a href="/grocery" className={styles.summaryLink}>View Grocery List →</a>
            </div>

            <div className={styles.grid}>
                {/* Header row */}
                <div className={styles.gridCorner} />
                {DAYS.map((day) => (
                    <div key={day} className={styles.dayHeader}>{day}</div>
                ))}

                {/* Meal rows */}
                {MEALS.map((meal) => (
                    <>
                        <div key={`label-${meal}`} className={styles.mealLabel}>
                            {MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </div>
                        {DAYS.map((day) => {
                            const recipeId = getSlot(day, meal);
                            const recipe = recipeId ? recipeMap[recipeId] : null;
                            return (
                                <div
                                    key={`${day}-${meal}`}
                                    className={`${styles.slot} ${dragging ? styles.slotDraggable : ''}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(day, meal)}
                                >
                                    {recipe ? (
                                        <div
                                            className={styles.slotCard}
                                            draggable
                                            onDragStart={() => handleDragStart(recipe.id)}
                                        >
                                            <div className={styles.slotName}>{recipe.name}</div>
                                            <div className={styles.slotMeta}>
                                                €{(recipe.estimatedCostPerServing * recipe.servings).toFixed(2)}
                                            </div>
                                            <button
                                                className={styles.slotRemove}
                                                onClick={() => removeSlot(day, meal)}
                                                aria-label={`Remove ${recipe.name}`}
                                                title="Remove"
                                            >✕</button>
                                        </div>
                                    ) : (
                                        <div className={styles.slotEmpty}>+ Drop recipe</div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                ))}
            </div>

            {/* Recipe picker sidebar */}
            <div className={styles.pickerSection}>
                <h2 className={styles.pickerTitle}>📚 Recipe Quick-Pick</h2>
                <p className={styles.pickerHint}>Drag a recipe card onto a meal slot above</p>
                <div className={styles.pickerGrid}>
                    {recipes.map((r) => (
                        <div
                            key={r.id}
                            className={styles.pickerCard}
                            draggable
                            onDragStart={() => handleDragStart(r.id)}
                            title={r.description}
                        >
                            <span className={styles.pickerName}>{r.name}</span>
                            <span className={styles.pickerCost}>€{r.estimatedCostPerServing.toFixed(2)}/sv</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
