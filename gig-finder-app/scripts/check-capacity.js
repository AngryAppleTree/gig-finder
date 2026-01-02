require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT 
    COUNT(e.id) as total_events,
    SUM(v.capacity) as total_capacity,
    AVG(v.capacity) as avg_capacity,
    MIN(v.capacity) as min_capacity,
    MAX(v.capacity) as max_capacity
  FROM events e
  LEFT JOIN venues v ON e.venue_id = v.id
  WHERE v.capacity IS NOT NULL
`)
    .then(res => {
        const stats = res.rows[0];
        console.log('Event Capacity Statistics:\n');
        console.log(`Total Events (with venue capacity): ${stats.total_events}`);
        console.log(`Total Capacity (sum): ${stats.total_capacity}`);
        console.log(`Average Capacity: ${Math.round(stats.avg_capacity)}`);
        console.log(`Smallest Venue: ${stats.min_capacity}`);
        console.log(`Largest Venue: ${stats.max_capacity}`);
    })
    .catch(err => console.error('Error:', err.message))
    .finally(() => pool.end());
