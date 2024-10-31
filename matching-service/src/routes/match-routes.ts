import { Router } from 'express';
import { requestMatch, cancelMatch } from '../controller/match-controller';

const router = Router();

router.post('/match', requestMatch);
router.post('/cancel', cancelMatch);

export default router;
