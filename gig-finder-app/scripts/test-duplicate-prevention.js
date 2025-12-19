require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Test cases for duplicate prevention
const testCases = [
    { name: 'The Banshee Labyrinth', city: 'Edinburgh', shouldMatch: 1 },
    { name: 'Banshee Labyrinth', city: 'Edinburgh', shouldMatch: 1 },
    { name: 'BANSHEE LABYRINTH', city: 'Edinburgh', shouldMatch: 1 },
    { name: 'Sneaky Petes', city: 'Edinburgh', shouldMatch: 2 },
    { name: "Sneaky Pete's", city: 'Edinburgh', shouldMatch: 2 },
    { name: 'The Sneaky Petes', city: 'Edinburgh', shouldMatch: 2 },
    { name: 'Blue Dog', city: 'Glasgow', shouldMatch: 60 },
    { name: 'The Blue Dog', city: 'Glasgow', shouldMatch: 60 },
    { name: 'THE BLUE DOG', city: 'Glasgow', shouldMatch: 60 },
    { name: 'Leith Depot', city: 'Edinburgh', shouldMatch: 3 },
    { name: 'The Leith Depot', city: 'Edinburgh', shouldMatch: 3 },
];

function normalizeVenueName(name) {
    return name
        .toLowerCase()
        .replace(/^the\s+/i, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function testDuplicatePrevention() {
    const client = await pool.connect();

    try {
        console.log('🧪 Testing Duplicate Prevention System\n');
        console.log('='.repeat(80));

        let passed = 0;
        let failed = 0;

        for (const test of testCases) {
            const normalized = normalizeVenueName(test.name);

            const result = await client.query(
                'SELECT id, name FROM venues WHERE normalized_name = $1 AND city = $2',
                [normalized, test.city]
            );

            const foundId = result.rows.length > 0 ? result.rows[0].id : null;
            const foundName = result.rows.length > 0 ? result.rows[0].name : null;
            const success = foundId === test.shouldMatch;

            if (success) {
                console.log(`✅ "${test.name}" → ID ${foundId} ("${foundName}")`);
                passed++;
            } else {
                console.log(`❌ "${test.name}" → Expected ID ${test.shouldMatch}, got ${foundId}`);
                failed++;
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n📊 Test Results:`);
        console.log(`   Passed: ${passed}/${testCases.length}`);
        console.log(`   Failed: ${failed}/${testCases.length}`);

        if (failed === 0) {
            console.log('\n🎉 All tests passed! Duplicate prevention is working correctly.\n');
        } else {
            console.log('\n⚠️  Some tests failed. Check the implementation.\n');
        }

    } finally {
        client.release();
        await pool.end();
    }
}

testDuplicatePrevention().catch(console.error);
