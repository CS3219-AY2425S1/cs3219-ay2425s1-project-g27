import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
} from "@mui/material";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { fetchAllTopics } from "../api/questionApi";
import { findMatch } from "../api/matchingApi";
import { io } from "socket.io-client";
import { SelectChangeEvent } from "@mui/material/Select";
import { MatchDataResponse } from "../@types/match";
import humanImage from "../assets/human.png";
import LabelValue from "../components/LabelValue";

const SOCKET_SERVER_URL = import.meta.env.VITE_MATCHING_API_URL;

const MatchSelection = () => {
  const [difficulty, setDifficulty] = useState<string>("Easy");
  const [topic, setTopic] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchUserName, setMatchUserName] = useState<string | null>(null);
  const [noMatchFound, setNoMatchFound] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const { user, token } = useAuth();

  const socketRef = useRef<any>(null);

  useEffect(() => {
    const getTopics = async () => {
      try {
        const fetchedTopics = await fetchAllTopics();
        setTopics(fetchedTopics);
        if (fetchedTopics.length > 0) {
          setTopic(fetchedTopics[0]);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    getTopics();
  }, []);

  const handleFindMatch = async (e: React.FormEvent) => {
    setMatchUserName(null);
    setNoMatchFound(false);
    e.preventDefault();

    if (!user || !token) {
      throw new Error("User is not logged in.");
    }

    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("join_room", { userName: user.name });

    socketRef.current.on(
      "match_found",
      async (matchData: MatchDataResponse) => {
        setMatchUserName(matchData.matchUserName);
        setIsMatching(false);
        setNoMatchFound(false);
        socketRef.current.disconnect();
      }
    );

    try {
      await findMatch(user?.name, topic, difficulty);
      setIsMatching(true);
      setTimer(30);
      setNoMatchFound(false);
    } catch (error) {
      console.error("Error submitting match request:", error);
      setIsMatching(false);
      socketRef.current.disconnect();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setIsMatching(false);
          setNoMatchFound(true);
          socketRef.current.disconnect();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleDifficultyChange = (e: SelectChangeEvent<string>) => {
    setDifficulty(e.target.value as string);
  };

  const handleTopicChange = (e: SelectChangeEvent<string>) => {
    setTopic(e.target.value as string);
  };

  //Placeholder join room
  const handleJoinRoom = () => {
    console.log("Room Joined");
  };

  return (
    <>
      <Header />
      <Box sx={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Select Match Settings
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="difficulty-label">Select Difficulty Level</InputLabel>
          <Select
            labelId="difficulty-label"
            id="difficulty"
            value={difficulty}
            label="Select Difficulty Level"
            onChange={handleDifficultyChange}
            disabled={isMatching}
          >
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel id="topic-label">Select Topic</InputLabel>
          <Select
            labelId="topic-label"
            id="topic"
            value={topic}
            label="Select Topic"
            onChange={handleTopicChange}
            disabled={isMatching}
          >
            {topics.map((topicName) => (
              <MenuItem key={topicName} value={topicName}>
                {topicName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            justifyContent: "start",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              justifyContent: "start",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleFindMatch}
              disabled={isMatching}
              sx={{ mt: 2, maxWidth: "15%", minWidth: "15%" }}
            >
              {isMatching ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Matching ({timer}s)
                </>
              ) : matchUserName ? (
                "Re-match"
              ) : (
                "Match"
              )}
            </Button>
            {matchUserName ? (
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, ml: 2, minWidth: "15%" }}
                onClick={handleJoinRoom}
              >
                Continue
              </Button>
            ) : (
              <></>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "280px",
              marginTop: "20px",
              flexDirection: "row",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "60%",
                height: "280px",
                padding: "0 20px",
                marginTop: "20px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40%",
                  height: "200px",
                  backgroundColor: "#D3D3D3",
                  padding: "5px",
                }}
              >
                <img
                  src={humanImage}
                  alt="User Profile"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="h5" textAlign="center">
                  {user?.name}
                </Typography>
              </Box>

              {matchUserName ? (
                <>
                  <Typography
                    variant="h5"
                    textAlign="center"
                    sx={{ color: "green" }}
                  >
                    Match found!
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "40%",
                      height: "200px",
                      backgroundColor: "#D3D3D3",
                      padding: "5px",
                    }}
                  >
                    <img
                      src={humanImage}
                      alt="User Profile"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                      }}
                    />
                    <Typography variant="h5" textAlign="center">
                      {matchUserName}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  {noMatchFound && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        width: "60%",
                        height: "200px",
                        marginLeft: 6,
                      }}
                    >
                      <Typography variant="h5" color="red">
                        No match found.
                      </Typography>
                    </Box>
                  )}
                  {isMatching && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        width: "60%",
                        height: "200px",
                        marginLeft: 6,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h5" color="#03b6fc">
                          Finding you a match...
                        </Typography>
                        <CircularProgress size={100} sx={{ marginTop: 2 }} />
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
            {matchUserName ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "280px",
                  marginTop: "20px",
                  flexDirection: "column",
                }}
              >
                <LabelValue label="User" value={matchUserName} />
                <LabelValue label="Proficiency Level" value="Expert" />
                <LabelValue label="Question" value="TwoSum" />
                <LabelValue label="Topic" value="Array" />
                <LabelValue label="Difficulty" value="Easy" />
              </Box>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MatchSelection;
