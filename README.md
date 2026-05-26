# ParkWise — Smart Parking Management System

## Overview
Brief description: real-time web-based parking management system
built with Spring Boot 3 and React. Features WebSocket-powered
live slot updates, JWT authentication, and role-based access.

## Tech Stack
Table with:
- Frontend: React, SockJS, STOMP.js, Axios, React Router
- Backend: Java 17, Spring Boot 3, Spring Security, Spring WebSocket
- Database: MySQL 8
- Auth: JWT + BCrypt

## Features
- Real-time slot availability updates via WebSocket
- JWT-based authentication with role separation (Admin/User)
- Reserve, cancel, and release parking slots
- Automatic slot release after 15 minutes of inactivity
- Admin dashboard with full slot and reservation management
- Fee calculation based on parking duration (10 ETB/hour)
- Responsive dark luxury UI

## Project Structure
AP_Parking_Management/
├── backend/          Spring Boot application
│   ├── src/main/java/com/smartparking/
│   │   ├── config/       WebSocket, Security, Data init
│   │   ├── controller/   REST API controllers
│   │   ├── dto/          Data transfer objects
│   │   ├── model/        JPA entities
│   │   ├── repository/   Spring Data repositories
│   │   ├── scheduler/    Auto-release scheduler
│   │   ├── security/     JWT filter and utils
│   │   └── service/      Business logic
│   └── src/main/resources/
│       └── application.properties.example
└── frontend/         React application
    └── src/
        ├── api/          Axios instance
        ├── components/   Navbar
        ├── context/      Auth context
        ├── hooks/        WebSocket hook
        └── pages/        Landing, Login, Register, Dashboard

## Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8+
- Node.js 18+
- npm

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/AP_PArking_Management.git
cd AP_PArking_Management

### 2. Database setup
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';
FLUSH PRIVILEGES;
EXIT;

### 3. Backend setup
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Edit application.properties and set your MySQL password
mvn clean install
mvn spring-boot:run

### 4. Frontend setup (development)
cd frontend
npm install
npm start

### 5. Production build
chmod +x deploy.sh
./deploy.sh
# Opens at http://localhost:8080

## Default Accounts (auto-created on first run)
| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin123 |
| User  | demo     | demo123  |

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | None | Register user |
| POST | /api/auth/login | None | Login |
| GET | /api/parking/slots | None | Get all slots |
| POST | /api/parking/slots | Admin | Add slot |
| POST | /api/parking/reserve | User | Reserve slot |
| POST | /api/parking/cancel/{id} | User | Cancel reservation |
| POST | /api/parking/release/{id} | User | Release slot |
| GET | /api/parking/reservations/all | Admin | All reservations |

## Course Context
Built as a final  project for SWEG3108 Advanced Programming.
Demonstrates: Sockets, Threads,
Databases,  Web Programming,
Functional Programming.
