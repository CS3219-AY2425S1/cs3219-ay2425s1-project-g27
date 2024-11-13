import axios from "axios";
import dotenv from "dotenv";
import { TestTemplateCode, ExecutionResult } from "../models/models";
dotenv.config();

const JUDGE0_API_URL = process.env.JUDGE0_API_URL;

// Language ID mapping for Judge0 API
const languageIds: { [key: string]: number } = {
  javascript: 63, // JavaScript (Node.js) language ID
  python: 71, // Python 3 language ID
  java: 62, // Java
};

export async function executeCode(
  code: string,
  language: string = "javascript"
): Promise<string> {
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

export async function executeCodeWithTestCases(
  code: string,
  language: string = "javascript",
  testCases: Array<{ input: any; output: any }> | null,
  testTemplateCode: TestTemplateCode | null
): Promise<ExecutionResult> {
  const languageId = languageIds[language];

  if (!code.trim()) {
    throw new Error("Code cannot be empty.");
  }

  if (!languageId) {
    throw new Error("Unsupported language");
  }

  try {
    if (language === "python") {
      if (!testTemplateCode?.python) {
        throw new Error("Python test template code is missing.");
      }
      return await runPythonCode(
        code,
        testCases,
        testTemplateCode.python,
        languageId
      );
    } else if (language === "javascript") {
      if (!testTemplateCode?.javascript) {
        throw new Error("JavaScript test template code is missing.");
      }
      return await runJavaScriptCode(
        code,
        testCases,
        testTemplateCode.javascript,
        languageId
      );
    } else if (language === "java") {
      if (!testTemplateCode?.java) {
        throw new Error("Java test template code is missing.");
      }
      return await runJavaCode(
        code,
        testCases,
        testTemplateCode.java,
        languageId
      );
    } else {
      throw new Error("Not implemented");
    }
  } catch (error) {
    console.error("Error executing code:", error);
    throw new Error("An error occurred during code execution.");
  }
}

async function runPythonCode(
  code: string,
  testCases: Array<{ input: any; output: any }> | null,
  testTemplateCode: string,
  languageId: number
): Promise<ExecutionResult> {
  const results = [];

  for (const [index, testCase] of testCases!.entries()) {
    const { input, output: expectedOutput } = testCase;

    const fullCode = testTemplateCode
      .replace(/\${input}/g, JSON.stringify(input))
      .replace("${code}", code);

    try {
      const submissionResponse = await axios.post(
        `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: fullCode,
          language_id: languageId,
        }
      );

      const { stdout, stderr, compile_output } = submissionResponse.data;

      if (stderr) {
        throw new Error(`Runtime Error: ${stderr.trim()}`);
      }

      if (compile_output) {
        throw new Error(`Compilation Error: ${compile_output.trim()}`);
      }

      const actualOutput = stdout?.trim() || "None";

      const outputStart = actualOutput.indexOf("The output is: ");
      let result =
        outputStart !== -1
          ? actualOutput.slice(outputStart + "The output is: ".length).trim()
          : actualOutput;
      const userStdOut = actualOutput.slice(0, outputStart).trim();

      const actualOutputFormatted = result
        .replace(/'/g, '"')
        .replace(/,\s+/g, ",")
        .replace(/\s+,/g, ",");

      const pass =
        actualOutputFormatted === JSON.stringify(expectedOutput).trim();

      results.push({
        testCaseIndex: index + 1,
        input: JSON.stringify(input).trim(),
        expected: JSON.stringify(expectedOutput).trim(),
        actual: actualOutputFormatted,
        userStdOut: userStdOut,
        pass,
      });
    } catch (error) {
      let errorMessage = "Unknown error occurred.";
      if (error instanceof Error) {
        const message = error.message;

        const errorMatch = message.match(/(\w+Error): (.*)/);
        if (errorMatch) {
          errorMessage = `${errorMatch[1]} - ${errorMatch[2]}`;
        } else {
          errorMessage = message;
        }
      }

      results.push({
        testCaseIndex: index + 1,
        input: JSON.stringify(input).trim(),
        expected: JSON.stringify(expectedOutput).trim(),
        actual: errorMessage,
        userStdOut: "",
        pass: false,
      });
    }
  }

  let summary = "";
  for (const {
    testCaseIndex,
    expected,
    actual,
    pass,
    userStdOut,
    input,
  } of results) {
    summary += `Test Case ${testCaseIndex}: ${pass ? "Passed" : "Failed"}\n`;
    summary += `Input: ${input}\n`;
    summary += `Expected Output: ${expected}\n`;
    summary += `Actual Output: ${actual}\n`;
    if (userStdOut.length !== 0) {
      summary += `StdOut: ${userStdOut}\n\n`;
    } else {
      summary += `\n`;
    }
  }

  return { summary, results };
}

async function runJavaScriptCode(
  code: string,
  testCases: Array<{ input: any[]; output: any[] }> | null,
  testTemplateCode: string,
  languageId: number
): Promise<ExecutionResult> {
  const results = [];

  for (const [index, testCase] of testCases!.entries()) {
    const { input, output: expectedOutput } = testCase;

    const fullCode = testTemplateCode
      .replace(/\${input}/g, JSON.stringify(input))
      .replace("${code}", code);

    try {
      const submissionResponse = await axios.post(
        `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: fullCode,
          language_id: languageId,
        }
      );

      const { stdout, stderr, compile_output } = submissionResponse.data;

      if (stderr) {
        throw new Error(`Runtime Error: ${stderr.trim()}`);
      }

      if (compile_output) {
        throw new Error(`Compilation Error: ${compile_output.trim()}`);
      }

      const actualOutput = stdout?.trim() || "None";

      const outputStart = actualOutput.indexOf("The output is: ");
      let result =
        outputStart !== -1
          ? actualOutput.slice(outputStart + "The output is: ".length).trim()
          : actualOutput;
      const userStdOut =
        outputStart !== -1
          ? actualOutput.slice(0, outputStart).trim()
          : actualOutput;

      const actualOutputFormatted = result
        .replace(/'/g, '"')
        .replace(/,\s+/g, ",")
        .replace(/\s+,/g, ",")
        .replace(/\s+/g, "")
        .replace(/]\s*,/g, "],")
        .replace(/,\s*\]/g, "],");

      const expectedOutputFormatted = JSON.stringify(expectedOutput).replace(
        /\s+/g,
        ""
      );

      const pass = actualOutputFormatted === expectedOutputFormatted;

      results.push({
        testCaseIndex: index + 1,
        input: JSON.stringify(input).trim(),
        expected: expectedOutputFormatted,
        actual: actualOutputFormatted,
        userStdOut: userStdOut,
        pass,
      });
    } catch (error) {
      let errorMessage = "Unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      results.push({
        testCaseIndex: index + 1,
        input: JSON.stringify(input).trim(),
        expected: JSON.stringify(expectedOutput).trim(),
        actual: errorMessage,
        userStdOut: "",
        pass: false,
      });
    }
  }

  let summary = "";
  for (const {
    testCaseIndex,
    expected,
    actual,
    pass,
    userStdOut,
    input,
  } of results) {
    summary += `Test Case ${testCaseIndex}: ${pass ? "Passed" : "Failed"}\n`;
    summary += `Input: ${input}\n`;
    summary += `Expected Output: ${expected}\n`;
    summary += `Actual Output: ${actual}\n`;
    if (userStdOut.length !== 0) {
      summary += `StdOut: ${userStdOut}\n\n`;
    } else {
      summary += `\n`;
    }
  }

  return { summary, results };
}

async function runJavaCode(
  code: string,
  testCases: Array<{ input: any[]; output: any[] }> | null,
  testTemplateCode: string,
  languageId: number
): Promise<ExecutionResult> {
  const results = [];

  for (const [index, testCase] of testCases!.entries()) {
    const { input, output: expectedOutput } = testCase;

    let fullCode = testTemplateCode;

    if (Array.isArray(input)) {
      const formattedInput = `new char[]{${input
        .map((char) => `'${char}'`)
        .join(", ")}}`;
      fullCode = fullCode.replace(/\${input}/g, formattedInput);
    } else if (typeof input === "string") {
      fullCode = fullCode.replace(/\${input}/g, JSON.stringify(input));
    } else {
      fullCode = fullCode.replace(/\${input}/g, JSON.stringify(input));
    }

    fullCode = fullCode.replace("${code}", code);

    try {
      const submissionResponse = await axios.post(
        `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: fullCode,
          language_id: languageId,
        }
      );

      const { stdout, stderr, compile_output } = submissionResponse.data;

      if (stderr) {
        throw new Error(`Runtime Error: ${stderr.trim()}`);
      }

      if (compile_output) {
        throw new Error(`Compilation Error: ${compile_output.trim()}`);
      }

      const actualOutput = stdout?.trim() || "None";

      const outputStart = actualOutput.indexOf("The output is: ");
      let result =
        outputStart !== -1
          ? actualOutput.slice(outputStart + "The output is: ".length).trim()
          : actualOutput;

      const userStdOut =
        outputStart !== -1
          ? actualOutput.slice(0, outputStart).trim()
          : actualOutput;

      const actualOutputFormatted = result
        .replace(/'/g, '"')
        .replace(/,\s+/g, ",")
        .replace(/\s+,/g, ",");

      const expectedOutputFormatted = JSON.stringify(expectedOutput).replace(
        /\s+/g,
        ""
      );

      const pass = actualOutputFormatted === expectedOutputFormatted;

      results.push({
        testCaseIndex: index + 1,
        input: JSON.stringify(input).trim(),
        expected: expectedOutputFormatted,
        actual: actualOutputFormatted,
        userStdOut: userStdOut,
        pass,
      });
    } catch (error) {
      let errorMessage = "Unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      results.push({
        testCaseIndex: index + 1,
        input: JSON.stringify(input).trim(),
        expected: JSON.stringify(expectedOutput).trim(),
        actual: errorMessage,
        userStdOut: "",
        pass: false,
      });
    }
  }

  let summary = "";
  for (const {
    testCaseIndex,
    expected,
    actual,
    pass,
    userStdOut,
    input,
  } of results) {
    summary += `Test Case ${testCaseIndex}: ${pass ? "Passed" : "Failed"}\n`;
    summary += `Input: ${input}\n`;
    summary += `Expected Output: ${expected}\n`;
    summary += `Actual Output: ${actual}\n`;
    if (userStdOut.length !== 0) {
      summary += `StdOut: ${userStdOut}\n\n`;
    } else {
      summary += `\n`;
    }
  }

  return { summary, results };
}
