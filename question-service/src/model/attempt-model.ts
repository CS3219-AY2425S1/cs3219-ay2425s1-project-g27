import mongoose from "mongoose";

const TestCaseResultSchema = new mongoose.Schema(
  {
    testCaseIndex: Number,
    input: String,
    expected: String,
    actual: String,
    pass: Boolean,
    userStdOut: String,
  },
  { _id: false }
);

const CodeRunSchema = new mongoose.Schema(
  {
    code: String,
    language: String,
    output: String,
    testCaseResults: [TestCaseResultSchema],
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Success", "Wrong Answer", "Error"],
      required: true,
    },
  },
  { _id: false }
);

const AttemptSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionModel",
    required: true,
  },
  peerUserName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Attempted", "Completed"],
    default: "Attempted",
  },
  timestamp: { 
    type: Date,
    default: Date.now,
  },
  timeTaken: {
    type: Number, // time in seconds
    default: 0,
    required: true,
  },
  codeContent: {
    type: String,
    required: false, // Optional but stored
  },
  language: {
    type: String,
    required: false, 
  },
  codeRuns: [CodeRunSchema],
});

export default mongoose.model("AttemptModel", AttemptSchema);
