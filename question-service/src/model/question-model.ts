import mongoose from "mongoose";

const Schema = mongoose.Schema;

const QuestionModelSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
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

export default mongoose.model("QuestionModel", QuestionModelSchema);