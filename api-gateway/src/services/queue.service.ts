import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// 1. Create a dedicated Redis connection for BullMQ
// BullMQ requires the maxRetriesPerRequest option to be null
const redisConnection = new IORedis(process.env.REDIS_URI || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, 
});

// 2. Initialize the Queue
// We name this specific queue 'code-submissions'
export const submissionQueue = new Queue('code-submissions', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // If a Docker container crashes unexpectedly, retry up to 2 more times
    backoff: {
      type: 'exponential',
      delay: 1000, // Wait 1s, then 2s, then 4s between retries
    },
    removeOnComplete: true, // Automatically delete the job from Redis once finished to save RAM
    removeOnFail: false, // Keep failed jobs so we can inspect what went wrong
  },
});

console.log('BullMQ Submission Queue initialized');