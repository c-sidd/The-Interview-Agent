const SystemPromptBuilder = require('./promptBuilders/SystemPromptBuilder');
const InterviewPromptBuilder = require('./promptBuilders/InterviewPromptBuilder');
const FollowUpPromptBuilder = require('./promptBuilders/FollowUpPromptBuilder');
const FeedbackPromptBuilder = require('./promptBuilders/FeedbackPromptBuilder');

class PromptService {
  buildSystemPrompt(candidate) {
    return SystemPromptBuilder.build(candidate);
  }

  buildQuestionPrompt(dayNumber, dayTitle, tools, objectives, turnNumber, dialogueHistory, lastMessage, evaluation) {
    if (parseInt(turnNumber) === 1) {
      const transitionAck = evaluation ? evaluation.acknowledgmentText : "";
      return InterviewPromptBuilder.build(dayNumber, dayTitle, tools, objectives, transitionAck);
    } else {
      return FollowUpPromptBuilder.build(dayNumber, dayTitle, dialogueHistory, lastMessage, evaluation);
    }
  }

  buildFeedbackPrompt(candidate, dialogueHistory, evaluations) {
    return FeedbackPromptBuilder.build(candidate, dialogueHistory, evaluations);
  }
}

module.exports = PromptService;
