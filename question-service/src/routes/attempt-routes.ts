import express from 'express';
import {
  createAttemptController,
  getAttemptsByUserController,
  deleteLatestAttemptController,
  cleanupInvalidAttemptsForUserController,
  getAttemptByIdController,
} from "../controller/attempt-controller";
import { authenticateJWT, isAdmin } from "../middleware/auth-middleware";
import  AttemptModel  from "../model/attempt-model";

const router = express.Router();

// POST /api/attempts
router.post('/attempts', authenticateJWT, createAttemptController);

// GET /api/attempts
router.get('/attempts', authenticateJWT, getAttemptsByUserController);

// GET attempts of specific attemptId
router.get('/attempts/:attemptId', authenticateJWT, getAttemptByIdController);

// DELETE /api/attempts
router.delete('/attempts', authenticateJWT, isAdmin, deleteLatestAttemptController);

// DELETE /api/attempts/cleanup
router.delete('/attempts/cleanup', authenticateJWT, isAdmin, cleanupInvalidAttemptsForUserController);



export default router;