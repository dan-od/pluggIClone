// src/components/Navbar.jsx
import React from "react";
import { AppBar, Toolbar } from "@mui/material";
import LogoHeader from "./LogoHeader";

const Navbar = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <LogoHeader />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
