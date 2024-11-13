import React, { useState } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../api/userApi";
import Header from "../components/Header";
import { toast } from "react-toastify";

const ChangePassword: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user || !token) {
      setError("User is not logged in.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await updateUserProfile(token, user.id, {
        password: newPassword,
      });
      if (!response) {
        toast.success("An error occurred");
        throw new Error("Failed to update password");
      }
      toast.success("Password changed successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error("Failed to update password. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Box mt={4}>
          <Typography variant="h4" gutterBottom>
            Change Password
          </Typography>
          <form onSubmit={handleChangePassword}>
            <TextField
              label="New Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" variant="body2" gutterBottom>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Save Changes
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default ChangePassword;
