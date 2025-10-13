import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  // Update form data on input change
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Store the full user object including 'id' in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage(`✅ Login successful! Welcome ${data.user.username}`);

        // Redirect to dashboard after short delay
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage(`❌ ${data.message || "Login failed"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
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
        onSubmit={handleLogin}
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>

        <Button
          variant="text"
          color="secondary"
          fullWidth
          onClick={() => navigate("/forgot-password")}
          sx={{ mt: 1 }}
        >
          Forgot Password
        </Button>
      </Box>

      {message && (
        <Typography
          color={message.startsWith("✅") ? "green" : "error"}
          sx={{ mt: 2, textAlign: "center" }}
        >
          {message}
        </Typography>
      )}
    </Container>
  );
}

export default LoginPage;
