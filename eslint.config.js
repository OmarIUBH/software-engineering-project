import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    {
        ignores: ['dist', 'node_modules', 'backend'],
    },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                Promise: 'readonly',
                fetch: 'readonly',
                import: 'readonly',
                alert: 'readonly',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'no-unused-vars': 'off',
            'no-console': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
