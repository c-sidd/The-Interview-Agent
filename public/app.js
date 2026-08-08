// ==============================================================================
// AI Interview Agent — Client Side Controller (app.js)
// ==============================================================================

let activeSessionId = null;
let activeCandidate = null;
let currentDayTitle = "Initialization";

document.addEventListener('DOMContentLoaded', () => {
  // Views
  const selectorView = document.getElementById('selector-view');
  const chatView = document.getElementById('chat-view');
  const feedbackView = document.getElementById('feedback-view');

  // Containers
  const candidatesGrid = document.getElementById('candidates-grid');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatForm = document.getElementById('chat-form');
  const sendBtn = document.getElementById('send-btn');

  // Headers / Badges
  const activeNameLabel = document.getElementById('active-candidate-name');
  const activeRoleLabel = document.getElementById('active-candidate-role');
  const activeTopicLabel = document.getElementById('active-topic-day');
  const activeTurnLabel = document.getElementById('active-turn-count');

  // Feedback details
  const feedbackSummary = document.getElementById('feedback-summary');
  const feedbackStrengths = document.getElementById('feedback-strengths');
  const feedbackGaps = document.getElementById('feedback-gaps');
  const feedbackNext = document.getElementById('feedback-next');

  // Buttons
  const restartBtn = document.getElementById('restart-btn');

  // 1. Fetch and render cohort candidates
  async function loadCandidates() {
    try {
      const response = await fetch('/api/candidates');
      if (!response.ok) throw new Error("Failed to load candidates lists.");
      const candidates = await response.ok ? await response.json() : [];

      candidatesGrid.innerHTML = '';
      
      if (candidates.length === 0) {
        candidatesGrid.innerHTML = '<div class="loading-spinner">No candidates found in candidates.json</div>';
        return;
      }

      candidates.forEach(c => {
        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.innerHTML = `
          <div class="candidate-name">${c.member.name}</div>
          <div class="candidate-role">${c.member.jobRole}</div>
          <div class="candidate-stats">
            <div class="stat-item">
              <span class="stat-label">Experience</span>
              <span class="stat-val">${c.member.yearsExperience} Years</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Missions</span>
              <span class="stat-val">${c.signals.missionsCompleted} Done</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => startInterview(c));
        candidatesGrid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      candidatesGrid.innerHTML = `<div class="loading-spinner" style="color:var(--error);">Error loading candidates: ${err.message}</div>`;
    }
  }

  // 2. Start Interview (Initialize Session Turn 0)
  async function startInterview(candidate) {
    activeCandidate = candidate;
    activeSessionId = 'session-' + Math.random().toString(36).substring(2, 9);
    
    // Set Header Info
    activeNameLabel.textContent = candidate.member.name;
    activeRoleLabel.textContent = candidate.member.jobRole;
    activeTopicLabel.textContent = "Initialization";
    activeTurnLabel.textContent = "0 / 8";

    // Transition view
    selectorView.classList.remove('active');
    chatView.classList.add('active');

    // Add loading indicator
    showTypingIndicator();

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          candidate: candidate
        })
      });

      const data = await res.json();
      removeTypingIndicator();

      if (data.error) {
        appendMessage('interviewer', `Error starting session: ${data.error}`);
        return;
      }

      // Append Welcome Message
      appendMessage('interviewer', data.reply);
      appendMessage('interviewer', "System: Please type 'Ready' or enter a greeting to receive your first curriculum question.");

    } catch (err) {
      removeTypingIndicator();
      appendMessage('interviewer', `Connection error: ${err.message}. Please restart.`);
    }
  }

  // 3. Handle conversation turn posts
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Append candidate message bubble
    appendMessage('candidate', text);
    chatInput.value = '';

    // Show typing bubble
    showTypingIndicator();

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: text
        })
      });

      const data = await res.json();
      removeTypingIndicator();

      if (data.error) {
        appendMessage('interviewer', `Error: ${data.error}`);
        return;
      }

      if (data.done) {
        // Show completion message
        appendMessage('interviewer', data.reply);
        // Transition to feedback screen after brief delay
        setTimeout(() => showFeedback(data.feedback), 2500);
      } else {
        // Render interviewer next question
        appendMessage('interviewer', data.reply);
        
        // Update header details
        if (data.questionCount !== undefined) {
          activeTurnLabel.textContent = `${data.questionCount} / 8`;
        }
        if (data.activeDay !== undefined && data.activeDayTitle !== undefined) {
          activeTopicLabel.textContent = `Day ${data.activeDay} - ${data.activeDayTitle}`;
        }
      }

    } catch (err) {
      removeTypingIndicator();
      appendMessage('interviewer', `Network issue: ${err.message}. Please try again.`);
    }
  });

  // Helper: Append a message bubble to list
  function appendMessage(role, text) {
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${role}`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Helper: Show typing indicator
  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator-bubble';
    indicator.className = 'msg-bubble interviewer typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Disable inputs
    chatInput.disabled = true;
    sendBtn.disabled = true;
  }

  // Helper: Remove typing indicator
  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator-bubble');
    if (indicator) indicator.remove();
    
    // Re-enable inputs
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }

  // 4. Render Final Feedback Card Dashboard
  function showFeedback(feedback) {
    chatView.classList.remove('active');
    feedbackView.classList.add('active');

    // Fill Summary
    feedbackSummary.textContent = feedback.summary;

    // Fill Strengths
    feedbackStrengths.innerHTML = '';
    feedback.strengths.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      feedbackStrengths.appendChild(li);
    });

    // Fill Gaps
    feedbackGaps.innerHTML = '';
    feedback.gaps.forEach(g => {
      const li = document.createElement('li');
      li.textContent = g;
      feedbackGaps.appendChild(li);
    });

    // Fill Next Steps
    feedbackNext.innerHTML = '';
    feedback.next.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n;
      feedbackNext.appendChild(li);
    });
  }

  // 5. Restart Platform
  restartBtn.addEventListener('click', () => {
    feedbackView.classList.remove('active');
    selectorView.classList.add('active');
    chatMessages.innerHTML = '';
    activeSessionId = null;
    activeCandidate = null;
    loadCandidates();
  });

  // Initial Boot
  loadCandidates();
});
