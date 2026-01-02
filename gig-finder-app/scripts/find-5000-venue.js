require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT id, name, city, capacity 
  FROM venues 
  WHERE capacity = 5000
`)
    .then(res => {
        console.log('Venue(s) with 5000 capacity:\n');
        res.rows.forEach(v => {
            console.log(`[${v.id}] ${v.name} (${v.city || 'Unknown city'})`);
            console.log(`Capacity: ${v.capacity}\n`);
        });
    })
    .catch(err => console.error('Error:', err.message))
    .finally(() => pool.end());
