import { useState } from 'react';
import { storageService } from '../../services/storageService.js';
import styles from './PantryManager.module.css';

const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'slices', 'tbsp', 'tsp', 'cup'];

export default function PantryManager() {
    const [items, setItems] = useState(() => storageService.getPantry());
    const [form, setForm] = useState({ name: '', qty: '', unit: 'g' });
    const [error, setError] = useState('');

    function save(updated) {
        setItems(updated);
        storageService.setPantry(updated);
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
                    <div className={styles.formField} style={{ flex: 2 }}>
                        <label htmlFor="pantry-name">Ingredient</label>
                        <input
                            id="pantry-name"
                            type="text"
                            placeholder="e.g. Olive oil"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            autoComplete="off"
                        />
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
