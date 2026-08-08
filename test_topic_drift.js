/**
 * test_topic_drift.js 
 * Tests that the adaptive builder correctly injects explicitly extracted candidate claims
 * into the follow-up prompt, firmly anchoring the LLM and preventing syllabus/topic drift.
 */

const AdaptiveQuestionBuilder = require('./src/services/promptBuilders/AdaptiveQuestionBuilder');

function runTest() {
    console.log('--- TEST 1: Topic Drift Prevention in Adaptive Questioning ---');

    // Simulate an evaluation that successfully pulled out candidate's exact claims
    const evaluation = {
        classification: 'Correct',
        acknowledgmentText: 'Excellent explanation of structured logging.',
        claims: [
            { claim: 'I use correlation IDs and asynchronous logging.' }
        ]
    };

    // The MemoryService would inject these claims into the strategy insight
    const strategy = {
        type: 'deeper',
        insight: {
            recentClaims: evaluation.claims
        }
    };

    const prompt = AdaptiveQuestionBuilder.build(
        3,
        'Prompt Engineering', // Unrelated curriculum topic
        ['LangChain'],
        ['Understand Chain of Thought'],
        [{ role: 'user', content: 'I use correlation IDs and asynchronous logging.' }],
        'I use correlation IDs and asynchronous logging.',
        evaluation,
        strategy
    );

    // Assert that the generated prompt contains the explicit evidence block
    const hasEvidenceBlock = prompt.includes('Evidence extracted from their answer:');
    const hasClaimText = prompt.includes('- Candidate claimed: "I use correlation IDs and asynchronous logging."');
    const hasConstraint = prompt.includes('Do NOT jump to an unrelated topic from the syllabus');

    if (hasEvidenceBlock && hasClaimText && hasConstraint) {
        console.log('✅ PASS: The adaptive prompt successfully bound the candidate\'s claims into the directive, preventing topic drift.');
        process.exit(0);
    } else {
        console.error('❌ FAIL: The adaptive prompt did not properly anchor the candidate\'s claims.');
        console.log('Generated Prompt was:\n', prompt);
        process.exit(1);
    }
}

runTest();
