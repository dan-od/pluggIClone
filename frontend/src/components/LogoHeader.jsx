// src/components/LogoHeader.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const LogoHeader = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard"); // Navigate to dashboard
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#F59E0B", // PluggI Orange
        }}
      >
        P
      </Typography>
      <Typography
        variant="h6"
        sx={{
          ml: 1,
          color: "#16A34A", // PluggI Green
        }}
      >
        luggI
      </Typography>
    </Box>
  );
};

export default LogoHeader;
