import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SignUpData } from "../@types/auth";
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { signUpService } from "../api/userApi";

const SignUp = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState<SignUpData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const navigateToLoginPage = () => {
    navigate("/");
  };

  const handleSubmitEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.password !== input.confirmPassword) {
      toast.error("Passwords do not match");
    } else if (
      input.email !== "" &&
      input.password !== "" &&
      input.username !== ""
    ) {
      try {
        const response = await signUpService(input);
        if (!response) {
          throw new Error("Failed to create account");
        }
        toast.success("Account created successfully");
        setInput({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    } else {
      toast.error("Please fill in all fields");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmitEvent}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Create Account
        </Typography>
        <TextField
          label="Username"
          type="username"
          id="username"
          name="username"
          value={input.username}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          type="email"
          id="email"
          name="email"
          value={input.email}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          id="password"
          name="password"
          value={input.password}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Confirm Password"
          type="password"
          id="confirm-password"
          name="confirmPassword"
          value={input.confirmPassword}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Sign Up
        </Button>
        <Link
          onClick={navigateToLoginPage}
          sx={{ mt: 2, cursor: "pointer" }}
          underline="hover"
        >
          Already have an account? Login.
        </Link>
      </Box>
    </Container>
  );
};

export default SignUp;
