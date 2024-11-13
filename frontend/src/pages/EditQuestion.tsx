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
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateQuestion, fetchQuestionById } from "../api/questionApi";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { CreateQuestionFormData } from "../@types/question";

const EditQuestion = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [formData, setFormData] = useState<CreateQuestionFormData>({
    title: "",
    description: "",
    complexity: "Easy",
    categories: [],
    categoryInput: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchQuestionById(id)
        .then((data) => {
          setFormData({
            title: data.title,
            description: data.description,
            complexity: data.complexity,
            categories: data.category,
            categoryInput: "",
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch question:", error);
          toast.error("Failed to load question data.");
          navigate(`/questions/${id}`);
        });
    }
  }, [id, navigate]);

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
      await updateQuestion(id!, formData, token);
      toast.success("Question updated successfully");
      navigate(`/questions/${id}`);
    } catch (error) {
      console.error("Failed to update question:", error);
      toast.error("Failed to update question. Please try again.");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/questions`)}
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
            Edit Question
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
                Update Question
              </Button>
            </Stack>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default EditQuestion;
