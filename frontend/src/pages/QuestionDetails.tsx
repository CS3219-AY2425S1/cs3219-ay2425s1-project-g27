import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { deleteQuestionById, fetchQuestionById } from "../api/questionApi";
import { useEffect, useState } from "react";
import { Question } from "../@types/question";
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const QuestionDetails = () => {
  const { id } = useParams<{ id: string | undefined }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question>();
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuestionById(id)
        .then((data) => {
          if (data) {
            setQuestion(data);
            setError(null);
          } else {
            setError("Question not found");
          }
        })
        .catch((error) => {
          console.error("Error fetching question details:", error);
          setError("Error fetching question details");
        });
    } else {
      setError("Invalid question ID");
    }
  }, [id]);

  const getChipColor = (complexity: string) => {
    switch (complexity) {
      case "Easy":
        return "success";
      case "Medium":
        return "warning";
      case "Hard":
        return "error";
      default:
        return "default";
    }
  };

  const handleDelete = async () => {
    if (id) {
      try {
        await deleteQuestionById(id, token);
        toast.success("Question deleted successfully");
        navigate("/questions");
      } catch (error) {
        console.error("Failed to delete question:", error);
        toast.error("Failed to delete question. Please try again.");
      }
    }
  };

  return (
    <>
      <Header></Header>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={2}
        >
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ mb: 2 }}
          >
            Back To Question Repository
          </Button>
          <Box display="flex" alignItems="center">
            <Button
              variant="contained"
              sx={{
                mb: 2,
                mr: 2,
                color: "white",
                backgroundColor: "green",
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              sx={{
                mb: 2,
                color: "white",
                backgroundColor: "red",
              }}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
        <Box
          p={3}
          border={1}
          borderColor="grey.300"
          borderRadius={2}
          boxShadow={1}
          bgcolor="background.paper"
        >
          {error ? (
            <Typography variant="h6" color="error">
              Error: {error}
            </Typography>
          ) : (
            question && (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h5">{question.title}</Typography>
                  <Chip
                    label={question.complexity}
                    color={getChipColor(question.complexity)}
                    variant="outlined"
                  />
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" paragraph>
                  {question.description.split("\n").map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
                </Typography>
                <Divider sx={{ mt: 2, mb: 2 }} />
                <Stack direction="row" spacing={1}>
                  {question.category?.map((topic) => (
                    <Chip key={topic} label={topic} variant="outlined" />
                  ))}
                </Stack>
              </>
            )
          )}
        </Box>
      </Container>
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default QuestionDetails;
