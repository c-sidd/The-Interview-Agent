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

  // Helper to update sidebar progress fills and checklists
  function updateSidebarProgress(questionCount, done) {
    const percent = Math.min((questionCount / 8) * 100, 100);
    document.getElementById('sidebar-progress-fill').style.width = `${percent}%`;
    document.getElementById('sidebar-progress-label').textContent = `${questionCount} / 8 Questions`;

    const list = document.getElementById('sidebar-topics-list');
    const items = list.querySelectorAll('li');
    items.forEach((li, idx) => {
      let status = 'upcoming';
      if (done) {
        status = 'completed';
      } else {
        const activeIndex = Math.min(Math.floor(questionCount / 2), 3);
        if (idx < activeIndex) {
          status = 'completed';
        } else if (idx === activeIndex) {
          status = 'active';
        } else {
          status = 'upcoming';
        }
      }
      li.className = status;

      let icon = '•';
      if (status === 'completed') icon = '✓';
      else if (status === 'active') icon = '▶';
      
      const iconSpan = li.querySelector('.status-icon');
      if (iconSpan) iconSpan.textContent = icon;
    });
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

    // Set Sidebar Details
    document.getElementById('sidebar-cand-name').textContent = candidate.member.name;
    document.getElementById('sidebar-cand-role').textContent = candidate.member.jobRole;
    document.getElementById('sidebar-cand-exp').textContent = `${candidate.member.yearsExperience} Years`;
    document.getElementById('sidebar-progress-fill').style.width = '0%';
    document.getElementById('sidebar-progress-label').textContent = '0 / 8 Questions';
    document.getElementById('sidebar-topics-list').innerHTML = '<li class="upcoming"><span class="status-icon">•</span> Loading topics...</li>';

    // Set Sidebar Objective Details
    const isSenior = candidate.member.yearsExperience >= 5;
    document.getElementById('sidebar-obj-difficulty').textContent = isSenior ? 'Senior' : 'Junior';
    document.getElementById('sidebar-obj-role').textContent = candidate.member.jobRole;

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

      // Update Connection Status Badge dynamically
      const statusContainer = document.getElementById('sidebar-connection-status');
      if (data.mockMode) {
        statusContainer.innerHTML = `<span class="status-badge mock">Offline Fallback Mock</span>`;
      } else {
        statusContainer.innerHTML = `<span class="status-badge live">Live Gemini Connected</span>`;
      }

      // Populate Topics List in Sidebar
      if (data.selectedDays) {
        const topicsList = document.getElementById('sidebar-topics-list');
        topicsList.innerHTML = '';
        data.selectedDays.forEach((topic, idx) => {
          const li = document.createElement('li');
          li.className = idx === 0 ? 'active' : 'upcoming';
          li.innerHTML = `<span class="status-icon">${idx === 0 ? '▶' : '•'}</span> Day ${topic.day}: ${topic.title}`;
          topicsList.appendChild(li);
        });
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
        updateSidebarProgress(8, true);
        // Transition to feedback screen after brief delay
        setTimeout(() => showFeedback(data.feedback), 2500);
      } else {
        // Render interviewer next question
        appendMessage('interviewer', data.reply);
        
        // Update header & sidebar details
        if (data.questionCount !== undefined) {
          activeTurnLabel.textContent = `${data.questionCount} / 8`;
          updateSidebarProgress(data.questionCount, false);
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
      <span style="margin-right: 8px; font-weight: 500; color: var(--text-secondary); font-size: 0.85rem;">AI Interviewer is thinking...</span>
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

    // Fill Scores
    const scores = feedback.scores || { accuracy: 3.0, reasoning: 3.0, communication: 3.0, confidence: 3.0 };
    document.getElementById('score-accuracy').textContent = Number(scores.accuracy).toFixed(1);
    document.getElementById('score-reasoning').textContent = Number(scores.reasoning).toFixed(1);
    document.getElementById('score-communication').textContent = Number(scores.communication).toFixed(1);
    document.getElementById('score-confidence').textContent = Number(scores.confidence).toFixed(1);

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
