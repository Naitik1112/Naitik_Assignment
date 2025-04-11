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

---

## 🌐 Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React (TypeScript) + Vite          |
| Backend  | Node.js + Express                  |
| Database | MongoDB                            |
| Tools    | Postman, Google Maps API (if used) |

---

## 🚀 Getting Started

### 🔧 Backend Setup

```bash
cd backend
npm install
npm start

cd frontend
npm install
npm run dev
```

cd frontend
npm install
npm run dev

```

```
