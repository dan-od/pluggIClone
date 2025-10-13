-- Drop tables if they exist
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS connections;

DROP TABLE IF EXISTS users;


SET FOREIGN_KEY_CHECKS = 0;
SET FOREIGN_KEY_CHECKS = 1;
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  hobbies TEXT,
  location VARCHAR(255),
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6)
);

-- Posts table
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  activity VARCHAR(255),
  location VARCHAR(255),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Chats table
CREATE TABLE chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (receiverId) REFERENCES users(id)
);
SELECT id, username FROM users;


-- Notifications table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,              -- who receives the notification
  senderId INT NOT NULL,            -- who triggered it
  chatId INT NULL,                  -- nullable for non-chat notifications
  message TEXT,                     -- notification text
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (chatId) REFERENCES chats(id),
  INDEX idx_notifications_userId (userId)
);


-- Connections table
CREATE TABLE connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (receiverId) REFERENCES users(id)
);
ALTER TABLE notifications ADD COLUMN message TEXT;

DROP TABLE IF EXISTS notifications;


ALTER TABLE notifications
  ADD COLUMN senderId INT NOT NULL AFTER userId,
  ADD COLUMN chatId INT NULL,
  ADD COLUMN message TEXT,
  ADD CONSTRAINT fk_sender FOREIGN KEY (senderId) REFERENCES users(id);

