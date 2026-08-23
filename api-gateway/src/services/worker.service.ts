import { Emitter } from '@socket.io/redis-emitter';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import Submission from '../models/Submission';
import TestCase from '../models/TestCase';
import { executeCode } from './execution.service';

// 1. Connect to Redis (the ticket rail)
const redisConnection = new IORedis(process.env.REDIS_URI || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Create the broadcaster so the Worker can talk to Socket.io via Redis
const ioEmitter = new Emitter(redisConnection);

export const initWorker = () => {
  // 2. Create the Worker that listens to the 'code-submissions' queue
  const worker = new Worker(
    'code-submissions',
    async (job: Job) => {
      const { submissionId, problemId, code, language } = job.data;
      console.log(`[Worker] Picked up submission: ${submissionId}`);

      try {
        // 3. Tell the database we are working on it
        await Submission.findByIdAndUpdate(submissionId, { status: 'RUNNING' });

        // 4. Fetch the hidden test case for this specific problem
        const testCase = await TestCase.findOne({ problemId, isHidden: true });
        
        if (!testCase) {
            throw new Error('Test case not found in database');
        }

        // 5. Send the code to the Secure Docker Kitchen!
        const result = await executeCode(code, testCase.input);

        // 6. Grade the assignment
        let finalStatus = 'ACCEPTED';
        if (result.error) {
          finalStatus = 'RUNTIME_ERROR';
        } else if (result.stdout.trim() !== testCase.expectedOutput.trim()) {
          finalStatus = 'WRONG_ANSWER';
        }

        // 7. Save the final grade to the database
        await Submission.findByIdAndUpdate(submissionId, {
          status: finalStatus,
          executionTimeMs: result.runtime,
          errorMessage: result.error || result.stderr,
        });

        console.log(`[Worker] Finished submission: ${submissionId} | Verdict: ${finalStatus}`);

        // 8. 📢 Broadcast the result back to the specific user's browser room!
        ioEmitter.to(submissionId).emit('submission_update', {
          status: finalStatus,
          executionTimeMs: result.runtime,
          errorMessage: result.error || result.stderr,
        });
        
        // NOTE: In Step 3.4, we will add the walkie-talkie code here to alert the user!

      } catch (error) {
        console.error(`[Worker] Job crashed:`, error);
        await Submission.findByIdAndUpdate(submissionId, { 
            status: 'RUNTIME_ERROR', 
            errorMessage: 'Internal system error' 
        });
      }
    },
    { connection: redisConnection }
  );

  // Listen for background errors
  worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error ${err.message}`);
  });

  console.log('Worker Node is active and listening for jobs...');
};