import { Router } from 'express';
import { requestMatch } from '../controller/match-controller';

const router = Router();

router.post('/match', requestMatch);

export default router;
