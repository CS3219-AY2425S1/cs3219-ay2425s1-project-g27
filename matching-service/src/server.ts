// src/server.ts
import express, { Request, Response } from 'express';

// Create an Express application
const app = express();

// Set the port
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Define a simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World! This is your Express server with TypeScript.');
});

// Example API route (GET /api/data)
app.get('/api/data', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the API', data: [1, 2, 3, 4, 5] });
});

// Example POST route (POST /api/submit)
app.post('/api/submit', (req: Request, res: Response) => {
  const { name, message } = req.body;
  res.json({ message: `Hello ${name}, your message is: ${message}` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});