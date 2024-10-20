import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Chip,
  MenuItem,
} from "@mui/material";
import Header from "../components/Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../api/questionApi";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { CreateQuestionFormData } from "../@types/question";

const ManageQuestions = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<CreateQuestionFormData>({
    title: "",
    description: "",
    complexity: "Easy",
    categories: [],
    categoryInput: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      categoryInput: e.target.value,
    }));
  };

  const addCategory = (): void => {
    const newCategory = formData.categoryInput.trim();
    if (newCategory !== "" && !formData.categories.includes(newCategory)) {
      setFormData((prevFormData: CreateQuestionFormData) => ({
        ...prevFormData,
        categories: [...prevFormData.categories, newCategory],
        categoryInput: "",
      }));
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      categories: prevFormData.categories.filter(
        (category) => category !== categoryToRemove
      ),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuestion(formData, token);
      toast.success("Question created successfully");
      navigate("/questions");
    } catch (error) {
      console.error("Failed to create question:", error);
      toast.error("Failed to create question. Please try again.");
    }
  };

  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/questions")}
          sx={{ mb: 2 }}
        >
          Back To Question Repository
        </Button>
        <Box
          p={3}
          border={1}
          borderColor="grey.300"
          borderRadius={2}
          boxShadow={1}
          bgcolor="background.paper"
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Create a new question
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Title"
                variant="outlined"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Description"
                variant="outlined"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                required
              />
              <TextField
                select
                label="Complexity"
                variant="outlined"
                name="complexity"
                value={formData.complexity}
                onChange={handleInputChange}
                fullWidth
                required
              >
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </TextField>

              <Box>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Category"
                    variant="outlined"
                    name="categoryInput"
                    value={formData.categoryInput}
                    onChange={handleCategoryInputChange}
                    onKeyDown={handleKeyDown}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addCategory}
                    disabled={!formData.categoryInput.trim()}
                  >
                    Add
                  </Button>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2, flexWrap: "wrap" }}
                >
                  {formData.categories.map((category, index) => (
                    <Chip
                      key={index}
                      label={category}
                      onDelete={() => removeCategory(category)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
              >
                Create Question
              </Button>
            </Stack>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default ManageQuestions;
