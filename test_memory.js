/**
 * test_memory.js — Unit tests for MemoryService (Evidence Graph + Adaptive Strategy)
 *
 * Run with:  node test_memory.js
 */

const MemoryService = require('./src/services/MemoryService');

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✅ PASS: ${label}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${label}`);
        failed++;
    }
}

function makeSession() {
    return {
        evidenceGraph: { claims: [], skills: {}, misconceptions: [], contradictions: [] },
        interviewState: { lastStrategy: null, interviewerStatus: null, statusDetail: null }
    };
}

function makeEval(classification, claims = [], misconceptions = [], scores = { accuracy: 3, reasoning: 3, communication: 3, confidence: 3 }) {
    return { classification, scores, reasoningText: 'test', acknowledgmentText: 'ok', claims, misconceptions, suggestedQuestionType: 'curriculum' };
}

const ms = new MemoryService();

// ────────────────────────────────────────────────────────
console.log('\n[TEST 1] Skill score updated after correct answer');
{
    const s = makeSession();
    const ev = makeEval('Correct', [{ claim: 'RAG is great', relatedSkill: 'RAG', status: 'correct' }]);
    ms.processEvaluation(s, ev, 'Q', 'A', 7, 'RAG Overview', 1);
    assert(s.evidenceGraph.skills['RAG'] !== undefined, 'RAG skill created');
    assert(s.evidenceGraph.skills['RAG'].score > 50, 'Score increased above baseline after correct answer');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 2] Skill score decreases after incorrect answer');
{
    const s = makeSession();
    const ev = makeEval('Incorrect', [{ claim: 'SQL always beats vectors', relatedSkill: 'Vector Databases', status: 'incorrect' }]);
    ms.processEvaluation(s, ev, 'Q', 'A', 8, 'Vector Databases', 1);
    assert(s.evidenceGraph.skills['Vector Databases'].score < 50, 'Score decreases below baseline after incorrect answer');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 3] Misconception stored correctly');
{
    const s = makeSession();
    const ev = makeEval('Incorrect', [], [{ concept: 'MCP', misunderstanding: 'Confused MCP with auth', severity: 'high' }]);
    ms.processEvaluation(s, ev, 'Q', 'A', 23, 'MCP', 1);
    assert(s.evidenceGraph.misconceptions.length === 1, 'One misconception recorded');
    assert(s.evidenceGraph.misconceptions[0].severity === 'high', 'Severity stored correctly');
    assert(s.evidenceGraph.misconceptions[0].followUpAsked === false, 'followUpAsked starts false');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 4] Contradiction detected between two claims');
{
    const s = makeSession();
    const ev1 = makeEval('Correct', [{ claim: 'Agents need autonomy', relatedSkill: 'Agents', status: 'correct' }]);
    const ev2 = makeEval('Incorrect', [{ claim: 'Agents should never be autonomous', relatedSkill: 'Agents', status: 'incorrect' }]);
    ms.processEvaluation(s, ev1, 'Q1', 'A1', 22, 'Agents', 1);
    ms.processEvaluation(s, ev2, 'Q2', 'A2', 22, 'Agents', 2);
    assert(s.evidenceGraph.contradictions.length === 1, 'One contradiction detected');
    assert(s.evidenceGraph.contradictions[0].relatedSkill === 'Agents', 'Contradiction linked to correct skill');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 5] Strategy = "deeper" when answer is Correct');
{
    const s = makeSession();
    const ev = makeEval('Correct');
    const strategy = ms.determineStrategy(s.evidenceGraph, ev);
    assert(strategy.type === 'deeper', 'Strategy is deeper after correct answer');
    assert(strategy.interviewerStatus !== null, 'interviewerStatus is set');
}

// ────────────────────────────────────────────────────────
console.log("\n[TEST 6] Strategy = 'diagnostic' when answer is Don't Know");
{
    const s = makeSession();
    const ev = makeEval("Don't Know");
    const strategy = ms.determineStrategy(s.evidenceGraph, ev);
    assert(strategy.type === 'diagnostic', "Strategy is diagnostic after Don't Know");
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 7] Strategy = "contradiction" when open contradiction exists');
{
    const s = makeSession();
    s.evidenceGraph.contradictions.push({
        earlierClaim: 'X', laterClaim: 'Y', relatedSkill: 'RAG', evidence: '...', questionId: 2, addressed: false
    });
    const ev = makeEval('Correct');
    const strategy = ms.determineStrategy(s.evidenceGraph, ev);
    assert(strategy.type === 'contradiction', 'Contradiction takes priority over correct answer');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 8] Strategy = "misconception" (high) over correct classification');
{
    const s = makeSession();
    s.evidenceGraph.misconceptions.push({
        concept: 'Embeddings', misunderstanding: 'Confused with hashing',
        evidence: 'A', severity: 'high', relatedDay: 7, questionId: 1, followUpAsked: false
    });
    const ev = makeEval('Correct');
    const strategy = ms.determineStrategy(s.evidenceGraph, ev);
    assert(strategy.type === 'misconception', 'High misconception overrides correct answer strategy');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 9] markInsightAddressed marks contradiction as addressed');
{
    const s = makeSession();
    const contradiction = { earlierClaim: 'X', laterClaim: 'Y', addressed: false };
    s.evidenceGraph.contradictions.push(contradiction);
    const strategy = { type: 'contradiction', insight: contradiction };
    ms.markInsightAddressed(s.evidenceGraph, strategy);
    assert(contradiction.addressed === true, 'Contradiction marked addressed');
    // Now strategy should fall through to classification-based
    const ev = makeEval('Correct');
    const next = ms.determineStrategy(s.evidenceGraph, ev);
    assert(next.type !== 'contradiction', 'Addressed contradiction no longer triggers contradiction strategy');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 10] Malformed evaluation (no claims array) does not crash');
{
    const s = makeSession();
    const badEval = { classification: 'Partially Correct', scores: { accuracy: 3, reasoning: 3, communication: 3, confidence: 3 }, reasoningText: '', acknowledgmentText: '' };
    // claims and misconceptions are missing — should fall back gracefully
    let threw = false;
    try { ms.processEvaluation(s, badEval, 'Q', 'A', 12, 'Prompt Eng', 1); }
    catch (e) { threw = true; }
    assert(!threw, 'No crash on missing claims/misconceptions');
    assert(s.evidenceGraph.claims.length === 1, 'Fallback claim synthesised');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 11] Skill map returned sorted by score');
{
    const s = makeSession();
    s.evidenceGraph.skills['RAG'] = { skill: 'RAG', score: 80, confidence: 0.8, evidence: [], questionsAssessed: [1] };
    s.evidenceGraph.skills['Agents'] = { skill: 'Agents', score: 60, confidence: 0.5, evidence: [], questionsAssessed: [2] };
    s.evidenceGraph.skills['Vectors'] = { skill: 'Vectors', score: 45, confidence: 0.4, evidence: [], questionsAssessed: [3] };
    const map = ms.getSkillMap(s.evidenceGraph);
    assert(map[0].skill === 'RAG', 'Highest score skill is first');
    assert(map[2].skill === 'Vectors', 'Lowest score skill is last');
}

// ────────────────────────────────────────────────────────
console.log('\n[TEST 12] Duplicate misconception on same concept not re-added');
{
    const s = makeSession();
    const ev = makeEval('Incorrect', [], [{ concept: 'RAG', misunderstanding: 'Wrong', severity: 'medium' }]);
    ms.processEvaluation(s, ev, 'Q1', 'A1', 10, 'RAG', 1);
    ms.processEvaluation(s, ev, 'Q2', 'A2', 10, 'RAG', 2);
    assert(s.evidenceGraph.misconceptions.length === 1, 'Duplicate misconception not stored twice');
}

// ────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed / ${failed} failed out of ${passed + failed} tests.`);
if (failed > 0) process.exit(1);
