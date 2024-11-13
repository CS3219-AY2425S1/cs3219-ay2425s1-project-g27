import mongoose from "mongoose";

const Schema = mongoose.Schema;

const QuestionModelSchema = new Schema({
    title: {
        type: String,
        required: true,
        // unique: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: [String],
        required: true
    },
    complexity: {
        type: String,
        required: true
    },
});

QuestionModelSchema.index({ title: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model("QuestionModel", QuestionModelSchema);