import questionModel from "../model/question-model";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
    let mongoUri = process.env.ENV == "PROD"
        ? process.env.DB_CLOUD_URI
        : process.env.DB_LOCAL_URI;
    
    await connect(mongoUri || "");
}

export async function saveQuestion(question: any) {
    return await questionModel.create(question);
}

export async function getQuestions(sort: any, order: string, pageNumber: number, limitNumber: number, filter: any,) {
    let sortOption: any = {};
    sortOption[sort] = order === 'asc' ? 1 : -1;
    let questions: any = null; 

    if (sort === 'complexity') {
        // Sorting by custom complexity levels using the predefined mapping
        questions = questionModel.aggregate([
            { $match: filter }, // Apply the filter here
            {
                $addFields: {
                    complexityValue: {
                    $switch: {
                        branches: [
                        { case: { $eq: ['$complexity', 'Easy'] }, then: 1 },
                        { case: { $eq: ['$complexity', 'Medium'] }, then: 2 },
                        { case: { $eq: ['$complexity', 'Hard'] }, then: 3 }
                        ],
                        default: 4
                    }
                    }
                }
            },

        { $sort: { complexityValue: order === 'asc' ? 1 : -1 } }
      ]).skip((pageNumber - 1) * limitNumber)  
      .limit(limitNumber)

      } else {
          sortOption[sort] = order === 'asc' ? 1 : -1;
          return await questionModel
          .find(filter)
          .sort(sortOption)
          .skip((pageNumber - 1) * limitNumber)  
          .limit(limitNumber)
      }

    return questions; 
}

export async function getTotalQuestions(filter: any) {
    return await questionModel.countDocuments(filter);
}

export async function getQuestionById(id: string) {
    return await questionModel.findById(id);
}

export async function getQuestionByTitle(title: string) {
    return await questionModel.findOne({ title: { $regex: new RegExp('^' + title + '$', 'i') } }).exec();
}

export async function updateQuestionById(id: string, title: string, description: string, category: [string], complexity: string) {
    return await questionModel.findByIdAndUpdate(
        id,
        {
            $set: {
                title,
                description,
                category,
                complexity
            },
        },
        { new: true },
    );
}

export async function deleteQuestionById(id: string) {
    return await questionModel.findByIdAndDelete(id);
}
