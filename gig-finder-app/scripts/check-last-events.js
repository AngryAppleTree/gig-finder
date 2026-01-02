require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT id, name, date, user_id, created_at 
  FROM events 
  ORDER BY created_at DESC 
  LIMIT 2
`)
    .then(res => {
        console.log('Last 2 events added:\n');
        res.rows.forEach((e, i) => {
            console.log(`${i + 1}. [${e.id}] ${e.name}`);
            console.log(`   Date: ${e.date}`);
            console.log(`   User: ${e.user_id}`);
            console.log(`   Created: ${e.created_at}\n`);
        });
    })
    .catch(err => console.error('Error:', err.message))
    .finally(() => pool.end());
