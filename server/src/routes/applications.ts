import { Router } from 'express';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getApplications);
router.post('/', createApplication);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;
