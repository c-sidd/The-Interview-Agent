const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const CurriculumService = require('./src/services/CurriculumService');
const SessionService = require('./src/services/SessionService');
const PromptService = require('./src/services/PromptService');
const LLMService = require('./src/services/LLMService');
const FeedbackService = require('./src/services/FeedbackService');
const InterviewService = require('./src/services/InterviewService');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize core services
const curriculumService = new CurriculumService();
const sessionService = new SessionService();
const promptService = new PromptService();
const llmService = new LLMService();
const feedbackService = new FeedbackService(promptService, llmService);
const interviewService = new InterviewService(
  sessionService,
  curriculumService,
  promptService,
  llmService,
  feedbackService
);

// Share instances with the router layer
app.set('interviewService', interviewService);
app.set('curriculumService', curriculumService);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import and mount routes (to be implemented in Milestone 19)
// const interviewRoutes = require('./src/routes/interviewRoutes');
// app.use('/api', interviewRoutes);

// Start the Express listener
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AI Interview Agent boot completed.`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`⚙️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});

module.exports = { app, server };
