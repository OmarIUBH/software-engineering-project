# ⚠️ DEPRECATED: Legacy Node.js Backend

> **NOTICE:** This directory contains the legacy Node.js/Express application and internal SQLite file mechanisms. As of MealMate MVP v2.0, this entire directory is deprecated and functionally obsolete. 

## Architectural Shift
MealMate has natively migrated to a **Serverless Infrastructure**.

- **Supabase (PostgreSQL)** now serves as our core relational database.
- **Cloudflare Edge Workers** intercept our API requests. 
- You can find the active and routing Edge deployment logic in the root `/functions` directory!

## Migrations History
If you are explicitly looking for the data-migration logic that translated this SQLite infrastructure to Supabase, refer to `mutate` instructions left inside `migrate_to_supabase.cjs` found at the root of the project.

There is strictly no longer a need to run docker-compose backend containers to spin up this local server.
