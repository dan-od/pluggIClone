import React, { useState, useEffect } from "react";
import { Container, Box, TextField, Button, Typography } from "@mui/material";

function PostPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    activity: "",
    location: "",
    notes: "",
  });
  const [message, setMessage] = useState("");

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle "Use Current Location"
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `${position.coords.latitude}, ${position.coords.longitude}`;
          setFormData({ ...formData, location: loc });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setMessage("❌ Unable to fetch location");
        }
      );
    } else {
      setMessage("❌ Geolocation not supported");
    }
  };

  // Save post to backend
  const handleSave = async () => {
    if (!user) {
      setMessage("❌ User not logged in");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user.id }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Post saved successfully");
      } else {
        setMessage(`❌ ${data.message || data.details || "Save failed"}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage("❌ Failed to save post");
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          ❌ Please log in to create a post
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        New Post
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Current Activity"
          name="activity"
          value={formData.activity}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          fullWidth
        />
        <Button variant="outlined" onClick={handleUseLocation}>
          Use Current Location
        </Button>

        <TextField
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
        />

        

        <Button variant="contained" color="secondary" onClick={handleSave}>
          Post
        </Button>

        {message && (
          <Typography
            sx={{ mt: 2 }}
            color={message.startsWith("✅") ? "green" : "error"}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default PostPage;
