require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

// MySQL configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

// Test route
app.get('/', (req, res) => res.send('Pluggi Backend Running'));

// ==================== USERS ====================

// Signup
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO users (firstName, lastName, email, username, password) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, username, password]
    );
    await connection.end();
    res.status(201).json({ message: "User created successfully", userId: result.insertId });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Login
// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, username, firstName, lastName, email FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    await connection.end();

    if (rows.length > 0) {
      // Normalize the user object
      const user = rows[0];
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});


// Update user info
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, passport, username, hobbies } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE users SET firstName = ?, lastName = ?, passport = ?, username = ?, hobbies = ? WHERE id = ?',
      [firstName, lastName, passport, username, hobbies, id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// ==================== USERS ====================

// Get all users
app.get('/users', async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute(
    'SELECT id, username, firstName, lastName FROM users'
  );
  await connection.end();
  res.json({ users: rows });
});


// ==================== POSTS ====================

// Create a post
app.post("/posts", async (req, res) => {
  const { userId, activity, location, notes } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "INSERT INTO posts (userId, activity, location, notes) VALUES (?, ?, ?, ?)",
      [userId, activity, location, notes]
    );
    await connection.end();
    res.status(201).json({ success: true, postId: result.insertId });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Search posts
app.get('/search', async (req, res) => {
  const { type, query } = req.query;

  if (!type || !query) {
    return res.status(400).json({ error: "Missing type or query" });
  }

  let sql = "";
  let params = [`%${query}%`];

  try {
    const connection = await mysql.createConnection(dbConfig);

    if (type === "user") {
      sql = `
        SELECT p.id, u.username, p.activity, p.location, p.notes, p.createdAt
        FROM posts p
        JOIN users u ON p.userId = u.id
        WHERE u.username LIKE ?
      `;
    } else if (type === "activity") {
      sql = `
        SELECT p.id, u.username, p.activity, p.location, p.notes, p.createdAt
        FROM posts p
        JOIN users u ON p.userId = u.id
        WHERE p.activity LIKE ?
      `;
    } else if (type === "location") {
      sql = `
        SELECT p.id, u.username, p.activity, p.location, p.notes, p.createdAt
        FROM posts p
        JOIN users u ON p.userId = u.id
        WHERE p.location LIKE ?
      `;
    } else {
      return res.status(400).json({ error: "Invalid search type" });
    }

    const [rows] = await connection.execute(sql, params);
    await connection.end();

    res.json({ results: rows });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// ==================== CHATS ====================

// Send a chat message + create notification
app.post("/chats", async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1️⃣ Insert into chats table
    const [result] = await connection.execute(
      "INSERT INTO chats (senderId, receiverId, message) VALUES (?, ?, ?)",
      [senderId, receiverId, message]
    );

    // 2️⃣ Create notification for receiver
    await connection.execute(
      `INSERT INTO notifications (userId, senderId, chatId, message, isRead)
       VALUES (?, ?, ?, ?, FALSE)`,
      [receiverId, senderId, result.insertId, message]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      chatId: result.insertId,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});


// Fetch chats between two users


// ==================== NOTIFICATIONS ====================







// Fetch chats between two users and mark as read
app.get('/chats', async (req, res) => {
  const user1 = Number(req.query.user1); // current user
  const user2 = Number(req.query.user2); // chat partner

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Missing user IDs" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // 1. Fetch chat history
    const [rows] = await connection.execute(
      `SELECT c.id, c.senderId, c.receiverId, c.message, c.createdAt, 
              u.username AS senderName, c.isRead
       FROM chats c
       JOIN users u ON c.senderId = u.id
       WHERE (c.senderId = ? AND c.receiverId = ?)
          OR (c.senderId = ? AND c.receiverId = ?)
       ORDER BY c.createdAt ASC`,
      [user1, user2, user2, user1]
    );

    // 2. Mark partner → currentUser messages as read
    const [updateResult] = await connection.execute(
      `UPDATE chats 
       SET isRead = TRUE 
       WHERE receiverId = ? 
         AND senderId = ? 
         AND isRead = FALSE`,
      [user1, user2]
    );

    console.log("Marked messages as read:", updateResult.affectedRows);

    await connection.end();

    // 3. Return messages
    res.json({ messages: rows });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: err.message });
  }
});

// Send connection request
// Send connection request
app.post('/connections', async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Check if connection already exists
    const [existing] = await connection.execute(
      'SELECT * FROM connections WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)',
      [senderId, receiverId, receiverId, senderId]
    );

    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ error: "Connection already exists" });
    }

    // Insert connection
    const [result] = await connection.execute(
      'INSERT INTO connections (senderId, receiverId) VALUES (?, ?)',
      [senderId, receiverId]
    );

    // ✅ Create notification for the receiver
    await connection.execute(
      `INSERT INTO notifications (userId, senderId, chatId, message)
       VALUES (?, ?, NULL, ?)`,
      [receiverId, senderId, "sent you a connection request"]
    );

    await connection.end();
    res.status(201).json({ success: true, connectionId: result.insertId });
  } catch (err) {
    console.error("Connection error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update user location
app.put('/users/:id/location', async (req, res) => {
  const { id } = req.params;
  const { location } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE users SET location = ? WHERE id = ?',
      [location, id]
    );
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User location updated" });
  } catch (err) {
    console.error("Update location error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// ==================== NOTIFICATIONS ====================

// Add a notification
app.post('/notifications', async (req, res) => {
  const { userId, senderId, chatId, message } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      `INSERT INTO notifications (userId, senderId, chatId, message)
       VALUES (?, ?, ?, ?)`,
      [userId, senderId, chatId, message]
    );
    await connection.end();

    res.status(201).json({ success: true, notificationId: result.insertId });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Get all notifications for a user
app.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
  `SELECT n.id, n.userId, n.senderId, u.username, n.chatId, n.isRead, n.createdAt
   FROM notifications n
   JOIN users u ON n.senderId = u.id
   WHERE n.userId = ?
   ORDER BY n.createdAt DESC`,
  [userId]
);


    await connection.end();

    res.json({ notifications: rows });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notifications from a sender as read
app.put("/notifications/read", async (req, res) => {
  const { userId, senderId } = req.body;
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "UPDATE notifications SET isRead = TRUE WHERE userId = ? AND senderId = ?",
      [userId, senderId]
    );
    await connection.end();
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});












// ==================== START SERVER ====================
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
