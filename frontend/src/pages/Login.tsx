import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LoginData } from "../@types/auth";
import {
  Box,
  Button,
  Container,
  TextField,
  Link,
  Typography,
} from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState<LoginData>({
    email: "",
    password: "",
  });

  const auth = useAuth();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const handleSubmitEvent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.email !== "" && input.password !== "") {
      auth.login(input, navigate);
    }
  };

  const navigateToSignUp = () => {
    navigate("/signup");
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
          Login
        </Typography>
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Login
        </Button>
        <Link
          onClick={navigateToSignUp}
          sx={{ mt: 2, cursor: "pointer" }}
          underline="hover"
        >
          No account yet? Sign up
        </Link>
      </Box>
    </Container>
  );
};

export default Login;
