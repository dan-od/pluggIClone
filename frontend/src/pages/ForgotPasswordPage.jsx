// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.user);
      } else {
        setMessage(data.message || "❌ User does not exist");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setMessage("❌ Failed to connect to backend");
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Forgot Password
        </Typography>

        <TextField
          label="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Retrieve
        </Button>
      </Box>

      {message && (
        <Typography color="error" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}

      {result && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="h6">✅ Account Found</Typography>
          <Typography>Username: {result.username}</Typography>
          <Typography>Password: {result.password}</Typography>

          <Button
            variant="contained"
            color="success"
            sx={{ mt: 2 }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        </Box>
      )}

      {message && (
        <Button
          variant="outlined"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </Button>
      )}
    </Container>
  );
}

export default ForgotPasswordPage;
