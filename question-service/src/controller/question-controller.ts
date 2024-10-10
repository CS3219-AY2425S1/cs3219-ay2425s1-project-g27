import { Request, Response } from 'express';
import {
  createQuestion as createQuestionService,
  fetchAllQuestions as fetchAllQuestionsService,
  fetchQuestionById as fetchQuestionByIdService,
  modifyQuestionById as modifyQuestionByIdService,
  removeQuestionById as removeQuestionByIdService,
  fetchQuestionByTitle as fetchQuestionByTitleService
} from '../service/question-service';

// Helper function to handle and format errors properly
function handleError(error: unknown, res: Response) {
    if (error instanceof Error) {
        res.status(400).json({ error: error.message });
    } else {
        res.status(400).json({ error: 'An unknown error occurred' });
    }
}

// Controller to create a new question
export async function createQuestion(req: Request, res: Response) {
    try {
        const question = await createQuestionService(req.body);
        return res.status(201).json(question);
    } catch (error: any) {
        if (error.message === 'DUPLICATE_QUESTION') {
            return res.status(409).json({ error: 'Question already exists' });
        }
        handleError(error, res);
    }
}

// Controller to get all questions
export async function fetchAllQuestions(req: Request, res: Response) {
    try {
        const questions = await fetchAllQuestionsService(req.query);
        res.status(200).json(questions);
    } catch (error) {
        handleError(error, res);
    }
}

// Controller to get a specific question by ID
export async function fetchQuestionById(req: Request, res: Response) {
    try {
        const question = await fetchQuestionByIdService(req.params.id);
        if (question) {
            res.status(200).json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        handleError(error, res);
    }
}

export async function fetchQuestionByTitle(req: Request, res: Response) {
    try {
        const question = await fetchQuestionByTitleService(req.params.title);
        if (question) {
            res.status(200).json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        handleError(error, res);
    }
}

// Controller to update a question by ID
export async function modifyQuestionById(req: Request, res: Response) {
    try {
        const updatedQuestion = await modifyQuestionByIdService(req.params.id, req.body);
        if (updatedQuestion) {
            res.status(200).json(updatedQuestion);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        handleError(error, res);
    }
}

// Controller to delete a question by ID
export async function removeQuestionById(req: Request, res: Response) {
    try {
        const isDeleted = await removeQuestionByIdService(req.params.id);
        if (isDeleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        handleError(error, res);
    }
}
