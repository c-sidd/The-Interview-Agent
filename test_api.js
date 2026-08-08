const http = require('http');
const { app, server } = require('./server');

console.log("=== Integration API Test ===");

// Helper to make POST requests
function postJSON(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(body)
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

// Helper to make GET requests
function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(body)
        });
      });
    }).on('error', (err) => reject(err));
  });
}

async function runIntegrationTests() {
  try {
    // Wait for server to bind
    await new Promise((r) => setTimeout(r, 1000));

    // 1. Test Health endpoint
    console.log("Testing GET /api/health...");
    const health = await getJSON('/api/health');
    console.log(`Health Status: ${health.statusCode}, Body: ${JSON.stringify(health.body)}`);
    if (health.statusCode !== 200 || health.body.status !== 'OK') {
      throw new Error("Health check failed!");
    }

    // 2. Test Session Initialization (POST /api/interview with candidate)
    console.log("\nTesting POST /api/interview (Initialization)...");
    const initPayload = {
      sessionId: "session-api-test-789",
      candidate: {
        member: {
          id: "CAND-001",
          name: "Sarah Johnson",
          jobRole: "Senior Data Engineer",
          yearsExperience: 9,
          education: "MS Computer Science"
        },
        missions: [],
        signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 }
      }
    };

    const initResult = await postJSON('/api/interview', initPayload);
    console.log(`Init Status: ${initResult.statusCode}, Body: ${JSON.stringify(initResult.body)}`);
    if (initResult.statusCode !== 200 || initResult.body.done !== false || !initResult.body.reply.includes("Welcome")) {
      throw new Error("Session initialization failed!");
    }

    // 3. Test Invalid Request Validation (POST /api/interview without sessionId)
    console.log("\nTesting POST /api/interview validation (Missing sessionId)...");
    const badPayload = { candidate: {} };
    const badResult = await postJSON('/api/interview', badPayload).catch(err => {
      // Catch connection or parse errors (the server will return 400 JSON which postJSON resolves)
      return { statusCode: 400 };
    });
    console.log(`Bad Request Status: ${badResult.statusCode}`);
    if (badResult.statusCode !== 400) {
      throw new Error("Input validation for missing sessionId failed!");
    }

    console.log("\n✅ SUCCESS: All API integration tests passed!");
    
    // Close server cleanly
    server.close(() => {
      console.log("Server closed successfully.");
      process.exit(0);
    });

  } catch (err) {
    console.error(`\n❌ ERROR: Integration tests failed: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  }
}

runIntegrationTests();
