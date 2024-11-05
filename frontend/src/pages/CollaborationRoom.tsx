import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { io, Socket } from "socket.io-client";
import { Editor } from "@monaco-editor/react";
import { Box, Typography, TextField, Button, List, ListItem, Paper, CircularProgress, InputLabel, FormControl, Select, MenuItem, SelectChangeEvent } from "@mui/material";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { toast } from "react-toastify";


const SOCKET_SERVER_URL = import.meta.env.VITE_WS_URL;

const CollaborativeEditor: React.FC = () => {
  const { user, token } = useAuth(); // Destructure token directly
  const { roomId } = useParams<{ roomId: string }>();
  const socketRef = useRef<Socket | null>(null);
  const [code, setCode] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ userName: string; message: string; timestamp: number }[]>([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the question object from location.state
  const { question } = location.state;
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    socketRef.current = io(SOCKET_SERVER_URL, {path: '/socket.io/collab'});

    // Retrieve the required data
    const userId = user.id; // Ensure the user object contains the userId
    const userName = user.name;
    const questionId = question._id || question.id; // Adjust based on your question object

    // Emit the join_collab event with all required data
    socketRef.current.emit(
      "join_collab",
      { roomId, userName, userId, questionId, token },
      (response: { success: boolean }) => {
        if (response.success) {
          setIsConnected(true);
          console.log(`Joined collaboration room: ${roomId}`);
        } else {
          console.error("Failed to join collaboration room");
        }
      }
    );

    // Listen for code updates
    socketRef.current.on("code_update", ({ code }: { code: string }) => {
      setCode(code);
    });

    socketRef.current.on("receive_message", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Handle when a user leaves the collaboration room
    socketRef.current.on(
      "leave_collab_notify",
      ({ userName }: { userName: string }) => {
        console.log(`User ${userName} left the collaboration room.`);
        toast.info(
          `User ${userName} left the collaboration room. Redirecting to match selection in 5s...`
        );

        setTimeout(() => navigate(`/matching`), 3000);
      }
    );

    socketRef.current.on("code_result", ({ output }: { output: string }) => {
      setIsLoading(false);
      setOutput(output !== "" ? output : "None");
      socketRef.current?.emit("code_execution_finished", { roomId });
    });

    socketRef.current.on("code_execution_started", () => {
      setIsLoading(true);
    });

    socketRef.current.on("code_execution_finished", () => {
      setIsLoading(false);
    });

    socketRef.current.on("change_language", ({ newLanguage }: { newLanguage: string }) => {
      setLanguage(newLanguage);
    });

    // Cleanup when the component unmounts
    return () => {
      cleanupCollaboration();
    };
  }, [roomId, user, navigate]);

  const handleEditorChange = (newCode: string | undefined) => {
    setCode(newCode || "");

    if (socketRef.current) {
      socketRef.current.emit("code_change", { roomId, code: newCode });
    }
  };

  const handleSendMessage = () => {
    if (socketRef.current && message.trim()) {
      const timestamp = Date.now();
      const chatMessage = { roomId, userName: user!!.name, message, timestamp: timestamp };
      setMessages((prevMessages) => [...prevMessages, chatMessage]);
      socketRef.current.emit("send_message", chatMessage);
      setMessage("");
    }
  };

  const handleLeaveRoom = () => {
    cleanupCollaboration();
    navigate("/matching"); // Redirect to match selection after leaving the room
  };

  const cleanupCollaboration = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave_collab", { roomId });
      socketRef.current.disconnect();
    }
  };

  const handleRunCode = async () => {
    if (socketRef.current) {
      setIsLoading(true);
      socketRef.current.emit("code_execution_started", { roomId });
      socketRef.current.emit("run_code", { roomId, code, language });
    }
  };

  const handleChangeLanguage = (event: SelectChangeEvent) => {
    const newLanguage = event.target.value as string;
    setLanguage(newLanguage);
    if (socketRef.current) {
      socketRef.current.emit("change_language", { roomId, newLanguage });
    }
  }

  return (
    <>
        <Header />
        <Box sx={{ display: "flex", height: "100vh", p: 2 }}>
        <Box sx={{ flex: 2, pr: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h4">{question.title}</Typography>
          <Button
            variant="contained"
            sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
            onClick={handleLeaveRoom}
          >
            Leave Collaboration
          </Button>
        </Box>
            <Typography variant="h6" color="textSecondary">
              Difficulty: {question.complexity}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
              {question.description}
            </Typography>

        <Typography variant="h6">Room ID: {roomId}</Typography>
        <Typography variant="h6">User: {user?.name}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}>
          <FormControl sx={{ width: '200px' }}>
            <InputLabel id="demo-simple-select-label">Language</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={language}
              label="Language"
              onChange={handleChangeLanguage}
            >
              <MenuItem value={"cpp"}>C++</MenuItem>
              <MenuItem value={"java"}>Java</MenuItem>
              <MenuItem value={"python"}>Python3</MenuItem>
              <MenuItem value={"c"}>C</MenuItem>
              <MenuItem value={"javascript"}>JavaScript</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isConnected ? (
          <>
            <Editor
              height="80vh"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
            />
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 2, mb: 2 }}
              onClick={handleRunCode}
              disabled={isLoading}
            >
              Run Code
            </Button>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 4, mb: 2 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Code is running...</Typography>
              </Box>
            ) : (
              output !== null && (
                <Box sx={{ mt: 2, mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 4, backgroundColor: "#f5f5f5" }}>
                  <Typography variant="h6">Output:</Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {output}
                  </Typography>
                </Box>
              )
            )}
          </>
        ) : (
          <Typography variant="h6" color="error">
            Connecting to the collaboration room...
          </Typography>
        )}
        {/* Chat Section */}
        <Box sx={{ flex: 1, p: 2, borderLeft: "1px solid #ccc" }}>
          <Typography variant="h5" gutterBottom>Chat</Typography>
          <Paper sx={{ height: "60vh", overflow: "auto", p: 2, mb: 2 }}>
            <List>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: msg.userName === user?.name ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "70%",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: msg.userName === user?.name ? "primary.main" : "grey.300",
                      color: msg.userName === user?.name ? "white" : "black",
                    }}
                  >
                    <Typography variant="body2">
                      {msg.userName === user?.name ? `You` : msg.userName} -{" "}
                      <Typography component="span" variant="caption" sx={{ fontSize: "0.75em" }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                    </Typography>
                    <Typography variant="body1">{msg.message}</Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ mt: 1 }}>
            Send
          </Button>
        </Box>
        </Box>
      </Box>
    </>
  );
};

export default CollaborativeEditor;