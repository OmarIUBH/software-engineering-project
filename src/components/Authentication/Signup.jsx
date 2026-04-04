import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

export default function Signup() {
    const { t } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || t('auth.signup_failed', 'Failed to register'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>{t('auth.create_account', 'Create Account')}</h2>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>{t('auth.name', 'Name')}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>{t('auth.email', 'Email')}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>{t('auth.password', 'Password')}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? t('auth.creating', 'Creating...') : t('auth.sign_up', 'Sign Up')}
                </button>
                <p>{t('auth.already_have', 'Already have an account?')} <a href="/login">{t('nav.login', 'Login')}</a></p>
            </form>
        </div>
    );
}
