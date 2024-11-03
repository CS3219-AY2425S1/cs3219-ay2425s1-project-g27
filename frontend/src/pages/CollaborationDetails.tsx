import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";

const CollaborationDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract data from location.state
  const { peerUserName, timestamp, timeTaken, codeContent } = location.state || {};
  console.log("Received data in CollaborationDetails:", { peerUserName, timestamp, timeTaken, codeContent });

  // Format the timestamp and time taken
  const formattedTimestamp = timestamp ? format(new Date(timestamp), "dd MMMM yyyy, hh:mm a") : "N/A";
  const formattedTimeTaken =
    timeTaken >= 3600
      ? `${Math.floor(timeTaken / 3600)}h ${Math.floor((timeTaken % 3600) / 60)}m ${timeTaken % 60}s`
      : timeTaken >= 60
      ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`
      : `${timeTaken}s`;

  // Split code content into lines
  const codeLines = (codeContent || "// No code content available").split("\n");

  return (
    <Box sx={{ p: 4, color: "white", backgroundColor: "#1c1c1c", borderRadius: 2, maxWidth: 800, margin: "0 auto" }}>
      {/* Title Section */}
      <Typography variant="h4" gutterBottom align="center">
        Collaboration with {peerUserName || "Unknown"}
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center">
        Completed on {formattedTimestamp} in {formattedTimeTaken}
      </Typography>

      {/* Code Display Section with Line Numbers */}
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
          display: "flex",
        }}
      >
        <Box sx={{ pr: 2, textAlign: "right", userSelect: "none", color: "#888" }}>
          {codeLines.map((_:any, index: any) => (
            <Typography key={index} style={{ lineHeight: "1.5rem" }}>
              {index + 1}
            </Typography>
          ))}
        </Box>
        <Box sx={{ pl: 2 }}>
          <Typography variant="h6" gutterBottom>
            Code Written
          </Typography>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", margin: 0 }}>
            {codeLines.map((line: any, index: any) => (
              <div key={index}>{line}</div>
            ))}
          </pre>
        </Box>
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