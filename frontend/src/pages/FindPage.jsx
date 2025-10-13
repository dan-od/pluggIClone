// src/pages/FindPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function FindPage() {
  const [searchType, setSearchType] = useState("user");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null); // store lat/lng
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Load current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
      setLocation(user.location || "");
      if (user.lat && user.lng) {
        setCoords({ lat: user.lat, lng: user.lng });
      }
    }
  }, []);

  // Save location & coords to DB
  const handleSaveLocation = async () => {
  if (!location || !currentUser) {
    return alert("⚠️ Please enter or detect your location first!");
  }

  try {
    const response = await fetch(
      `http://localhost:5000/users/${currentUser.id}/location`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }), // only send location
      }
    );

    const data = await response.json();
    if (response.ok) {
      const updatedUser = { ...currentUser, location };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      alert("✅ Location updated successfully!");
    } else {
      console.error("Error saving location:", data);
      alert("❌ Failed to update location");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("❌ Failed to connect to server");
  }
};

  // Detect location via browser
const handleUseCurrentLocation = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // store coords in frontend state
        setCoords({ lat: latitude, lng: longitude });

        // store as simple comma string for DB
        const coordsString = `${latitude},${longitude}`;
        setLocation(coordsString); // this is what will be saved in DB
      },
      (err) => {
        console.warn("Geolocation denied:", err.message);
        alert("❌ Location permission denied. Please enter manually.");
      }
    );
  } else {
    alert("❌ Geolocation not supported by your browser.");
  }
};

  // Search handler
  const handleSearch = async () => {
    if (!query) return alert("Please enter a search query!");
    try {
      const response = await fetch(
        `http://localhost:5000/search?type=${searchType}&query=${query}`
      );
      const data = await response.json();
      if (response.ok) {
        setResults(data.results || []);
      } else {
        console.error("Search failed:", data.message || data.details);
      }
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

  const handleChat = (user) => {
    navigate(`/chat/${user.username}`);
  };


  // Helper: Haversine formula to calculate distance between two coords
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

const handleConnect = async (user) => {
  if (!currentUser?.location) return alert("⚠️ Please set your location first!");
  if (!user?.location) return alert("⚠️ This user has not set a location!");

  const [lat1, lng1] = currentUser.location.split(",").map(Number);
  const [lat2, lng2] = user.location.split(",").map(Number);
  const distance = getDistanceKm(lat1, lng1, lat2, lng2);

  if (distance > 0.2) {
    return alert("❌ You can only connect with users in the same location!");
  }

  try {
    const response = await fetch("http://localhost:5000/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentUser.id, receiverId: user.id }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(`✅ Invitation sent to ${user.username}`);
    } else {
      alert(`❌ Failed: ${data.error}`);
    }
  } catch (err) {
    console.error("Connect error:", err);
    alert("❌ Failed to send invitation");
  }
};


  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Find
      </Typography>

      {/* Location setup (always visible) */}
      <Box mb={3} textAlign="center">
        <Typography variant="h6" gutterBottom>
          Set Your Location (Coordinates)
        </Typography>
        <TextField
          label="Your Coordinates (lat, lng)"
          value={location}
          fullWidth
          disabled // prevent typing cities
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
          <Button variant="outlined" onClick={handleUseCurrentLocation}>
            Use Current Location
          </Button>
          <Button variant="contained" onClick={handleSaveLocation}>
            Save Location
          </Button>
        </Stack>
      </Box>

      {/* Search buttons */}
      <Box display="flex" gap={2} justifyContent="center" mb={3}>
        <Button
          variant={searchType === "user" ? "contained" : "outlined"}
          onClick={() => setSearchType("user")}
        >
          Search by User
        </Button>
        <Button
          variant={searchType === "activity" ? "contained" : "outlined"}
          onClick={() => setSearchType("activity")}
        >
          Search by Activity
        </Button>
        <Button
          variant={searchType === "location" ? "contained" : "outlined"}
          onClick={() => setSearchType("location")}
        >
          Search by Location
        </Button>
      </Box>

      {/* Search input */}
      <TextField
        label={`Enter ${searchType}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSearch} fullWidth>
        Search
      </Button>

      {/* Results */}
      <Grid container spacing={2} mt={3}>
        {results.length === 0 ? (
          <Typography textAlign="center" mt={3}>
            No results yet
          </Typography>
        ) : (
          results.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.username}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Activity:</strong> {item.activity || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {item.location || "N/A"}
                  </Typography>
                  {item.lat && item.lng && (
                    <Typography variant="body2">
                      <strong>Coords:</strong> {item.lat}, {item.lng}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>Notes:</strong> {item.notes || "N/A"}
                  </Typography>
                  <Typography variant="caption" display="block" mt={1}>
                    Posted at: {new Date(item.createdAt).toLocaleString()}
                  </Typography>

                  {/* Action buttons */}
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => handleChat(item)}
                    >
                      Chat
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      fullWidth
                      onClick={() => alert("📞 Call feature coming soon!")}
                    >
                      Call
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={() => alert("🎥 Video Call feature coming soon!")}
                    >
                      Video Call
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      onClick={() => handleConnect(item)}
                    >
                      Connect
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default FindPage;
