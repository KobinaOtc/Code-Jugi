import { Router } from 'express';
import { createSubmission } from '../controller/submission.controller';

const router = Router();

// Maps POST /api/v1/submissions to our controller
router.route('/').post(createSubmission);

export default router;