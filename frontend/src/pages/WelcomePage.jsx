import React from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoHeader from "../components/LogoHeader"; // import your logo

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Logo at the top */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
        }}
      >
        <LogoHeader />
      </Box>

      <Typography variant="h3" color="primary" gutterBottom>
        Welcome to PluggI
      </Typography>

      <Box mt={4} display="flex" flexDirection="column" gap={2} width="100%">
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={() => navigate("/login")}
        >
          Login
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          size="large"
          fullWidth
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </Button>
      </Box>
    </Container>
  );
}

export default WelcomePage;
