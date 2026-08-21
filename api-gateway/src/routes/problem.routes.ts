import { Router } from 'express';
import { getProblems, createProblem } from '../controller/problem.controller';

const router = Router();

router.route('/')
  .get(getProblems)
  .post(createProblem);

export default router;