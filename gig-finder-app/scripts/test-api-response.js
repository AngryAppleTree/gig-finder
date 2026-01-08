const https = require('https');

async function testAPI(path) {
    const hostname = 'gigfinder-tau.vercel.app';  // Production URL

    console.log(`Testing: https://${hostname}${path}\n`);

    return new Promise((resolve, reject) => {
        const options = {
            hostname,
            path,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Node.js API Test'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            console.log(`Status: ${res.statusCode}`);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);

                    if (json.error) {
                        console.log(`❌ API Error: ${json.error}`);
                    } else if (json.events) {
                        console.log(`✅ Received ${json.events.length} events`);

                        if (json.events.length > 0) {
                            console.log('\nFirst 3 events:');
                            json.events.slice(0, 3).forEach((e, i) => {
                                console.log(`  ${i + 1}. ${e.name} at ${e.venue}`);
                                console.log(`     source: ${e.source}, verified: ${e.isVerified}`);
                            });

                            // Look for TEST GIG
                            const testGig = json.events.find(e =>
                                e.name.toLowerCase().includes('test')
                            );

                            if (testGig) {
                                console.log('\n✅ Found TEST GIG:');
                                console.log(`   isVerified: ${testGig.isVerified}`);
                                console.log(`   source: ${testGig.source}`);
                            }
                        }
                    } else {
                        console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500));
                    }

                    resolve();
                } catch (e) {
                    console.error('Failed to parse JSON');
                    console.log('Raw response:', data.substring(0, 1000));
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request failed:', e);
            reject(e);
        });

        req.end();
    });
}

async function runTests() {
    console.log('=== Testing Vercel Production API ===\n');

    // Test without location filter
    await testAPI('/api/events');

    console.log('\n' + '='.repeat(50) + '\n');

    // Test with Edinburgh
    await testAPI('/api/events?location=Edinburgh');
}

runTests().catch(console.error);
