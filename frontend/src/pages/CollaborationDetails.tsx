import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  List,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AttemptTestCases, CodeRun } from "../@types/attempt";

const CollaborationDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { attempt } = (location.state as { attempt: AttemptTestCases }) || {};

  // If no attempt data is found, return a loading message
  if (!attempt) {
    return <div>Loading...</div>;
  }

  const {
    questionId: { title, description, category, complexity },
    peerUserName,
    timestamp,
    timeTaken,
    codeContent,
    language,
    codeRuns,
  } = attempt;

  const [selectedCodeRunIndex, setSelectedCodeRunIndex] = useState<number>(0);

  // Format the timestamp and time taken
  const formattedTimestamp = timestamp
    ? format(new Date(timestamp), "dd MMMM yyyy, hh:mm a")
    : "N/A";
  const formattedTimeTaken =
    timeTaken && timeTaken >= 3600
      ? `${Math.floor(timeTaken / 3600)}h ${Math.floor(
          (timeTaken % 3600) / 60)}m ${timeTaken % 60}s`
      : timeTaken && timeTaken >= 60
      ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
      : `${timeTaken || 0}s`;

  // Styling for difficulty chip
  const difficultyColor = complexity === "Easy" ? "success" : complexity === "Medium" ? "warning" : "error";

  const formatLanguageName = (language: string | undefined) => {
    switch (language) {
      case "cpp":
        return "C++";
      case "java":
        return "Java";
      case "python":
        return "Python3";
      case "c":
        return "C";
      case "javascript":
        return "JavaScript";
      default:
        return "";
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        color: "white",
        backgroundColor: "#1c1c1c",
        borderRadius: 4,
        maxWidth: 1400, 
        margin: "0 auto",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Collaboration with {peerUserName || "Unknown"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{
            px: 3,
            py: 1,
            fontSize: "1rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            "&:hover": {
              backgroundColor: "#0056b3",
            },
          }}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </Box>
      <Typography variant="subtitle1" sx={{ color: "#bbb", mb: 3 }}>
        Completed on {formattedTimestamp} in {formattedTimeTaken}
      </Typography>

      {/* Main Content Area */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", 
          gap: 4,
        }}
      >
        {/* Question Details */}
        <Box sx={{ backgroundColor: "#2a2a2a", p: 3, borderRadius: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#fff" }}
          >
            {title || "Question Title"}
          </Typography>

          {/* Tags for Difficulty and Category */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Chip
              label={complexity}
              color={difficultyColor}
              size="small"
              sx={{ fontWeight: "bold", color: "#fff" }}
            />
            {category.map((topic: string, index: number) => (
              <Chip
                key={index}
                label={topic}
                variant="outlined"
                size="small"
                sx={{ color: "#bbb", borderColor: "#444" }}
              />
            ))}
          </Box>

          <Typography
            variant="body1"
            sx={{ color: "#ddd", whiteSpace: "pre-wrap" }}
          >
            {description || "No description available."}
          </Typography>
        </Box>

        {/* Code Runs and Code Display */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* Code Runs List */}
          <Box
            sx={{
              flexBasis: "30%",
              backgroundColor: "#1e1e1e",
              p: 2,
              borderRadius: 3,
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Code Runs
            </Typography>
            {codeRuns && codeRuns.length > 0 ? (
              <List>
                {codeRuns.map((codeRun: CodeRun, index: number) => (
                  <ListItemButton
                    key={index}
                    onClick={() => setSelectedCodeRunIndex(index)}
                    sx={{
                      backgroundColor:
                        selectedCodeRunIndex === index
                          ? "rgba(255,255,255,0.1)"
                          : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={
                        codeRun.status === "Success" ? (
                          <span style={{ color: "green" }}>{codeRun.status}</span>
                        ) : (
                          <span style={{ color: "red" }}>{codeRun.status}</span>
                        )
                      }                      
                      secondary={`${new Date(
                        codeRun.timestamp
                      ).toLocaleString()} - ${formatLanguageName(
                        codeRun.language
                      )}`}
                      sx={{ "& .MuiTypography-root": { color: "#fff" } }} 

                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ color: "#bbb" }}>
                No code runs available.
              </Typography>
            )}
          </Box>

          {/* Code Display */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#2e2e2e",
              p: 2,
              borderRadius: 3,
              overflowX: "auto",
              color: "#f5f5f5",
              fontFamily: "monospace",
              fontSize: "0.95rem",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
              maxHeight: 400,
            }}
          >
            {codeRuns && codeRuns.length > 0 ? (
              <>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ color: "#ddd", mb: 2 }}
                >
                  Code Written in{" "}
                  {formatLanguageName(codeRuns[selectedCodeRunIndex].language)}
                </Typography>
                <SyntaxHighlighter
                  language={
                    codeRuns[selectedCodeRunIndex].language || "javascript"
                  }
                  style={materialDark}
                >
                  {codeRuns[selectedCodeRunIndex].code ||
                    "// No code content available"}
                </SyntaxHighlighter>
              </>
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ color: "#ddd", mb: 2 }}
                >
                  No Language Selected
                </Typography>
                <SyntaxHighlighter
                  language={language || "javascript"}
                  style={materialDark}
                >
                  {codeContent || "// No code content available"}
                </SyntaxHighlighter>
              </>
            )}
          </Box>
        </Box>

        {/* Output and Test Case Results */}
        {codeRuns && codeRuns.length > 0 && (
          <Box
            sx={{
              backgroundColor: "#1e1e1e",
              p: 2,
              borderRadius: 3,
              color: "#fff",
              fontSize: "0.9rem",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Test Case Results */}
            {codeRuns[selectedCodeRunIndex].testCaseResults &&
              codeRuns[selectedCodeRunIndex].testCaseResults.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Test Case Results:
                  </Typography>
                  <List>
                    {codeRuns[selectedCodeRunIndex].testCaseResults.map(
                      (testCase, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            backgroundColor: testCase.pass
                              ? "rgba(0, 255, 0, 0.1)"
                              : "rgba(255, 0, 0, 0.1)",
                            mb: 1,
                            p: 1,
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body1" sx={{ color: "#fff" }}>
                            Test Case {testCase.testCaseIndex}:{" "}
                            {testCase.pass ? "Passed" : "Failed"}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#fff" }}>
                            Input: {testCase.input}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#fff" }}>
                            Expected Output: {testCase.expected}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#fff" }}>
                            Actual Output: {testCase.actual}
                          </Typography>
                          {testCase.userStdOut && (
                            <Typography variant="body2" sx={{ color: "#fff" }}>
                              StdOut: {testCase.userStdOut}
                            </Typography>
                          )}
                        </Box>
                      )
                    )}
                  </List>
                </Box>
              )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CollaborationDetails;