import {
  Button,
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
} from "@mui/material";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const questionAttempts = [
  {
    question: "Question 1",
    topic: "Math",
    peer: "John Doe",
    difficulty: "Easy",
  },
  {
    question: "Question 2",
    topic: "Algorithms",
    peer: "Jane Smith",
    difficulty: "Medium",
  },
  {
    question: "Question 3",
    topic: "Data Structures",
    peer: "Alice Lee",
    difficulty: "Hard",
  },
  {
    question: "Question 4",
    topic: "Data Structures",
    peer: "Alice Lee",
    difficulty: "Easy",
  },
  {
    question: "Question 5",
    topic: "Data Structures",
    peer: "Alice Lee",
    difficulty: "Medium",
  },
  {
    question: "Question 6",
    topic: "Data Structures",
    peer: "Alice Lee",
    difficulty: "Hard",
  },
  {
    question: "Question 7",
    topic: "Data Structures",
    peer: "Alice Lee",
    difficulty: "Easy",
  },
  {
    question: "Question 8",
    topic: "Data Structures",
    peer: "Alice Lee",
    difficulty: "Medium",
  },
  {
    question: "Question 9",
    topic: "Data Structures",
    peer: "Alice Lee",
    difficulty: "Hard",
  },
];

const Dashboard = () => {
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState(questionAttempts);
  const { user } = useAuth();
  const navigate = useNavigate();

  const entriesPerPage = 8;
  const totalEntries = filteredQuestions.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredQuestions.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const sortedQuestions = [...filteredQuestions];
    if (sortBy === "Difficulty") {
      sortedQuestions.sort((a, b) => {
        const difficultyOrder = ["Easy", "Medium", "Hard"];
        return (
          difficultyOrder.indexOf(a.difficulty) -
          difficultyOrder.indexOf(b.difficulty)
        );
      });
    } else if (sortBy === "Topic") {
      sortedQuestions.sort((a, b) => a.topic.localeCompare(b.topic));
    }
    setFilteredQuestions(sortedQuestions);
  }, [sortBy]);

  useEffect(() => {
    const filtered = questionAttempts.filter(
      (attempt) =>
        attempt.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.peer.toLowerCase().includes(searchQuery.toLowerCase()) // Add checks for peer and difficulty as well
    );
    setFilteredQuestions(filtered);
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;

    // Escape special regex characters in the search query
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    // Create a regular expression for the search term
    const escapedSearchTerm = escapeRegExp(searchQuery);
    const regex = new RegExp(`(${escapedSearchTerm})`, "gi");

    // Split the text by the search term
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <strong key={index}>{part}</strong> // Bold the matching part
          ) : (
            <span key={index}>{part}</span> // Regular text for non-matching parts
          )
        )}
      </>
    );
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Header />

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box display="flex" flexDirection="row" gap={2}>
          <Box
            p={2}
            border={1}
            borderColor="grey.300"
            borderRadius={2}
            flex="1 1 25%"
          >
            <Typography variant="h5" gutterBottom>
              {user ? user.name : "Loading..."}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Proficiency: Expert
            </Typography>

            <Box mt={3} mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Questions Solved:
              </Typography>
              <Box>
                <Typography>Easy: 3</Typography>
                <Typography>Medium: 3</Typography>
                <Typography>Hard: 3</Typography>
              </Box>
            </Box>

            <Box mt={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/dashboard/edit-profile")}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/dashboard/change-password")}
              >
                Change Password
              </Button>
            </Box>
          </Box>

          <Box
            p={2}
            border={1}
            borderColor="grey.300"
            borderRadius={2}
            flex="1 1 75%"
          >
            <Typography variant="h6" gutterBottom>
              Attempts History
            </Typography>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <TextField
                variant="outlined"
                label="Search"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <TextField
                select
                label="Sort By"
                value={sortBy}
                onChange={handleSortChange}
                size="small"
              >
                <MenuItem value="Newest">Newest</MenuItem>
                <MenuItem value="Difficulty">Difficulty</MenuItem>
                <MenuItem value="Topic">Topic</MenuItem>
              </TextField>
            </Box>

            <Paper elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Question</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Peer</TableCell>
                    <TableCell>Difficulty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentEntries.map((attempt, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {highlightText(attempt.question, searchQuery)}
                      </TableCell>
                      <TableCell>
                        {highlightText(attempt.topic, searchQuery)}
                      </TableCell>
                      <TableCell>
                        {highlightText(attempt.peer, searchQuery)}
                      </TableCell>
                      <TableCell>
                        {highlightText(attempt.difficulty, searchQuery)}
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
                Showing data {indexOfFirstEntry + 1} to{" "}
                {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries}{" "}
                entries
              </Typography>
              <Box>
                {pageNumbers.map((pageNumber) => (
                  <IconButton
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    color={pageNumber === currentPage ? "primary" : "default"}
                  >
                    {pageNumber}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Dashboard;
