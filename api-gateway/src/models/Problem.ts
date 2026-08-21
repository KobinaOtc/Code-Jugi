import mongoose, { Schema, Document } from 'mongoose';

export interface IProblem extends Document {
  title: string;
  slug: string; // e.g., "two-sum" for SEO-friendly URLs
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string; // Markdown or HTML content
  timeLimitMs: number; // Max execution time (e.g., 2000ms)
  memoryLimitMb: number; // Max memory (e.g., 256MB)
  createdAt: Date;
}

const ProblemSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
  description: { type: String, required: true },
  timeLimitMs: { type: Number, default: 2000 },
  memoryLimitMb: { type: Number, default: 256 },
}, { timestamps: true });

export default mongoose.model<IProblem>('Problem', ProblemSchema);