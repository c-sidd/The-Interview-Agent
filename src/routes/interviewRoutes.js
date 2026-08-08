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

module.exports = router;
