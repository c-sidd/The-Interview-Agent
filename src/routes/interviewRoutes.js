const express = require('express');
const router = express.Router();
const InterviewController = require('../controllers/InterviewController');

/**
 * Route handler mapping for POST /api/interview.
 * Instantiates the controller dynamically by retrieving the shared service from app context.
 */
router.post('/interview', (req, res) => {
  const interviewService = req.app.get('interviewService');
  const controller = new InterviewController(interviewService);
  return controller.handleInterviewTurn(req, res);
});

router.get('/candidates', (req, res) => {
  try {
    const curriculumService = req.app.get('curriculumService');
    return res.status(200).json(curriculumService.getCandidates());
  } catch (err) {
    console.error(`[Routes] Failed to load candidates: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/session/:sessionId', (req, res) => {
  try {
    const interviewService = req.app.get('interviewService');
    const controller = new InterviewController(interviewService);
    return controller.getSessionState(req, res);
  } catch (err) {
    console.error(`[Routes] Failed to get session state: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
