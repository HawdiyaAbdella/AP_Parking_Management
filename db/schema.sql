CREATE DATABASE IF NOT EXISTS parking_management;
USE parking_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL
);

CREATE TABLE IF NOT EXISTS slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_name VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED') NOT NULL DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    slot_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    status ENUM('ACTIVE', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (slot_id) REFERENCES slots(slot_id)
);

INSERT IGNORE INTO users (id, username, password, role)
VALUES
(1, 'admin', 'admin123', 'ADMIN'),
(2, 'user', 'user123', 'USER');

INSERT IGNORE INTO slots (slot_id, slot_name, status)
VALUES
(1, 'A1', 'AVAILABLE'),
(2, 'A2', 'AVAILABLE'),
(3, 'A3', 'AVAILABLE'),
(4, 'B1', 'AVAILABLE'),
(5, 'B2', 'AVAILABLE'),
(6, 'B3', 'AVAILABLE');
