import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CollaborationDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract data from location.state
  const { peerUserName, timestamp, timeTaken, codeContent, language } = location.state || {};
  console.log("Received data in CollaborationDetails:", { peerUserName, timestamp, timeTaken, codeContent, language });

  // Format the timestamp and time taken
  const formattedTimestamp = timestamp ? format(new Date(timestamp), "dd MMMM yyyy, hh:mm a") : "N/A";
  const formattedTimeTaken =
    timeTaken >= 3600
      ? `${Math.floor(timeTaken / 3600)}h ${Math.floor((timeTaken % 3600) / 60)}m ${timeTaken % 60}s`
      : timeTaken >= 60
      ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
      : `${timeTaken}s`;

  // Set default language mapping to JavaScript if undefined
  const syntaxLanguage = language ? language.toLowerCase() : "javascript";

  return (
    <Box sx={{ p: 4, color: "white", backgroundColor: "#1c1c1c", borderRadius: 2, maxWidth: 800, margin: "0 auto" }}>
      {/* Title Section */}
      <Typography variant="h4" gutterBottom align="center">
        Collaboration with {peerUserName || "Unknown"}
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center">
        Completed on {formattedTimestamp} in {formattedTimeTaken}
      </Typography>

      {/* Code Display Section */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: "#2e2e2e",
          borderRadius: 2,
          overflowX: "auto",
          color: "#f5f5f5",
          fontFamily: "monospace",
          fontSize: "1rem",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Code Written in {language || "JavaScript"}
        </Typography>
        <SyntaxHighlighter
          language={syntaxLanguage}
          style={materialDark}
          showLineNumbers
          wrapLines
        >
          {codeContent || "// No code content available"}
        </SyntaxHighlighter>
      </Box>

      {/* Back Button */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          sx={{ px: 4, py: 1.5, fontSize: "1rem", fontWeight: "bold" }}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default CollaborationDetails;