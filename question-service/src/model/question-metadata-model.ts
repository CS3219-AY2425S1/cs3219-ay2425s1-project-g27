import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TemplateCodeSchema = new Schema(
  {
    python: { type: String },
    java: { type: String },
    javascript: { type: String },
    c: { type: String },
    cpp: { type: String },
  },
  { _id: false }
);

const TestCaseSchema = new Schema(
  {
    input: { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const QuestionMetadataSchema = new Schema({
  questionTitle: {
    type: String,
    required: true,
  },
  templateCode: {
    type: TemplateCodeSchema,
    required: true,
  },
  testCases: {
    type: [TestCaseSchema],
    required: true,
  },
});

QuestionMetadataSchema.index(
  { questionTitle: 1, "testCases.input": 1 },
  { unique: true }
);

export default mongoose.model("QuestionMetadataModel", QuestionMetadataSchema);
