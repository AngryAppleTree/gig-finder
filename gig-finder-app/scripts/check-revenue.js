require('dotenv').config({ path: '.env.production.local' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT 
    COUNT(e.id) as total_events,
    SUM(v.capacity * COALESCE(e.ticket_price, 0)) as total_potential_revenue,
    AVG(v.capacity * COALESCE(e.ticket_price, 0)) as avg_event_revenue,
    SUM(CASE WHEN e.ticket_price > 0 THEN 1 ELSE 0 END) as paid_events,
    SUM(CASE WHEN e.ticket_price = 0 OR e.ticket_price IS NULL THEN 1 ELSE 0 END) as free_events
  FROM events e
  LEFT JOIN venues v ON e.venue_id = v.id
  WHERE v.capacity IS NOT NULL
`)
    .then(res => {
        const stats = res.rows[0];
        console.log('Potential Revenue Statistics (if all events sold out):\n');
        console.log(`Total Events: ${stats.total_events}`);
        console.log(`  - Paid Events: ${stats.paid_events}`);
        console.log(`  - Free Events: ${stats.free_events}`);
        console.log(`\nTotal Potential Revenue: £${parseFloat(stats.total_potential_revenue).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        console.log(`Average per Event: £${parseFloat(stats.avg_event_revenue).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    })
    .catch(err => console.error('Error:', err.message))
    .finally(() => pool.end());
