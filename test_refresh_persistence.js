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
    const interviewId = 'interview-' + Math.random().toString(36).substring(2, 9);
    const candidate = {
        member: { name: 'Sarah Johnson', jobRole: 'Data Engineer', yearsExperience: 4 },
        signals: {}
    };

    console.log('1. Start interview');
    await request({
        hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { interviewId, candidate });

    console.log('2. Answer Q1');
    await request({
        hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { interviewId, message: 'I am Sarah' });

    console.log('3. Refresh the browser...'); // simulates calling GET /api/session
    const restored = await request({
        hostname: 'localhost', port: 3000, path: `/api/session/${interviewId}`, method: 'GET'
    });

    if (restored && restored.candidate && restored.candidate.member.name === 'Sarah Johnson' && restored.questionCount === 1) {
        console.log('✅ PASS: Automatically restores exactly Sarah Johnson from the active session string without restarting from Q1.');
        process.exit(0);
    } else {
        console.error('❌ FAIL: Session restoration logic failed.', restored);
        process.exit(1);
    }
}

run();
