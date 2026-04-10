import { Router } from 'express';
import { parseJD } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/parse', parseJD);

export default router;
