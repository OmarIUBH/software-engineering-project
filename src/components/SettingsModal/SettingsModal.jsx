import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storageService.js';
import styles from './SettingsModal.module.css';

export default function SettingsModal({ isOpen, onClose }) {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState(storageService.getSettings());

    useEffect(() => {
        if (isOpen) {
            setSettings(storageService.getSettings());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        storageService.setSettings(settings);
        if (settings.language && i18n.language !== settings.language) {
            i18n.changeLanguage(settings.language);
        }
        // Force a page turn for global unit refreshes could be tricky in a SPA without global state context,
        // but since MealPlanner polls storage, it's mostly fine. We'll simulate a soft reload or event.
        window.dispatchEvent(new Event('storage'));
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{t('settings.title', 'Settings')}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div className={styles.content}>
                    <div className={styles.formGroup}>
                        <label>{t('settings.language', 'Language')}</label>
                        <select 
                            value={settings.language} 
                            onChange={(e) => setSettings({...settings, language: e.target.value})}
                        >
                            <option value="en">English</option>
                            <option value="de">Deutsch</option>
                            <option value="ar">العربية</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('settings.dialect', 'AI Dialect / Regional Accent (Optional)')}</label>
                        <input 
                            type="text" 
                            placeholder={t('settings.dialect_placeholder', 'e.g., Egyptian, Scottish, Bavarian')}
                            value={settings.dialect || ''} 
                            onChange={(e) => setSettings({...settings, dialect: e.target.value})}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2e3347', background: '#222637', color: '#e8eaf6' }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('settings.measurement_system', 'Measurement System')}</label>
                        <select 
                            value={settings.measurementSystem} 
                            onChange={(e) => setSettings({...settings, measurementSystem: e.target.value})}
                        >
                            <option value="metric">{t('settings.metric', 'Metric (g, ml)')}</option>
                            <option value="imperial">{t('settings.imperial', 'Imperial (oz, cups)')}</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t('settings.currency', 'Preferred Currency')}</label>
                        <select 
                            value={settings.currency} 
                            onChange={(e) => setSettings({...settings, currency: e.target.value})}
                        >
                            <option value="€">EUR (€)</option>
                            <option value="$">USD ($)</option>
                            <option value="£">GBP (£)</option>
                            <option value="د.إ">AED (د.إ)</option>
                        </select>
                    </div>
                </div>
                <div className={styles.footer}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        {t('settings.save', 'Save Settings')}
                    </button>
                </div>
            </div>
        </div>
    );
}
