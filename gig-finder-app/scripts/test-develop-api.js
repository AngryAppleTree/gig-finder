const https = require('https');

async function testDevelopAPI() {
    const hostname = 'gigfinder-git-develop-contactangryappletree-4366s-projects.vercel.app';
    const path = '/api/events?keyword=test';

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
                        console.log(`✅ Received ${json.events.length} events\n`);

                        // Look for TEST GIG
                        const testGig = json.events.find(e =>
                            e.name.toLowerCase().includes('test')
                        );

                        if (testGig) {
                            console.log('Found TEST GIG:');
                            console.log('─'.repeat(50));
                            console.log(`  name: ${testGig.name}`);
                            console.log(`  venue: ${testGig.venue}`);
                            console.log(`  source: ${testGig.source}`);
                            console.log(`  isVerified: ${testGig.isVerified}`);
                            console.log('');

                            const shouldShowVerified = testGig.source !== 'manual' || testGig.isVerified;
                            console.log('Badge Logic:');
                            console.log('─'.repeat(50));
                            console.log(`  Condition: source !== 'manual' || isVerified`);
                            console.log(`  Evaluation: '${testGig.source}' !== 'manual' || ${testGig.isVerified}`);
                            console.log(`  Result: ${shouldShowVerified}`);
                            console.log(`  Expected Badge: ${shouldShowVerified ? '✓ Verified' : '⚠ Community Post'}`);
                            console.log('');

                            if (testGig.isVerified === undefined) {
                                console.log('❌ PROBLEM: isVerified is undefined');
                                console.log('   The API is not returning the isVerified field at all.');
                            } else if (testGig.isVerified === false) {
                                console.log('❌ PROBLEM: isVerified is false');
                                console.log('   Either the event or venue is not verified in the database.');
                            } else {
                                console.log('✅ isVerified is true - badge should show "Verified"');
                            }
                        } else {
                            console.log('❌ No TEST GIG found in results');
                        }
                    } else {
                        console.log('Unexpected response:', JSON.stringify(json, null, 2).substring(0, 500));
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

console.log('=== Testing Develop Deployment ===\n');
testDevelopAPI().catch(console.error);
