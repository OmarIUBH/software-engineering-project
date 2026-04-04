import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { recipesApi } from '../../services/recipesApi.js';
import { storageService } from '../../services/storageService.js';
import { computeWeeklyCost } from '../../engines/groceryEngine.js';
import { formatCurrency } from '../../utils/currency.js';
import { settingsApi } from '../../services/settingsApi.js';
import { RecipeModal } from '../RecipeLibrary/RecipeLibrary.jsx';
import styles from './MealPlanner.module.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

function BudgetBar({ plan, recipes, budget, onBudgetChange, currency, onCurrencyChange }) {
    const { t } = useTranslation();
    const cost = computeWeeklyCost(plan, recipes);
    const pct = Math.min(100, Math.round((cost / (budget || 1)) * 100));
    const over = cost > budget;

    return (
        <div className={styles.budgetBar}>
            <div className={styles.budgetLeft}>
                <span className={styles.budgetLabel}>{t('planner.budget_title', 'Weekly Budget')}</span>
                <div className={styles.budgetInputRow}>
                    <input
                        type="number"
                        min="0"
                        value={budget}
                        onChange={(e) => onBudgetChange(parseFloat(e.target.value) || 0)}
                        className={styles.budgetInput}
                        aria-label="Weekly budget"
                    />
                    <select
                        value={currency}
                        onChange={(e) => onCurrencyChange(e.target.value)}
                        className={styles.currencySelect}
                        aria-label="Currency"
                    >
                        {['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR', 'MYR', 'RON', 'VND', 'ARS', 'BHD', 'BGN', 'HRK', 'EGP', 'ISK', 'JMD', 'JOD', 'KES', 'KWD', 'LBP', 'MAD', 'OMR', 'PKR', 'PEN', 'QAR', 'RSD', 'LKR', 'NGN', 'BDT'].sort().map(code => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className={styles.budgetRight}>
                <span className={over ? styles.costOver : styles.costOk}>
                    {formatCurrency(cost, currency)} {t('planner.estimated_cost', 'estimated')}
                </span>
                <div className={styles.progressTrack}>
                    <div
                        className={`${styles.progressFill} ${over ? styles.progressOver : ''}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {over && <span className={styles.overAlert}>⚠ {t('planner.over_budget', 'Over budget by')} {formatCurrency(cost - budget, currency)}</span>}
            </div>
        </div>
    );
}

export default function MealPlanner() {
    const { t } = useTranslation();
    const [planData, setPlanData] = useState(() => storageService.getPlan());
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [budget, setBudget] = useState(() => storageService.getSettings().budget ?? 40);
    const [dragging, setDragging] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [currency, setCurrency] = useState(() => storageService.getSettings()?.currency || 'EUR');

    useEffect(() => {
        recipesApi.getAllForPlanning()
            .then(data => {
                const savedServings = storageService.getSettings().recipeServings || {};
                const augmented = data.map(r => ({
                    ...r,
                    servings: savedServings[r.id] || r.servings
                }));
                setRecipes(augmented);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch recipes:', err);
                setError(t('planner.error', 'Failed to load recipes.'));
                setLoading(false);
            });
    }, []);

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

    const saveCurrency = useCallback((val) => {
        setCurrency(val);
        const s = storageService.getSettings();
        const updatedSettings = { ...s, currency: val };
        storageService.setSettings(updatedSettings);
        settingsApi.pushToServer(updatedSettings);
    }, []);

    function getSlot(day, meal) {
        const slot = planData.plan?.[day]?.[meal] ?? null;
        if (!slot) return null;

        const id = typeof slot === 'object' ? slot.id : slot;
        const recipe = recipeMap[id];
        if (!recipe) return null;

        return {
            ...recipe,
            plannedServings: typeof slot === 'object' ? slot.servings : recipe.servings
        };
    }

    function updateServings(day, meal, delta) {
        const updated = JSON.parse(JSON.stringify(planData));
        const slot = updated.plan[day][meal];
        const currentId = typeof slot === 'object' ? slot.id : slot;
        const currentSrv = typeof slot === 'object' ? slot.servings : recipeMap[currentId].servings;

        updated.plan[day][meal] = {
            id: currentId,
            servings: Math.max(1, Math.min(12, currentSrv + delta))
        };
        savePlan(updated);
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

        // Use recipe's current default servings for the new slot
        const recipe = recipeMap[dragging];
        updated.plan[day][meal] = {
            id: dragging,
            servings: recipe ? recipe.servings : 2
        };

        savePlan(updated);
        setDragging(null);
    }

    const totalMeals = DAYS.reduce((acc, day) =>
        acc + MEALS.filter((m) => getSlot(day, m)).length, 0
    );

    return (
        <div>
            <h1 className="section-title">{t('planner.title', 'Weekly Meal Planner')}</h1>
            <p className="section-subtitle">{t('planner.subtitle', 'Assign recipes to meals · drag a planned meal between slots · track your budget')}</p>

            {loading && <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading planner...</p></div>}
            {error && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--danger-color)' }}><p>{error}</p></div>}

            {!loading && !error && (
                <>
                    <BudgetBar 
                        plan={planData} 
                        recipes={recipes} 
                        budget={budget} 
                        onBudgetChange={saveBudget} 
                        currency={currency}
                        onCurrencyChange={saveCurrency} 
                    />

                    <div className={styles.summary}>
                        <span>📅 {totalMeals} / 21 {t('planner.meals_planned', 'meals planned')}</span>
                        <span>·</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-success, #22c55e)' }}>✓ {t('planner.synced', 'Synced to LocalStorage')}</span>
                        <span>·</span>
                        <a href="/grocery" className={styles.summaryLink}>{t('planner.view_grocery', 'View Grocery List')} →</a>
                    </div>

                    <div className={styles.grid}>
                        {/* Header row */}
                        <div className={styles.gridCorner} />
                        {DAYS.map((day) => (
                            <div key={day} className={styles.dayHeader}>{day}</div>
                        ))}

                        {/* Meal rows */}
                        {MEALS.map((meal) => (
                            <div key={meal} style={{ display: 'contents' }}>
                                <div className={styles.mealLabel}>
                                    {MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                </div>
                                {DAYS.map((day) => {
                                    const recipe = getSlot(day, meal);
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
                                                    onClick={() => setSelectedRecipe(recipe)}
                                                >
                                                    <div className={styles.slotName}>{recipe.name}</div>

                                                    <div className={styles.servingAdjuster}>
                                                        <button
                                                            className={styles.adjustBtn}
                                                            onClick={(e) => { e.stopPropagation(); updateServings(day, meal, -1); }}
                                                        >−</button>
                                                        <span className={styles.srvCount}>{recipe.plannedServings} srv</span>
                                                        <button
                                                            className={styles.adjustBtn}
                                                            onClick={(e) => { e.stopPropagation(); updateServings(day, meal, 1); }}
                                                        >+</button>
                                                    </div>

                                                    <div className={styles.slotMeta}>
                                                        {formatCurrency(recipe.estimatedCostPerServing * recipe.plannedServings, currency)}
                                                    </div>
                                                    <button
                                                        className={styles.slotRemove}
                                                        onClick={(e) => { e.stopPropagation(); removeSlot(day, meal); }}
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
                            </div>
                        ))}
                    </div>

                    {/* Recipe picker sidebar */}
                    <div className={styles.pickerSection}>
                        <h2 className={styles.pickerTitle}>📚 {t('planner.quick_pick', 'Recipe Quick-Pick')}</h2>
                        <p className={styles.pickerHint}>{t('planner.quick_pick_hint', 'Drag a recipe card onto a meal slot above')}</p>
                        <div className={styles.pickerGrid}>
                            {recipes.filter(r => !r.is_community).map((r) => (
                                <div
                                    key={r.id}
                                    className={styles.pickerCard}
                                    draggable
                                    onDragStart={() => handleDragStart(r.id)}
                                    title={r.description}
                                >
                                    <span className={styles.pickerName}>{r.name}</span>
                                    <span className={styles.pickerCost}>{formatCurrency(r.estimatedCostPerServing, currency)}/sv</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedRecipe && (
                        <RecipeModal
                            recipe={selectedRecipe}
                            onClose={() => setSelectedRecipe(null)}
                        />
                    )}
                </>
            )}
        </div>
    );
}
