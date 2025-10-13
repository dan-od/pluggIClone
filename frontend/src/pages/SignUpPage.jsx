import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("✅ User created successfully!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setMessage(`❌ Error: ${data.error || data.details || "Signup failed"}`);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("❌ Failed to connect to backend");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Sign Up</Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
          <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
          <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <TextField label="Username" name="username" value={formData.username} onChange={handleChange} required />
          <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary">Sign Up</Button>
        </Box>
      </form>
      {message && (
        <Typography color={message.startsWith("✅") ? "green" : "error"} sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Container>
  );
}

export default SignUpPage;
