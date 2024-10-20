import { Request, Response, NextFunction } from 'express';
import axios from 'axios';  // We'll use axios to communicate with the user microservice

// Middleware to authenticate the user by communicating with the user microservice
export async function authenticateJWT(req: any, res: any, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Call the user microservice to verify the token
        const response = await axios.get(`${process.env.USER_SERVICE_URL}/auth/verify-token`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Attach the user data (e.g., role, ID) to the request
        req.user = response.data.data;
        next();  // Proceed to the next middleware or controller
    } catch (error) {
        return res.status(403).json({ message: 'Unauthorized: Invalid or expired token' });
    }
}

// Middleware to check if the user has admin role
export function isAdmin(req: any, res: any, next: NextFunction) {
    if (req.user && req.user.isAdmin) {
        next();  // User is an admin, allow them to proceed
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
}
