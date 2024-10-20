import React from "react";
import { Box, Typography } from "@mui/material";

interface LabelValueProps {
  label: string;
  value: string | null;
}

const LabelValue: React.FC<LabelValueProps> = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      width: "100%",
      marginBottom: "10px",
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
      {label}:
    </Typography>
    <Typography variant="h6" sx={{ marginLeft: "8px" }}>
      {value}
    </Typography>
  </Box>
);

export default LabelValue;
