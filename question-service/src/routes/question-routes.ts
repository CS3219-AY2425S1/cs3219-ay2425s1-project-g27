import { Router } from 'express';
import {
  createQuestion,
  fetchAllQuestions,
  fetchQuestionById,
  modifyQuestionById,
  removeQuestionById,
  fetchQuestionByTitle,
  fetchAllTopics,
  fetchRandomQuestionByTopic,
  fetchQuestionMetadata
} from '../controller/question-controller';  // Import your controller methods
import { authenticateJWT, isAdmin } from '../middleware/auth-middleware';  // Import the middleware

const router = Router();

// Route to create a new question
router.post('/questions', authenticateJWT, isAdmin, createQuestion);

// Route to get all questions
router.get('/questions', fetchAllQuestions);

// Route to get all topics for the questions
router.get('/questions/topics', fetchAllTopics);

// Route to get a specific question by ID
router.get('/questions/:id', fetchQuestionById);

// Route to get a specific question by title
router.get('/questions/title/:title', fetchQuestionByTitle);  // New route

// Route to update a specific question by ID
router.put('/questions/:id', authenticateJWT, isAdmin, modifyQuestionById);

// Route to delete a specific question by ID
router.delete('/questions/:id', authenticateJWT, isAdmin, removeQuestionById);

router.get('/question', fetchRandomQuestionByTopic)

router.get('/question-metadata', fetchQuestionMetadata)

export default router;
