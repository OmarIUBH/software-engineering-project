import { useState, useMemo, useEffect, useRef } from 'react';
import { storageService } from '../../services/storageService.js';
import styles from './PantryManager.module.css';

const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'slices', 'tbsp', 'tsp', 'cup'];

export default function PantryManager() {
    const [items, setItems] = useState(() => storageService.getPantry());
    const [form, setForm] = useState({ name: '', qty: '', unit: 'g' });
    const [error, setError] = useState('');

    // Autocomplete state
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);

    // Load unique ingredients from recipes for suggestions
    const allIngredients = useMemo(() => {
        const recipes = storageService.getRecipes();
        const names = new Set();
        recipes.forEach(r => {
            r.ingredients.forEach(ing => names.add(ing.name));
        });
        return Array.from(names).sort();
    }, []);

    // Handle clicking outside suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function save(updated) {
        setItems(updated);
        storageService.setPantry(updated);
    }

    function handleNameChange(e) {
        const val = e.target.value;
        setForm(f => ({ ...f, name: val }));

        if (val.trim().length > 0) {
            const filtered = allIngredients.filter(ing =>
                ing.toLowerCase().includes(val.toLowerCase()) &&
                ing.toLowerCase() !== val.toLowerCase()
            ).slice(0, 5); // Limit to 5 suggestions
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }

    function selectSuggestion(name) {
        setForm(f => ({ ...f, name }));
        setShowSuggestions(false);
    }

    function handleAdd(e) {
        e.preventDefault();
        const name = form.name.trim();
        const qty = parseFloat(form.qty);
        if (!name) { setError('Please enter an ingredient name.'); return; }
        if (!qty || qty <= 0) { setError('Please enter a valid quantity.'); return; }
        setError('');

        const existing = items.findIndex(
            (i) => i.name.toLowerCase() === name.toLowerCase() && i.unit === form.unit
        );

        if (existing >= 0) {
            const updated = items.map((item, idx) =>
                idx === existing ? { ...item, qty: Math.round((item.qty + qty) * 100) / 100 } : item
            );
            save(updated);
        } else {
            const newItem = {
                id: `p${Date.now()}`,
                name,
                qty,
                unit: form.unit,
            };
            save([...items, newItem]);
        }
        setForm((f) => ({ ...f, name: '', qty: '' }));
        setShowSuggestions(false);
    }

    function handleRemove(id) {
        save(items.filter((i) => i.id !== id));
    }

    function handleUpdateQty(id, qty) {
        save(items.map((i) => i.id === id ? { ...i, qty: parseFloat(qty) || 0 } : i));
    }

    return (
        <div>
            <h1 className="section-title">My Pantry</h1>
            <p className="section-subtitle">
                Add what you already have at home · pantry items are deducted from your grocery list automatically
            </p>

            {/* Add form */}
            <form onSubmit={handleAdd} className={styles.addForm} noValidate>
                <div className={styles.formRow}>
                    <div className={styles.formField} style={{ flex: 2, position: 'relative' }} ref={suggestionRef}>
                        <label htmlFor="pantry-name">Ingredient</label>
                        <input
                            id="pantry-name"
                            type="text"
                            placeholder="e.g. Olive oil"
                            value={form.name}
                            onChange={handleNameChange}
                            onFocus={() => form.name.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                            autoComplete="off"
                        />
                        {showSuggestions && (
                            <ul className={styles.suggestions}>
                                {suggestions.map((s) => (
                                    <li key={s} onClick={() => selectSuggestion(s)}>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className={styles.formField}>
                        <label htmlFor="pantry-qty">Quantity</label>
                        <input
                            id="pantry-qty"
                            type="number"
                            min="0.01"
                            step="any"
                            placeholder="0"
                            value={form.qty}
                            onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                        />
                    </div>
                    <div className={styles.formField}>
                        <label htmlFor="pantry-unit">Unit</label>
                        <select
                            id="pantry-unit"
                            value={form.unit}
                            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                        >
                            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <button type="submit" className={`btn btn-primary ${styles.addBtn}`}>+ Add</button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
            </form>

            <div className="divider" />

            {/* Pantry list */}
            {items.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🧀</div>
                    <p className="empty-state__text">Your pantry is empty. Add items above to get started.</p>
                </div>
            ) : (
                <ul className={styles.pantryList}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.pantryItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                            </div>
                            <div className={styles.itemControls}>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={item.qty}
                                    onChange={(e) => handleUpdateQty(item.id, e.target.value)}
                                    className={styles.qtyInput}
                                    aria-label={`Quantity of ${item.name}`}
                                />
                                <span className={styles.unitLabel}>{item.unit}</span>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleRemove(item.id)}
                                    aria-label={`Remove ${item.name} from pantry`}
                                >
                                    🗑
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.footer}>
                <span className={styles.footerNote}>
                    💡 Tip: Pantry quantities are subtracted from your grocery list. Go to{' '}
                    <a href="/grocery">Grocery List</a> and enable "Deduct pantry items" to see the effect.
                </span>
            </div>
        </div>
    );
}
