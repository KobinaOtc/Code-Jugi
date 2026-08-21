import { Request, Response } from 'express';
import Problem from '../models/Problem';

// @desc    Get all problems
// @route   GET /api/v1/problems
export const getProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    // We exclude the description to keep the payload light for list views
    const problems = await Problem.find().select('-description');
    res.status(200).json({ success: true, count: problems.length, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new problem
// @route   POST /api/v1/problems
export const createProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data payload' });
  }
};