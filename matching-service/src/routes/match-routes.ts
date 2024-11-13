import { Router } from 'express';
import { requestMatch, cancelMatch } from '../controller/match-controller';

const router = Router();

router.post('/matching/match', requestMatch);
router.post('/matching/cancel', cancelMatch);

export default router;
