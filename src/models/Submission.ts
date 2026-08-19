import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  userId: string; // Could map to Clerk/Auth0 or a custom User model
  problemId: mongoose.Types.ObjectId;
  language: 'javascript' | 'python' | 'cpp';
  code: string;
  status: 'PENDING' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
  executionTimeMs?: number;
  memoryUsedMb?: number;
  errorMessage?: string; // Captures stderr if the code crashes
  createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR'], 
    default: 'PENDING' 
  },
  executionTimeMs: { type: Number },
  memoryUsedMb: { type: Number },
  errorMessage: { type: String },
}, { timestamps: true });

// Compound index to quickly find all submissions by a user for a specific problem
SubmissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);