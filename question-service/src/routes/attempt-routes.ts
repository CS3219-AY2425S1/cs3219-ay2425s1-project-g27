// routes/attempt-routes.ts

import express from 'express';
import {
  createAttemptController,
  getAttemptsByUserController,
  deleteLatestAttemptController,
  cleanupInvalidAttemptsForUserController,
} from "../controller/attempt-controller";
import { authenticateJWT, isAdmin } from "../middleware/auth-middleware";
import  AttemptModel  from "../model/attempt-model";

const router = express.Router();

// POST /api/attempts
router.post('/attempts', authenticateJWT, (req, res, next) => {
  next();
}, createAttemptController);

// GET /api/attempts
router.get('/attempts', authenticateJWT, (req, res, next) => {
  next();
}, getAttemptsByUserController);


// DELETE /api/attempts
router.delete('/attempts', authenticateJWT, isAdmin, (req, res, next) => {
    next();
  }, deleteLatestAttemptController);
  


// DELETE /api/attempts/cleanup
router.delete('/attempts/cleanup', authenticateJWT, isAdmin, (req, res, next) => {
    next();
  }, cleanupInvalidAttemptsForUserController);

  
// GET attempts of specific attemptId

router.get('/attempts/:attemptId', authenticateJWT, async (req, res) => {
  const { attemptId } = req.params;
  
  try {
    const attempt = await AttemptModel.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }
    res.status(200).json(attempt);
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});
export default router;
