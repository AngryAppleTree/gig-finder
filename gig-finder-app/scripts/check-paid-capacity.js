require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT 
    COUNT(e.id) as paid_events,
    SUM(v.capacity) as total_paid_capacity,
    AVG(v.capacity) as avg_paid_capacity,
    MIN(v.capacity) as min_paid_capacity,
    MAX(v.capacity) as max_paid_capacity
  FROM events e
  LEFT JOIN venues v ON e.venue_id = v.id
  WHERE v.capacity IS NOT NULL
    AND e.ticket_price > 0
`)
    .then(res => {
        const stats = res.rows[0];
        console.log('Paid Events Capacity Statistics:\n');
        console.log(`Total Paid Events: ${stats.paid_events}`);
        console.log(`Total Capacity (paid events only): ${stats.total_paid_capacity.toLocaleString('en-GB')}`);
        console.log(`Average Capacity: ${Math.round(stats.avg_paid_capacity)}`);
        console.log(`Smallest Paid Venue: ${stats.min_paid_capacity}`);
        console.log(`Largest Paid Venue: ${stats.max_paid_capacity}`);
    })
    .catch(err => console.error('Error:', err.message))
    .finally(() => pool.end());
