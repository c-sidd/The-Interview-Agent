/**
 * test_output_cleaner.js — Unit test for raw LLM reasoning redaction
 */

const InterviewService = require('./src/services/InterviewService');
const SessionService = require('./src/services/SessionService');
const CurriculumService = require('./src/services/CurriculumService');
const PromptService = require('./src/services/PromptService');
const LLMService = require('./src/services/LLMService');
const FeedbackService = require('./src/services/FeedbackService');

// Construct mock LLM service that returns a heavily polluted JSON response
class MockPollutedLLMService extends LLMService {
    async generateResponse(sys, prompt) {
        return `The user wants me to act as...
Candidate's previous response...
Critique...
Drafting...
Final JSON:
{
  "type": "question",
  "question": "How does asynchronous logging work in practice?"
}`;
    }
}

// Construct mock LLM service that returns correct JSON
class MockGoodLLMService extends LLMService {
    async generateResponse(sys, prompt) {
        return '```json\n{\n  "type": "question",\n  "question": "What trade-offs would you consider?"\n}\n```';
    }
}

// Construct mock that returns total garbage, triggering the fallback safe question
class MockGarbageLLMService extends LLMService {
    async generateResponse(sys, prompt) {
        return `Just talking. No JSON here.`;
    }
}

async function runTest() {
    const ss = new SessionService();
    const cs = new CurriculumService();
    const ps = new PromptService();
    const fs = new FeedbackService(ps, new MockGoodLLMService());

    console.log('--- TEST 1: Polluted LLM Output (Text + JSON block) ---');
    const servicePol = new InterviewService(ss, cs, ps, new MockPollutedLLMService(), fs);
    const session1 = ss.createSession('test-pol', { member: { name: 'Test', jobRole: 'Dev' }, signals: {} }, [{ day: 1, title: 'Logging' }]);
    session1.questionCount = 1;
    session1.history = [{ role: 'user', content: 'Ready' }];
    servicePol.evaluationService.evaluateAnswer = async () => ({ classification: 'Correct' });

    const resultPol = await servicePol.handleRequest('test-pol', 'Ready', null);
    console.log('Result:', resultPol.reply);
    if (resultPol.reply === 'How does asynchronous logging work in practice?') {
        console.log('✅ PASS: Polluted output was sanitized to extract only the JSON question.');
    } else {
        console.error('❌ FAIL: Extraction failed.');
        process.exit(1);
    }

    console.log('\n--- TEST 2: Good LLM Output (JSON Parsed) ---');
    const serviceGood = new InterviewService(ss, cs, ps, new MockGoodLLMService(), fs);
    const session2 = ss.createSession('test-good', { member: { name: 'Test', jobRole: 'Dev' }, signals: {} }, [{ day: 1, title: 'Test' }]);
    session2.questionCount = 1;
    session2.history = [{ role: 'user', content: 'Ready' }];
    serviceGood.evaluationService.evaluateAnswer = async () => ({ classification: 'Correct' });

    const resultGood = await serviceGood.handleRequest('test-good', 'Ready', null);
    console.log('Result:', resultGood.reply);
    if (resultGood.reply === 'What trade-offs would you consider?') {
        console.log('✅ PASS: Clean JSON output was properly parsed.');
    } else {
        console.error('❌ FAIL: Clean JSON parsing failed.');
        process.exit(1);
    }

    console.log('\n--- TEST 3: Garbage LLM Output (Safe Fallback) ---');
    const serviceGar = new InterviewService(ss, cs, ps, new MockGarbageLLMService(), fs);
    const session3 = ss.createSession('test-gar', { member: { name: 'Test', jobRole: 'Dev' }, signals: {} }, [{ day: 1, title: 'Test Topic' }]);
    session3.questionCount = 1;
    session3.history = [{ role: 'user', content: 'Ready' }];
    serviceGar.evaluationService.evaluateAnswer = async () => ({ classification: 'Correct', acknowledgmentText: 'Super.' });

    const resultGar = await serviceGar.handleRequest('test-gar', 'Ready', null);
    console.log('Result:', resultGar.reply);
    if (resultGar.reply.includes("Let's explore your understanding")) {
        console.log('✅ PASS: Total garbage triggered safe fallback question.');
    } else {
        console.error('❌ FAIL: Safe fallback failed.');
        process.exit(1);
    }
}

runTest();
