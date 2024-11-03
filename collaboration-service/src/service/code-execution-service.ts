import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const JUDGE0_API_URL = process.env.JUDGE0_API_URL;

// Language ID mapping for Judge0 API
const languageIds: { [key: string]: number } = {
  javascript: 63, // JavaScript (Node.js) language ID
  python: 71,    // Python 3 language ID
  java: 62,       // Java
  c: 50,          // C (GCC)
  cpp: 54         // C++ (GCC)
};

export async function executeCode(code: string, language: string = "javascript"): Promise<string> {
  const languageId = languageIds[language];

  if (!code.trim()) {
    return "None";
  }
  
  if (!languageId) {
    throw new Error("Unsupported language");
  }

  try {
    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
      }
    );

    const { stdout, stderr, compile_output, status } = submissionResponse.data;
    
    if (status && status.description !== "Accepted") {
      return `Error: ${status.description}\n${compile_output || stderr}`;
    }
    
    return stdout || compile_output || stderr || "None";
  } catch (error) {
    console.error("Error executing code:", error);
    return "An error occurred during code execution.";
  }
}
