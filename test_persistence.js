const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function run() {
    const interviewId = 'session-' + Math.random().toString(36).substring(2, 9);
    const candidate = {
        member: { name: 'Test Person', jobRole: 'Developer', yearsExperience: 3 },
        signals: {}
    };

    console.log('--- TEST 1: Create session ---');
    const res1 = await request({
        hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { interviewId, candidate });
    console.log('Session Created. Turn 1 reply:', res1.reply);

    console.log('\n--- TEST 2: Answer Question 1 ---');
    const res2 = await request({
        hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { interviewId, message: 'I know some things.' });
    console.log('Turn 2 reply:', res2.reply);

    console.log('\n--- TEST 3: Fetch Session via GET ---');
    const res3 = await request({
        hostname: 'localhost', port: 3000, path: `/api/session/${interviewId}`, method: 'GET'
    });
    console.log('Restored history length:', res3.history.length);
    console.log('Restored question count:', res3.questionCount);

    if (res3.history.length === 2 && res3.questionCount === 1) {
        console.log('✅ PASS: Session state persisted successfully.');
    } else {
        console.error('❌ FAIL: Session state missing or incorrect.', res3);
        process.exit(1);
    }
}

run();
