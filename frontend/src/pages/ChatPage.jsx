// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ChatPage() {
  const { receiverUsername } = useParams();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [receiverIdNum, setReceiverIdNum] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = currentUser.id || null;

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUserId) navigate("/login");
  }, [currentUserId, navigate]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users");
        setAllUsers(res.data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  // Map receiver username to numeric ID
  useEffect(() => {
    if (!receiverUsername || allUsers.length === 0) return;

    const receiverUser = allUsers.find(
      (u) => u.username?.trim().toLowerCase() === receiverUsername.trim().toLowerCase()
    );

    console.log("Searching for username:", receiverUsername);
    console.log("All users:", allUsers);
    console.log("Found receiver:", receiverUser);

    if (!receiverUser) {
      setError(`User "${receiverUsername}" not found.`);
      setReceiverIdNum(null);
      return;
    }

    if (receiverUser.id === currentUserId) {
      setError("You cannot chat with yourself.");
      setReceiverIdNum(null);
      return;
    }

    setReceiverIdNum(receiverUser.id);
    setError(""); // clear errors
  }, [allUsers, receiverUsername, currentUserId]);

  // Scroll to bottom
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Fetch chat history
  const fetchMessages = async () => {
    if (!currentUserId || !receiverIdNum) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/chats?user1=${currentUserId}&user2=${receiverIdNum}`
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages.");
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [currentUserId, receiverIdNum]);

  // Send a message
  const sendMessage = async () => {
    if (!input.trim() || !currentUserId || !receiverIdNum) return;

    const newMessage = {
      senderId: currentUserId,
      receiverId: receiverIdNum,
      message: input,
      id: Date.now(),
      senderName: currentUser.username || "You",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      await axios.post("http://localhost:5000/chats", {
        senderId: currentUserId,
        receiverId: receiverIdNum,
        message: newMessage.message,
      });
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h5" mb={2}>
        Chat with {receiverUsername || "Unknown User"}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box
        sx={{
          height: "60vh",
          overflowY: "auto",
          mb: 2,
          border: "1px solid #ccc",
          p: 2,
          borderRadius: 2,
          bgcolor: "#f9f9f9",
        }}
      >
        <List>
          {messages.map((msg) => (
            <ListItem
              key={msg.id}
              sx={{ justifyContent: msg.senderId === currentUserId ? "flex-end" : "flex-start" }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: msg.senderId === currentUserId ? "#16A34A" : "#E5E5E5",
                  color: msg.senderId === currentUserId ? "white" : "black",
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                {msg.message}
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={!receiverIdNum || !!error} // disable if no receiver
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!input.trim() || !receiverIdNum || !!error}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
}

export default ChatPage;
