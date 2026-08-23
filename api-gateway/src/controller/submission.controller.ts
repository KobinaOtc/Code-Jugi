import { Request, Response } from 'express';
import Submission from '../models/Submission';
import { submissionQueue } from '../services/queue.service';

export const createSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, language, code, userId } = req.body;

    // 1. Basic validation
    if (!problemId || !language || !code || !userId) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    // 2. Write the "ticket" into MongoDB
    const submission = await Submission.create({
      problemId,
      userId,
      language,
      code,
      status: 'PENDING',
    });

    // 3. Drop the ticket into the BullMQ Queue
    // We pass the MongoDB ID so the Worker knows which record to update when it finishes
    await submissionQueue.add('evaluate-code', {
      submissionId: submission._id,
      problemId,
      language,
      code
    });

    // 4. Instantly hand the receipt back to the user
    res.status(201).json({
      success: true,
      data: {
        submissionId: submission._id,
        status: 'PENDING'
      }
    });
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ success: false, message: 'Server error while queuing submission' });
  }
};