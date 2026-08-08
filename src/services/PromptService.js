const SystemPromptBuilder = require('./promptBuilders/SystemPromptBuilder');
const InterviewPromptBuilder = require('./promptBuilders/InterviewPromptBuilder');
const FollowUpPromptBuilder = require('./promptBuilders/FollowUpPromptBuilder');
const FeedbackPromptBuilder = require('./promptBuilders/FeedbackPromptBuilder');
const AdaptiveQuestionBuilder = require('./promptBuilders/AdaptiveQuestionBuilder');

class PromptService {
  buildSystemPrompt(candidate) {
    return SystemPromptBuilder.build(candidate);
  }

  /**
   * Builds the question prompt for turn N on the current day.
   * turnNumber === 1  → initial question (InterviewPromptBuilder)
   * turnNumber === 2  → follow-up; uses AdaptiveQuestionBuilder when strategy is set,
   *                     falls back to FollowUpPromptBuilder for curriculum-only turns.
   *
   * @param {number}   dayNumber
   * @param {string}   dayTitle
   * @param {string[]} tools
   * @param {string[]} objectives
   * @param {number}   turnNumber
   * @param {Array}    dialogueHistory
   * @param {string}   lastMessage
   * @param {Object}   evaluation        – extended evaluation result from EvaluationService
   * @param {Object}   strategy          – strategy object from MemoryService (optional)
   * @param {Object}   candidate         - candidate configuration object
   * @param {string}   difficulty        - 'beginner' | 'intermediate' | 'advanced' | 'senior'
   */
  buildQuestionPrompt(dayNumber, dayTitle, tools, objectives, turnNumber, dialogueHistory, lastMessage, evaluation, strategy, candidate, difficulty) {
    if (parseInt(turnNumber) === 1) {
      const transitionAck = evaluation ? evaluation.acknowledgmentText : '';
      return InterviewPromptBuilder.build(dayNumber, dayTitle, tools, objectives, transitionAck, candidate, difficulty);
    }

    // Follow-up turn: use adaptive builder whenever a meaningful strategy exists
    const strategyType = strategy ? strategy.type : 'default';
    if (strategyType && strategyType !== 'curriculum') {
      return AdaptiveQuestionBuilder.build(
        dayNumber, dayTitle, tools, objectives,
        dialogueHistory, lastMessage, evaluation, strategy, candidate, difficulty
      );
    }

    // Fall back to original follow-up builder for pure curriculum coverage
    return FollowUpPromptBuilder.build(dayNumber, dayTitle, dialogueHistory, lastMessage, evaluation, candidate, difficulty);
  }

  /**
   * Builds the final feedback prompt, optionally enriched with the evidence graph.
   * @param {Object} evidenceGraph – session.evidenceGraph (optional)
   */
  buildFeedbackPrompt(candidate, dialogueHistory, evaluations, evidenceGraph) {
    return FeedbackPromptBuilder.build(candidate, dialogueHistory, evaluations, evidenceGraph);
  }
}

module.exports = PromptService;
