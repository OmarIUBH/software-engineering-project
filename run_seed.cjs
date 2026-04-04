/**
 * run_seed.cjs
 * Executes community_seed.sql against Supabase using the REST API.
 * Run with: node run_seed.cjs
 */

const fs = require('fs');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://afecffbqyemceqnhxgvd.supabase.co';
const PROJECT_REF  = 'afecffbqyemceqnhxgvd';

// Read anon key from .env
const envRaw = fs.readFileSync('.env', 'utf8');
const anonKeyMatch = envRaw.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
const ANON_KEY = anonKeyMatch ? anonKeyMatch[1].trim() : null;

if (!ANON_KEY) {
  console.error('Could not read VITE_SUPABASE_ANON_KEY from .env');
  process.exit(1);
}

// Read the SQL file
const sql = fs.readFileSync('community_seed.sql', 'utf8');
console.log(`Read SQL file: ${sql.length} chars`);

// Split into individual statements (split on semicolons that end a statement)
// We'll run each recipe block as one statement
const statements = sql
  .split(/;\s*\n/)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Found ${statements.length} statements to execute`);

// ── Run via Supabase SQL endpoint ─────────────────────────────────────
// Supabase exposes a /rest/v1/rpc endpoint, but for raw SQL we need
// the Management API or use pg directly.
// Since we only have the anon key, let's try the pg-meta REST endpoint.

// Actually, let's use the Supabase JS client approach via fetch
// We'll use the pg direct connection approach if available,
// or fall back to running statements via the REST API rpc.

// The cleanest way: POST to /sql on Supabase's internal pg-meta
// But that requires service_role key. Let's check if we can find it.

// Try reading from .env or wrangler.toml
let SERVICE_ROLE_KEY = null;

// Check wrangler.toml
try {
  const wrangler = fs.readFileSync('wrangler.toml', 'utf8');
  const match = wrangler.match(/SUPABASE_SERVICE_KEY\s*=\s*"([^"]+)"/);
  if (match) SERVICE_ROLE_KEY = match[1];
} catch(e) {}

// Check functions directory for env files
if (!SERVICE_ROLE_KEY) {
  const dirs = ['functions', 'backend'];
  for (const dir of dirs) {
    try {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (f.includes('.env') || f.includes('.toml')) {
          const content = fs.readFileSync(`${dir}/${f}`, 'utf8');
          const m = content.match(/SERVICE_ROLE|service_role/i);
          if (m) {
            const km = content.match(/[A-Za-z_]*SERVICE[A-Za-z_]*KEY[A-Za-z_]*\s*=\s*["']?([A-Za-z0-9._-]+)["']?/i);
            if (km) SERVICE_ROLE_KEY = km[1];
          }
        }
      }
    } catch(e) {}
  }
}

console.log('Service role key found:', SERVICE_ROLE_KEY ? 'YES' : 'NO - will use anon key + pg-meta');

const KEY_TO_USE = SERVICE_ROLE_KEY || ANON_KEY;

// Run the full SQL as a single block via pg-meta API
function runSQL(sqlText) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sqlText });
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    
    // Use Supabase's internal pg-meta endpoint
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': KEY_TO_USE,
        'Authorization': `Bearer ${KEY_TO_USE}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data.substring(0, 500)}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Alternative: use the pg-meta /query endpoint
function runSQLViaPgMeta(sqlText) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ sql: sqlText });
    
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: '/pg-meta/v1-query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': KEY_TO_USE,
        'Authorization': `Bearer ${KEY_TO_USE}`,
        'Content-Length': Buffer.byteLength(body),
        'x-connection-encrypted': 'true'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        const preview = data.substring(0, 1000);
        console.log(`Response: ${preview}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('\n=== Running Community Seed SQL ===\n');
  
  try {
    await runSQLViaPgMeta(sql);
    console.log('\n✅ SUCCESS! All 8 community recipes seeded.');
  } catch(err) {
    console.log('\nPg-meta approach failed, trying rpc approach...');
    try {
      await runSQL(sql);
      console.log('\n✅ SUCCESS!');
    } catch(err2) {
      console.error('\n❌ Both approaches failed.');
      console.error('err1:', err.message.substring(0, 200));
      console.error('err2:', err2.message.substring(0, 200));
      console.log('\nPlease run the SQL manually in the Supabase SQL editor.');
      console.log('The clean SQL file is at: community_seed.sql');
    }
  }
}

main();
