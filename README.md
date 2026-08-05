# ParkWise — Smart Parking Management System

Real-time web-based parking management system built with Spring Boot 3 and React. Features WebSocket-powered live slot updates, JWT authentication, and role-based access control.

![Demo](docs/demo.gif)
<!-- Record a short GIF/screen capture of the live WebSocket updates + login flow and drop it here -->

## Overview

ParkWise lets users view live parking slot availability, reserve and release slots in real time, and automatically frees up slots after periods of inactivity. Admins get a full dashboard to manage slots and reservations. Built originally as a final project for SWEG3108 (Advanced Programming), then extended with production-grade concerns: environment-based configuration, JWT authentication, and a deployable architecture.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, SockJS, STOMP.js, Axios, React Router |
| Backend | Java 17, Spring Boot 3, Spring Security, Spring WebSocket |
| Database | MySQL 8 |
| Auth | JWT + BCrypt |

## Features

- Real-time slot availability updates via WebSocket
- JWT-based authentication with role separation (Admin / User)
- Reserve, cancel, and release parking slots
- Automatic slot release after 15 minutes of inactivity (scheduled job)
- Admin dashboard for full slot and reservation management
- Fee calculation based on parking duration (10 ETB/hour)
- Responsive dark-themed UI

## Architecture

React (SPA)
   │  REST (Axios) + STOMP over WebSocket
   ▼
Spring Boot API
   ├── Security layer — JWT filter, role-based access
   ├── Service layer — reservation logic, fee calculation
   ├── Scheduler — auto-releases inactive slots every 15 min
   └── Data layer — Spring Data JPA → MySQL


## Project Structure

AP_Parking_Management/
├── backend/                          Spring Boot application
│   ├── src/main/java/com/smartparking/
│   │   ├── config/                   WebSocket, Security, data init
│   │   ├── controller/                REST API controllers
│   │   ├── dto/                       Data transfer objects
│   │   ├── model/                     JPA entities
│   │   ├── repository/                Spring Data repositories
│   │   ├── scheduler/                 Auto-release scheduler
│   │   ├── security/                  JWT filter and utils
│   │   └── service/                   Business logic
│   └── src/main/resources/
│       ├── application.properties          shared/base config
│       ├── application-prod.properties      production (env-var driven)
│       └── application-local.properties     local dev (gitignored)
└── frontend/                          React application
    └── src/
        ├── api/                       Axios instance
        ├── components/                Navbar, shared UI
        ├── context/                   Auth context
        ├── hooks/                     WebSocket hook
        └── pages/                     Landing, Login, Register, Dashboard

## Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8+
- Node.js 18+ and npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AP_Parking_Management.git
cd AP_Parking_Management
```

### 2. Database setup

```sql
sudo mysql
CREATE USER 'parking_app'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON *.* TO 'parking_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Backend setup

```bash
cd backend
# create application-local.properties with your local DB credentials
# (see application-local.properties.example if provided)
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000` (frontend) and `http://localhost:8080` (backend API).

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register user |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/parking/slots` | None | Get all slots |
| POST | `/api/parking/slots` | Admin | Add slot |
| POST | `/api/parking/reserve` | User | Reserve slot |
| POST | `/api/parking/cancel/{id}` | User | Cancel reservation |
| POST | `/api/parking/release/{id}` | User | Release slot |
| GET | `/api/parking/reservations/all` | Admin | All reservations |

## Course Context

Originally built as a final project for SWEG3108 (Advanced Programming), demonstrating socket programming, multithreading, database design, and web application development — then extended beyond the assignment scope with proper environment-based configuration and a path to production deployment.

## License

This project was built for educational purposes as part of a university course. Not licensed for commercial reuse.
