import { useState, useMemo } from 'react';
import { storageService } from '../../services/storageService.js';
import { filterByTags, ALL_TAGS } from '../../engines/filterEngine.js';
import { searchRecipes } from '../../engines/searchEngine.js';
import { scaleIngredients } from '../../engines/scalingEngine.js';
import styles from './RecipeLibrary.module.css';

const TAG_LABELS = {
    vegetarian: '🌿 Vegetarian',
    vegan: '🌱 Vegan',
    'high-protein': '💪 High-Protein',
    'dairy-free': '🥛 Dairy-Free',
    'gluten-free': '🌾 Gluten-Free',
};

function RecipeModal({ recipe, onClose }) {
    const [servings, setServings] = useState(recipe.servings);
    const scaled = useMemo(
        () => scaleIngredients(recipe.ingredients, recipe.servings, servings),
        [recipe, servings]
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

                <div className={styles.modalHeader}>
                    <div className={styles.modalCategory}>{recipe.category}</div>
                    <h2 className={styles.modalTitle}>{recipe.name}</h2>
                    <p className={styles.modalDesc}>{recipe.description}</p>
                    <div className={styles.modalMeta}>
                        <span>⏱ {recipe.prepTime} min</span>
                        <span>💶 €{recipe.estimatedCostPerServing.toFixed(2)} / serving</span>
                    </div>
                    <div className={styles.tagRow}>
                        {recipe.dietTags.map((t) => (
                            <span key={t} className={`tag tag-${t}`}>{TAG_LABELS[t]}</span>
                        ))}
                    </div>
                </div>

                <div className={styles.servingControl}>
                    <label htmlFor="servings-input">Servings</label>
                    <div className={styles.servingRow}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setServings(Math.max(1, servings - 1))}>−</button>
                        <input
                            id="servings-input"
                            type="number"
                            min="1"
                            max="12"
                            value={servings}
                            onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                            style={{ width: 60, textAlign: 'center' }}
                        />
                        <button className="btn btn-ghost btn-sm" onClick={() => setServings(Math.min(12, servings + 1))}>+</button>
                    </div>
                </div>

                <div className="divider" />

                <h3 className={styles.sectionLabel}>Ingredients</h3>
                <ul className={styles.ingredientList}>
                    {scaled.map((ing, i) => (
                        <li key={i} className={styles.ingredientItem}>
                            <span className={styles.ingQty}>{ing.qty} {ing.unit}</span>
                            <span>{ing.name}</span>
                        </li>
                    ))}
                </ul>

                <div className="divider" />

                <h3 className={styles.sectionLabel}>Instructions</h3>
                <ol className={styles.instructions}>
                    {recipe.instructions.map((step, i) => (
                        <li key={i} className={styles.instructionStep}>{step}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

function RecipeCard({ recipe, onDetail, onAddToPlan }) {
    return (
        <div className={`card ${styles.recipeCard}`} onClick={() => onDetail(recipe)}>
            <div className={styles.cardHeader}>
                <span className={styles.cardCategory}>{recipe.category}</span>
                <span className={styles.cardCost}>€{recipe.estimatedCostPerServing.toFixed(2)}/srv</span>
            </div>
            <h3 className={styles.cardTitle}>{recipe.name}</h3>
            <p className={styles.cardDesc}>{recipe.description}</p>
            <div className={styles.cardMeta}>
                <span>⏱ {recipe.prepTime} min</span>
                <span>🍽 {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span>
            </div>
            <div className={styles.tagRow}>
                {recipe.dietTags.map((t) => (
                    <span key={t} className={`tag tag-${t}`}>{TAG_LABELS[t]}</span>
                ))}
            </div>
            <button
                className={`btn btn-primary btn-sm ${styles.addBtn}`}
                onClick={(e) => { e.stopPropagation(); onAddToPlan(recipe); }}
                aria-label={`Add ${recipe.name} to plan`}
            >
                + Add to Plan
            </button>
        </div>
    );
}

function AddToPlanModal({ recipe, onClose }) {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const MEALS = ['breakfast', 'lunch', 'dinner'];
    const [day, setDay] = useState('Monday');
    const [meal, setMeal] = useState('dinner');

    function handleAdd() {
        const plan = storageService.getPlan();
        if (!plan.plan[day]) plan.plan[day] = {};
        plan.plan[day][meal] = recipe.id;
        storageService.setPlan(plan);
        onClose(true);
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                <h2 className={styles.modalTitle} style={{ fontSize: '1.2rem', marginBottom: 20 }}>
                    Add "{recipe.name}" to Plan
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label htmlFor="plan-day">Day</label>
                        <select id="plan-day" value={day} onChange={(e) => setDay(e.target.value)}>
                            {DAYS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="plan-meal">Meal</label>
                        <select id="plan-meal" value={meal} onChange={(e) => setMeal(e.target.value)}>
                            {MEALS.map((m) => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                        </select>
                    </div>
                    <button className="btn btn-primary" onClick={handleAdd}>
                        ✔ Add to {day} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RecipeLibrary() {
    const [recipes] = useState(() => storageService.getRecipes());
    const [query, setQuery] = useState('');
    const [activeTags, setActiveTags] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [planTarget, setPlanTarget] = useState(null);
    const [toast, setToast] = useState('');

    const filtered = useMemo(() => {
        const searched = searchRecipes(recipes, query);
        return filterByTags(searched, activeTags);
    }, [recipes, query, activeTags]);

    function toggleTag(tag) {
        setActiveTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }

    function handlePlanClose(added) {
        setPlanTarget(null);
        if (added) {
            setToast('Recipe added to plan! 🎉');
            setTimeout(() => setToast(''), 3000);
        }
    }

    return (
        <div>
            {toast && <div className={styles.toast}>{toast}</div>}

            <h1 className="section-title">Recipe Library</h1>
            <p className="section-subtitle">Browse {recipes.length} recipes · filter by diet · add to your weekly plan</p>

            {/* Search */}
            <div className={styles.searchRow}>
                <div className={styles.searchWrap}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="search"
                        placeholder="Search by name or ingredient…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search recipes"
                        className={styles.searchInput}
                    />
                </div>
                {activeTags.length > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTags([])}>
                        Clear filters
                    </button>
                )}
            </div>

            {/* Diet tag filters */}
            <div className={styles.filtersBar} role="group" aria-label="Diet tag filters">
                {ALL_TAGS.map((tag) => (
                    <button
                        key={tag}
                        className={`tag tag-${tag} ${styles.filterBtn} ${activeTags.includes(tag) ? styles.filterActive : ''}`}
                        onClick={() => toggleTag(tag)}
                        aria-pressed={activeTags.includes(tag)}
                    >
                        {TAG_LABELS[tag]}
                    </button>
                ))}
            </div>

            {/* Results count */}
            <p className={styles.resultsCount}>
                {filtered.length} recipe{filtered.length !== 1 ? 's' : ''} found
            </p>

            {/* Recipe grid */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🍽</div>
                    <p className="empty-state__text">No recipes match your filters.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filtered.map((r) => (
                        <RecipeCard
                            key={r.id}
                            recipe={r}
                            onDetail={setSelectedRecipe}
                            onAddToPlan={setPlanTarget}
                        />
                    ))}
                </div>
            )}

            {selectedRecipe && (
                <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
            )}
            {planTarget && (
                <AddToPlanModal recipe={planTarget} onClose={handlePlanClose} />
            )}
        </div>
    );
}
