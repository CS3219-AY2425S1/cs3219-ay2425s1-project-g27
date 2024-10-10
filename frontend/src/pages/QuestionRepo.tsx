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
} from "@mui/material";
import Header from "../components/Header";
import { getAllQuestions } from "../api/questionApi"; // Ensure your API supports pagination & sorting params
import { Question } from "../@types/question";
import Highlight from "../components/Highlight";
import { useDebounce } from "../hooks/useDebounce";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const QuestionRepo = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const entriesPerPage = 10;

  const [sortField, setSortField] = useState<string>("title"); // Default sort field
  const [sortOrder, setSortOrder] = useState<string>("asc"); // Default sort order

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // debounceHook for limiting searchQuery api calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchQuestions = async (
    page: number,
    sort: string,
    order: string,
    search: string,
    signal: AbortSignal
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch questions with pagination and sorting
      const data = await getAllQuestions(
        { page, limit: entriesPerPage, sort, order, search },
        signal
      );
      // Check if data is null or undefined
      if (!data) {
        return;
      }
      if (data.questions.length === 0) {
        setError("No questions found.");
        setQuestions([]);
      } else {
        setQuestions(data.questions);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalQuestions(data.totalQuestions);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return;
      }
      console.error("Failed to fetch questions", error);
      setError("No questions found.");
      setQuestions([]); // Clear previous questions
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Fetch questions when the component mounts or sorting changes
    fetchQuestions(
      currentPage,
      sortField,
      sortOrder,
      debouncedSearchQuery,
      signal
    );

    let isMounted = true;

    return () => {
      if (!isMounted) {
        controller.abort();
      } else {
        isMounted = false;
      }
    };
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
    setCurrentPage(1); // Reset to first page on new search
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
                // sx={{ width: 150 }}
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

          {/* Conditional Rendering Based on Loading, Error, and Data */}
          {loading ? (
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Loading...
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
                        <TableCell>{/* Status Cell */}</TableCell>
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
        </Box>
      </Container>
    </>
  );
};

export default QuestionRepo;
