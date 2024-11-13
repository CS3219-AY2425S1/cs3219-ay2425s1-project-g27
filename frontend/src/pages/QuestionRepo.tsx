import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  MenuItem,
  TextField,
  Button,
  Tooltip,
} from "@mui/material";
import Header from "../components/Header";
import { getAllQuestions } from "../api/questionApi";
import { Question } from "../@types/question";
import Highlight from "../components/Highlight";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { fetchUserAttempts } from "../api/attemptApi";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const QuestionRepo = () => {
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const entriesPerPage = 10;

  const [sortField, setSortField] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<string>("asc");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [userAttemptedQuestionIds, setUserAttemptedQuestionIds] = useState<Set<string>>(new Set());
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!token) {
        console.log("No token available, skipping attempts fetch.");
        setUserAttemptedQuestionIds(new Set());
        return;
      }

      setAttemptsLoading(true);
      setAttemptsError(null);

      console.log("Starting fetchAttempts");

      try {
        const data = await fetchUserAttempts(token);
        console.log("Fetched Attempts in QuestionRepo:", data);

        if (Array.isArray(data)) {
          const attemptedIds = new Set<string>(
            data.map((attempt: any) =>
              typeof attempt.questionId === "object" && attempt.questionId._id
                ? String(attempt.questionId._id)
                : String(attempt.questionId)
            )
          );
          setUserAttemptedQuestionIds(attemptedIds);
        } else {
          console.error("Unexpected data format for attempts:", data);
          setAttemptsError("Invalid data format for attempts.");
          setUserAttemptedQuestionIds(new Set());
        }
      } catch (error: any) {
        console.error("Failed to fetch user attempts:", error);
        setAttemptsError("Failed to fetch user attempts.");
        setUserAttemptedQuestionIds(new Set());
      } finally {
        setAttemptsLoading(false);
      }
    };

    fetchAttempts();
  }, [token]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      console.log("fetchQuestions - Parameters:", {
        currentPage,
        sortField,
        sortOrder,
        debouncedSearchQuery,
      });

      try {
        const data = await getAllQuestions({
          page: currentPage,
          limit: entriesPerPage,
          sort: sortField,
          order: sortOrder,
          search: debouncedSearchQuery,
        });
        console.log("Fetched Questions:", data);

        if (!data || data.questions.length === 0) {
          setError("No questions found.");
          setQuestions([]);
        } else {
          setQuestions(
            data.questions.map((q: Question) => ({
              ...q,
              _id: String(q._id),
            }))
          );
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          setTotalQuestions(data.totalQuestions);
        }
      } catch (error: any) {
        console.error("Failed to fetch questions", error);
        setError("Failed to fetch questions.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [currentPage, sortField, sortOrder, debouncedSearchQuery]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortField(event.target.value as string);
  };

  const handleOrderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortOrder(event.target.value as string);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const navigateToManageQuestions = () => {
    navigate("/questions/manage");
  };

  const handleRowClick = (id: string) => {
    navigate(`/questions/${id}`);
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box
          p={2}
          border={1}
          borderColor="grey.300"
          borderRadius={2}
          flex="1 1 75%"
        >
          <Typography variant="h6" gutterBottom>
            Question Repository
          </Typography>
          {/* Sorting Controls */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mt={2}
          >
            <Box display="flex" alignItems="center" mb={3}>
              <TextField
                select
                label="Sort By"
                value={sortField}
                onChange={handleSortChange}
                size="small"
                variant="outlined"
                sx={{ mr: 2 }}
              >
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="complexity">Difficulty</MenuItem>
                <MenuItem value="category">Topic</MenuItem>
              </TextField>

              <TextField
                select
                label="Order"
                value={sortOrder}
                onChange={handleOrderChange}
                size="small"
                variant="outlined"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </TextField>
            </Box>
            {user?.isAdmin && (
              <Button
                variant="outlined"
                onClick={navigateToManageQuestions}
                sx={{ mb: 2 }}
              >
                + Create Question
              </Button>
            )}
          </Box>

          <Box display="flex" alignItems="center" mb={3}>
            <TextField
              label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              variant="outlined"
              fullWidth
            />
          </Box>

          {/* Conditional Rendering Based on Loading and Error */}
          {loading ? (
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Loading Questions...
            </Typography>
          ) : error ? (
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, color: "red" }}
            >
              {error}
            </Typography>
          ) : (
            <>
              <Paper elevation={3}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Question Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Difficulty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow
                        key={question._id}
                        hover
                        onClick={() => handleRowClick(question._id)}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell>
                          <Highlight
                            text={question.title}
                            query={searchQuery}
                          />
                        </TableCell>
                        <TableCell>
                          {userAttemptedQuestionIds.has(question._id) ? (
                            <Tooltip title="You have attempted this question">
                              <Box display="flex" alignItems="center">
                                <CheckCircleIcon color="success" sx={{ mr: 0.5 }} />
                                <Typography color="success.main">Attempted</Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            <Tooltip title="You have not attempted this question">
                              <Box display="flex" alignItems="center">
                                <RadioButtonUncheckedIcon color="disabled" sx={{ mr: 0.5 }} />
                                <Typography color="textSecondary">Not Attempted</Typography>
                              </Box>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>
                          <Highlight
                            text={question.complexity}
                            query={searchQuery}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Typography variant="body2">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                  {Math.min(currentPage * entriesPerPage, totalQuestions)} of{" "}
                  {totalQuestions} entries
                </Typography>

                <Box>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <IconButton
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        color={
                          pageNumber === currentPage ? "primary" : "default"
                        }
                      >
                        {pageNumber}
                      </IconButton>
                    )
                  )}
                </Box>
              </Box>
            </>
          )}

          {/* Display Attempts Loading and Error Separately */}
          {attemptsLoading && (
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Loading User Attempts...
            </Typography>
          )}
          {attemptsError && (
            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, color: "red" }}
            >
              {attemptsError}
            </Typography>
          )}
        </Box>
      </Container>
    </>
  );
};

export default QuestionRepo;