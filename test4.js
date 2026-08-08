const http = require('http');
function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => { let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(b)); });
        if (data) req.write(JSON.stringify(data)); req.end();
    });
}
async function run() {
    const interviewId = 'interview-' + Math.random().toString(36).substring(2, 9);
    const candidate = { member: { name: 'Sarah', jobRole: 'DE', yearsExperience: 4 }, signals: {} };

    await request({ hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { interviewId, candidate });
    await request({ hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { interviewId, message: 'Ready' });

    let r2 = await request({ hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { interviewId, message: 'I use correlation IDs' });
    console.log("R2:", r2);
}
run();
