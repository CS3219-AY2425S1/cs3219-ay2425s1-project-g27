import express, { Application } from 'express';
import dotenv from 'dotenv';
import questionRoutes from './routes/question-routes';
import { connectToDB } from './repo/question-repo';
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// To handle CORS Errors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }

  // Continue Route Processing
  next();
});

// Connect to MongoDB and start the server only if the connection is successful
async function startServer() {
    try {
        await connectToDB();
        console.log('Connected to MongoDB');

        // Use the question routes, and prefix all routes with /api
        app.use('/api', questionRoutes);

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);  // Exit the process if connection fails
    }
}

startServer();
