import { saveQuestion, getQuestions, getQuestionById, updateQuestionById, deleteQuestionById, getQuestionByTitle, getTotalQuestions } from '../repo/question-repo';

export async function createQuestion(questionData: any) {
    if (!questionData.title || !questionData.description) {
        throw new Error("Title and description are required");
    }
    const existingQuestion = await getQuestionByTitle(questionData.title);
    
    if (existingQuestion) {
        throw new Error('DUPLICATE_QUESTION');  // Throw an error if duplicate is found
    }

    // Create the question if no duplicate exists
    return await saveQuestion(questionData);
}

export async function fetchAllQuestions(reqQuery: any) {
    const {sort = 'title', order = 'asc', page = 1, limit = 10 , search,} = reqQuery;

    // Build filter object
    let filter: any = {};

    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
    
        filter.$or = [
          { title: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { complexity: { $regex: searchRegex } },
        ];
      }
    
    // Convert `page` and `limit` to numbers
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10); 

    const questions = await getQuestions(sort, order, pageNumber, limitNumber, filter);
    if (!questions) {
        throw new Error("Error fetching question");
    }

    const totalQuestions = await getTotalQuestions(filter); 
    if (!totalQuestions) {
        throw new Error(`Error fetching question`);
    }

    return {
        totalQuestions,
        totalPages: Math.ceil(totalQuestions / limitNumber),
        currentPage: pageNumber,
        questions
    };
}

export async function fetchQuestionById(id: string) {
    const question = await getQuestionById(id);
    if (!question) {
        throw new Error(`Question with ID: ${id} not found`);
    }
    return question;
}

export async function fetchQuestionByTitle(title: string) {
    const question = await getQuestionByTitle(title);
    if (!question) {
        throw new Error(`Question with title: ${title} not found`);
    }
    return question;
}

export async function modifyQuestionById(id: string, updateData: any) {
    const { title, description, category, complexity } = updateData;

    if (!title || !description) {
        throw new Error("Title and description are required to update a question");
    }

    const updatedQuestion = await updateQuestionById(id, title, description, category, complexity);
    if (!updatedQuestion) {
        throw new Error(`Question with ID: ${id} not found`);
    }

    return updatedQuestion;
}

export async function removeQuestionById(id: string) {
    const deletedQuestion = await deleteQuestionById(id);
    if (!deletedQuestion) {
        throw new Error(`Question with ID: ${id} not found or already deleted`);
    }
    return true;
}
