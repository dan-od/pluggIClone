import React, { useState, useEffect } from "react";
import { Container, Box, Button, Typography, Badge, IconButton, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NotificationsIcon from '@mui/icons-material/Notifications'; // 🔔 bell
import axios from "axios";

function DashboardPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = currentUser.id;

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/notifications/${currentUserId}`);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenChat = (senderId, username) => {
    // ✅ mark notifications as read for this sender
    axios.put(`http://localhost:5000/notifications/read`, {
      userId: currentUserId,
      senderId: senderId
    }).then(() => fetchNotifications());

    navigate(`/chat/${username}`);
    handleClose();
  };

  const totalUnread = notifications.filter(n => !n.isRead).length;

  return (
    <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>

        {/* 🔔 Notifications Bell */}
        <IconButton onClick={handleBellClick}>
          <Badge color="error" badgeContent={totalUnread} invisible={totalUnread === 0}>
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {notifications.length === 0 ? (
            <MenuItem disabled>No notifications</MenuItem>
          ) : (
            notifications.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => handleOpenChat(n.senderId, n.username)}
              >
                {n.username} sent you a message
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>

      {/* Buttons */}
      <Box display="flex" flexDirection="column" gap={2} mt={4}>
        <Button variant="contained" color="primary" onClick={() => navigate("/dashboard")}>Home</Button>
        <Button variant="contained" color="secondary" fullWidth onClick={() => navigate("/find")}>Find</Button>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate("/post")}>Post</Button>
        <Button variant="outlined" color="primary" fullWidth onClick={() => navigate("/passport")}>Passport</Button>
        <Button variant="text" color="error" fullWidth onClick={() => { localStorage.removeItem("user"); navigate("/"); }}>Logout</Button>
      </Box>
    </Container>
  );
}

export default DashboardPage;
