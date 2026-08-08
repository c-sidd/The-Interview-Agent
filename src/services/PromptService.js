const SystemPromptBuilder = require('./promptBuilders/SystemPromptBuilder');
const InterviewPromptBuilder = require('./promptBuilders/InterviewPromptBuilder');
const FollowUpPromptBuilder = require('./promptBuilders/FollowUpPromptBuilder');
const FeedbackPromptBuilder = require('./promptBuilders/FeedbackPromptBuilder');

class PromptService {
  buildSystemPrompt(candidate) {
    return SystemPromptBuilder.build(candidate);
  }

  buildQuestionPrompt(dayNumber, dayTitle, tools, objectives, turnNumber, dialogueHistory, lastMessage) {
    if (parseInt(turnNumber) === 1) {
      return InterviewPromptBuilder.build(dayNumber, dayTitle, tools, objectives, lastMessage);
    } else {
      return FollowUpPromptBuilder.build(dayNumber, dayTitle, dialogueHistory, lastMessage);
    }
  }

  buildFeedbackPrompt(candidate, dialogueHistory) {
    return FeedbackPromptBuilder.build(candidate, dialogueHistory);
  }
}

module.exports = PromptService;
