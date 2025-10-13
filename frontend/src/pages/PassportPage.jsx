import React, { useState, useEffect } from "react";
import { Container, Box, Typography, Avatar, Button, TextField } from "@mui/material";

function PassportPage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    passport: "",
    username: "",
    hobbies: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setFormData({
        firstName: parsedUser.firstName,
        lastName: parsedUser.lastName,
        passport: parsedUser.passport || "",
        username: parsedUser.username,
        hobbies: parsedUser.hobbies || "",
      });
    }
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, passport: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setMessage("❌ User ID missing, please log in again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Profile updated successfully");
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setMessage(`❌ ${data.message || data.details || "Update failed"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Failed to update profile");
    }
  };

  if (!user) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="error">
          ❌ No user found. Please login.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Profile Page
      </Typography>

      <Box display="flex" justifyContent="center" mb={3}>
        <Avatar
          src={formData.passport}
          alt="Passport"
          sx={{ width: 120, height: 120, border: "2px solid #1976d2" }}
        />
      </Box>

      <Button variant="contained" component="label">
        Upload Passport Picture
        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
      </Button>

      <Box mt={4} textAlign="left">
        <TextField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Hobbies / Interests"
          name="hobbies"
          value={formData.hobbies}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
      </Box>

      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSave}>
        Save Changes
      </Button>

      {message && (
        <Typography sx={{ mt: 2 }} color={message.startsWith("✅") ? "green" : "error"}>
          {message}
        </Typography>
      )}
    </Container>
  );
}

export default PassportPage;
