import mongoose, { Schema, Document } from 'mongoose';

interface ITestCase extends Document {
  problemId: mongoose.Types.ObjectId;
  input: string; // The raw string passed to standard input (stdin)
  expectedOutput: string; // The expected standard output (stdout)
  isHidden: boolean; // True for the actual evaluation, false for UI examples
}

const TestCaseSchema: Schema = new Schema({
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: true },
});

export default mongoose.model<ITestCase>('TestCase', TestCaseSchema);