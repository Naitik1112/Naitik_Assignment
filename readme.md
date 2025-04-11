# 🚁 Drone Mission Planner

A full-stack MERN application for managing drones, creating missions, validating flight parameters, and simulating mission execution.

---

## 📦 Features

- ✈️ **CRUD Operations** for Drones and Missions
- ✅ **Validations**:
  - Prevents mission creation if any two waypoints are the same
  - Rejects missions with waypoints having altitude > 400m
- 🔋 **Simulation Engine**:
  - Select a drone and mission
  - Checks battery sufficiency
  - Displays battery usage and time taken if feasible
  - If not feasible, shows required battery for successful execution
- **MAPBOX Api Implemtented**:
  - To get the latitude and longitude of the selected location
- **Authentication**:
  -Implemented OAuth and JWT authentication
---



## 🌐 Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React (TypeScript) + Vite          |
| Backend  | Node.js + Express                  |
| Database | MongoDB                            |
| Tools    | Postman, Mapbox API , OAuth 2.0 |

---

## 🚀 Getting Started

### 🔧 Project Setup

```bash
cd backend
npm install
npm start
```

```bash
cd frontend
npm install
npm run dev

```

### 🔧 Required ENV for backend

```bash
NODE_ENV=development # or production
DATABASE_USER=<your-database-username>
PORT=5000
DATABASE=<your-database-name>
DATABASE_LOCAL=<your-local-database-name>
DATABASE_PASSWORD=<your-database-password>

JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES=30d
JWT_COOKIE_EXPIRES_IN=7

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=<your-google-callback-url>
GOOGLE_CALLBACK_URL_LOGIN=<your-google-login-callback-url>

SESSION_SECRET=<your-session-secret>

frontend_url=<url-for-frontend>
backend_url=<url-for-backend>
```


### 🔧 Required ENV for frontend

```bash
VITE_FRONTEND_URL=<url-for-frontend>
VITE_BACKEND_URL=<url-for-backend>
```

