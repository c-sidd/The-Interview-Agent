const CurriculumService = require('./CurriculumService');
const PromptService = require('./PromptService');
const LLMService = require('./LLMService');

async function runPromptExperiment() {
  console.log("====================================================");
  console.log("🚀 STARTING OFFLINE PROMPT EXPERIMENT & VALIDATION");
  console.log("====================================================\n");

  const curriculumService = new CurriculumService();
  const promptService = new PromptService();
  const llmService = new LLMService();

  // 1. Select a Candidate
  const candidateId = "CAND-001"; // Sarah Johnson (Senior Data Engineer)
  const candidate = curriculumService.getCandidateById(candidateId);
  if (!candidate) {
    console.error(`Candidate ${candidateId} not found.`);
    return;
  }

  console.log(`[Step 1] Loading Candidate: ${candidate.member.name} (${candidate.member.jobRole})`);

  // 2. Select Days
  const targetDays = curriculumService.selectTargetDays(candidate);
  console.log(`[Step 2] Selected Curriculum Days: [${targetDays.join(', ')}]`);

  // 3. Compile System Persona Prompt
  const systemPrompt = promptService.buildSystemPrompt(candidate);
  console.log("\n[Step 3] Compiled System Prompt:");
  console.log("----------------------------------------------------");
  console.log(systemPrompt);
  console.log("----------------------------------------------------\n");

  // 4. Simulate Dialogue Loop (2 Turns for the first Selected Day)
  const firstDay = targetDays[0];
  const dayDetails = curriculumService.getDayDetails(firstDay);
  if (!dayDetails) {
    console.error(`Day details for Day ${firstDay} not found.`);
    return;
  }

  console.log(`[Step 4] Starting Interview Simulation for Day ${firstDay} (${dayDetails.title})`);

  // Turn 1: Initial Question
  console.log("\n-> Turn 1: Initial Question Prompt...");
  const turn1Prompt = promptService.buildQuestionPrompt(
    firstDay,
    dayDetails.title,
    dayDetails.tools,
    dayDetails.objectives,
    1, // Turn 1
    [],
    ""
  );

  console.log("Sending prompt to LLM...");
  const turn1Question = await llmService.generateResponse(systemPrompt, turn1Prompt);
  console.log(`[AI Interviewer]: "${turn1Question}"`);

  // Simulated Candidate Answer
  const simulatedAnswer = "I set up a local Postgres instance and configured Docker. I mapped local directories to storage directories so database states are persisted even if containers reboot.";
  console.log(`[Simulated Candidate]: "${simulatedAnswer}"`);

  // Turn 2: Follow-up Question
  console.log("\n-> Turn 2: Follow-up Question Prompt...");
  const dialogueHistory = [
    { role: 'model', content: turn1Question },
    { role: 'user', content: simulatedAnswer }
  ];

  const turn2Prompt = promptService.buildQuestionPrompt(
    firstDay,
    dayDetails.title,
    dayDetails.tools,
    dayDetails.objectives,
    2, // Turn 2
    dialogueHistory,
    simulatedAnswer
  );

  console.log("Sending prompt to LLM...");
  const turn2Question = await llmService.generateResponse(systemPrompt, turn2Prompt);
  console.log(`[AI Interviewer (Follow-up)]: "${turn2Question}"`);

  // 5. Test Evaluation/Feedback prompt compilation
  console.log("\n[Step 5] Compiling Final Feedback Prompt...");
  const fullHistory = [
    { role: 'model', content: turn1Question },
    { role: 'user', content: simulatedAnswer },
    { role: 'model', content: turn2Question },
    { role: 'user', content: "I used docker volumes to mount the folders." }
  ];

  const feedbackPrompt = promptService.buildFeedbackPrompt(candidate, fullHistory);
  console.log("Sending feedback prompt to LLM...");
  const feedbackResult = await llmService.generateResponse("You are a grader.", feedbackPrompt);
  console.log("\n--- Received Evaluation Report (JSON) ---");
  console.log(feedbackResult);
  console.log("-----------------------------------------");

  try {
    const feedbackObj = JSON.parse(feedbackResult);
    console.log("\n✅ SUCCESS: Final evaluation JSON parsed correctly!");
    console.log(`Summary: ${feedbackObj.summary}`);
  } catch (err) {
    console.error(`\n❌ ERROR: Evaluation is not valid JSON: ${err.message}`);
  }
}

runPromptExperiment();
