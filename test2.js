const http = require('http');
function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => { let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(JSON.parse(b))); });
        if (data) req.write(JSON.stringify(data)); req.end();
    });
}
async function run() {
    const sessionId = 'session-' + Math.random().toString(36).substring(2, 9);
    const candidate = { member: { name: 'Sarah', jobRole: 'DE', yearsExperience: 4 } };

    await request({ hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { sessionId, candidate });

    let r1 = await request({ hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { sessionId, message: 'Ready' });
    console.log('R1:', r1.reply ? r1.reply.substring(0, 50) : r1.error);

    let r2 = await request({ hostname: 'localhost', port: 3000, path: '/api/interview', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { sessionId, message: 'I use correlation IDs' });
    console.log('R2:', r2.reply ? r2.reply.substring(0, 50) : r2.error);
}
run();
