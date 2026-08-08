// ==============================================================================
// AI Interview Agent — Client Side Controller (app.js)
// ==============================================================================

let activeInterviewId = null;
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
  const backToCandidatesBtn = document.getElementById('back-to-candidates-btn');

  async function restoreSession(autoResume = true) {
    const savedSessionId = localStorage.getItem('activeInterviewId');
    if (!savedSessionId) {
      if (autoResume) return loadCandidates();
      return null;
    }

    try {
      const res = await fetch(`/api/session/${savedSessionId}`);
      if (!res.ok) {
        localStorage.removeItem('activeInterviewId');
        if (autoResume) return loadCandidates();
        return null;
      }

      const data = await res.json();

      if (!autoResume) {
        return data; // just return the data for loadCandidates
      }
      activeInterviewId = data.interviewId || data.sessionId; // backwards compatibility reading if needed
      activeCandidate = data.candidate;

      if (data.done) {
        showFeedback(data.feedback);
        return;
      }

      // Re-hydrate UI
      activeNameLabel.textContent = activeCandidate.member.name;
      activeRoleLabel.textContent = activeCandidate.member.jobRole;
      const isSenior = activeCandidate.member.yearsExperience >= 5;
      document.getElementById('sidebar-obj-difficulty').textContent = isSenior ? 'Senior' : 'Junior';
      document.getElementById('sidebar-obj-role').textContent = activeCandidate.member.jobRole;
      document.getElementById('sidebar-cand-name').textContent = activeCandidate.member.name;
      document.getElementById('sidebar-cand-role').textContent = activeCandidate.member.jobRole;
      document.getElementById('sidebar-cand-exp').textContent = `${activeCandidate.member.yearsExperience} Years`;

      activeTurnLabel.textContent = `Question ${data.questionCount || 1} of 8`;
      if (data.activeDay && data.activeDayTitle) {
        activeTopicLabel.textContent = `Day ${data.activeDay} - ${data.activeDayTitle}`;
      }
      document.getElementById('active-attempts-count').textContent = data.attempts || "0";
      document.getElementById('active-followups-count').textContent = data.followUps || "0";

      // Render topics
      if (data.selectedDays) {
        const topicsList = document.getElementById('sidebar-topics-list');
        topicsList.innerHTML = '';
        data.selectedDays.forEach((topic) => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="status-icon">•</span> Day ${topic.day}: ${topic.title}`;
          topicsList.appendChild(li);
        });
      }

      updateSidebarProgress(data.questionCount || 0, false);
      if (data.skillMap) updateSkillMap(data.skillMap);
      if (data.interviewerStatus) updateInterviewerStatus(data.interviewerStatus, data.statusDetail);

      const diffEl = document.getElementById('sidebar-obj-current-diff');
      if (diffEl && data.difficulty) diffEl.textContent = data.difficulty;

      // Render chat history
      chatMessages.innerHTML = '';
      if (data.history) {
        data.history.forEach(msg => {
          appendMessage(msg.role === 'user' ? 'candidate' : 'interviewer', msg.content);
        });
      }

      selectorView.classList.remove('active');
      chatView.classList.add('active');

    } catch (err) {
      console.warn("Restore failed:", err);
      localStorage.removeItem('activeInterviewId');
      if (autoResume) loadCandidates();
      return null;
    }
  }

  // 1. Fetch and render cohort candidates
  async function loadCandidates() {
    try {
      const existingSession = await restoreSession(false);

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

        if (existingSession && existingSession.candidate.member.name === c.member.name) {
          card.innerHTML += `
             <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
               <div style="font-size: 13px; margin-bottom: 8px; color: var(--text-muted); font-weight: 500;">
                 Progress: ${existingSession.questionCount || 0} / 8 questions
               </div>
               <button class="resume-btn" style="width: 100%; margin-bottom: 8px; padding: 8px; background: var(--accent); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                 Resume Interview
               </button>
               <button class="reset-btn" style="width: 100%; padding: 8px; background: transparent; color: var(--text-muted); border: 1px solid var(--border); border-radius: 4px; cursor: pointer;">
                 Start New Interview
               </button>
             </div>
           `;

          const resumeBtn = card.querySelector('.resume-btn');
          const resetBtn = card.querySelector('.reset-btn');

          resumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            restoreSession(true); // Fire auto-restore
          });

          resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            localStorage.removeItem('activeInterviewId');
            startInterview(c);
          });
        } else {
          card.addEventListener('click', () => startInterview(c));
        }

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
        const activeIndex = questionCount - 1;
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
    activeInterviewId = 'interview-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('activeInterviewId', activeInterviewId);

    // Set Header Info
    activeNameLabel.textContent = candidate.member.name;
    activeRoleLabel.textContent = candidate.member.jobRole;
    activeTopicLabel.textContent = "Initialization";
    activeTurnLabel.textContent = "Question 1 of 8";
    document.getElementById('active-attempts-count').textContent = "0";
    document.getElementById('active-followups-count').textContent = "0";

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

    const diffEl = document.getElementById('sidebar-obj-current-diff');
    if (diffEl) diffEl.textContent = 'Intermediate';

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
          interviewId: activeInterviewId,
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
        statusContainer.innerHTML = `<span class="status-badge mock">⚠️ Fallback Mode Active</span>`;
      } else {
        statusContainer.innerHTML = `<span class="status-badge live">🟢 Gemini Connected</span>`;
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
          interviewId: activeInterviewId,
          message: text
        })
      });

      const data = await res.json();
      removeTypingIndicator();

      if (data.error) {
        appendMessage('interviewer', `Error: ${data.error}`);
        return;
      }

      // Update Connection Status Badge dynamically
      const statusContainer = document.getElementById('sidebar-connection-status');
      if (data.mockMode) {
        statusContainer.innerHTML = `<span class="status-badge mock">⚠️ Fallback Mode Active</span>`;
      } else {
        statusContainer.innerHTML = `<span class="status-badge live">🟢 AI Connected</span>`;
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
          activeTurnLabel.textContent = `Question ${data.questionCount} of 8`;
          updateSidebarProgress(data.questionCount, false);
        }
        if (data.attempts !== undefined) {
          document.getElementById('active-attempts-count').textContent = data.attempts;
        }
        if (data.followUps !== undefined) {
          document.getElementById('active-followups-count').textContent = data.followUps;
        }
        if (data.activeDay !== undefined && data.activeDayTitle !== undefined) {
          activeTopicLabel.textContent = `Day ${data.activeDay} - ${data.activeDayTitle}`;
        }
        // Update interviewer status label
        if (data.interviewerStatus) {
          updateInterviewerStatus(data.interviewerStatus, data.statusDetail);
        }
        // Update live skill map
        if (data.skillMap && data.skillMap.length > 0) {
          updateSkillMap(data.skillMap);
        }

        const diffEl = document.getElementById('sidebar-obj-current-diff');
        if (diffEl && data.difficulty) diffEl.textContent = data.difficulty;

        removeTypingIndicator();
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

  // Helper: Render the interviewer status indicator in the sidebar
  function updateInterviewerStatus(label, detail) {
    const section = document.getElementById('interviewer-status-section');
    const labelEl = document.getElementById('interviewer-status-label');
    const detailEl = document.getElementById('interviewer-status-detail');
    if (!section || !labelEl) return;
    labelEl.textContent = label || '';
    detailEl.textContent = detail || '';
    section.style.display = label ? 'block' : 'none';
  }

  // Helper: Render animated skill score bars in the sidebar
  function updateSkillMap(skillMap) {
    const section = document.getElementById('skill-map-section');
    const barsEl = document.getElementById('skill-map-bars');
    if (!section || !barsEl) return;
    section.style.display = 'block';
    barsEl.innerHTML = skillMap.map(s => {
      const pct = Math.round(s.score);
      const rating = pct >= 75 ? 'Strong' : (pct >= 50 ? 'Intermediate' : 'Weak');
      const blocksCount = Math.min(10, Math.max(0, Math.round(pct / 10)));
      const blocksStr = '█'.repeat(blocksCount) + '░'.repeat(10 - blocksCount);
      const color = pct >= 75 ? 'var(--accent-success)'
        : pct >= 50 ? 'var(--accent-glow)'
          : 'var(--accent-warn)';
      return `
        <div class="skill-row">
          <div class="skill-row-header">
            <span class="skill-name">${s.skill}</span>
            <span class="skill-score" style="font-family: monospace; font-size: 0.85rem; letter-spacing: 1px;">
              ${blocksStr} ${pct}% <span style="color: ${color}; font-weight: bold;">${rating}</span>
            </span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width:${pct}%; background:${color};"></div>
          </div>
        </div>`;
    }).join('');
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

  // 5. Reset to Selector (shared helper used by both back button and restart button)
  function resetToSelector(clearSession = false) {
    if (clearSession) {
      localStorage.removeItem('activeInterviewId');
      activeInterviewId = null;
    }
    // Clear chat UI
    chatMessages.innerHTML = '';
    activeCandidate = null;
    currentDayTitle = "Initialization";

    // Reset header labels to defaults
    activeNameLabel.textContent = 'Candidate Name';
    activeRoleLabel.textContent = 'Senior Developer';
    activeTopicLabel.textContent = 'Day 1 - Setup';
    activeTurnLabel.textContent = 'Question 1 of 8';
    document.getElementById('active-attempts-count').textContent = '0';
    document.getElementById('active-followups-count').textContent = '0';

    // Reset sidebar
    document.getElementById('sidebar-progress-fill').style.width = '0%';
    document.getElementById('sidebar-progress-label').textContent = '0 / 8 Questions';
    document.getElementById('sidebar-topics-list').innerHTML =
      '<li class="upcoming"><span class="status-icon">•</span> Loading topics...</li>';
    document.getElementById('sidebar-connection-status').innerHTML =
      '<span class="status-badge mock">Offline Fallback Mock</span>';

    // Re-enable input (in case user navigates back mid-typing/loading)
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.value = '';

    // Switch views
    chatView.classList.remove('active');
    feedbackView.classList.remove('active');
    selectorView.classList.add('active');

    // Refresh candidate grid
    loadCandidates();
  }

  // Logo acts as Home button (does NOT clear session state!)
  const logoBtn = document.querySelector('.logo');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => resetToSelector(false));
  }

  // Back button in chat header (does NOT clear the active session ID!)
  backToCandidatesBtn.addEventListener('click', () => resetToSelector(false));

  // Restart button in feedback view (DOES clear the active session ID to start fresh next time)
  restartBtn.addEventListener('click', () => {
    localStorage.removeItem('activeInterviewId');
    resetToSelector(true);
  });

  // Initial Boot
  restoreSession(true);
});
