const path = require("path");
const express = require("express");
const morgan = require("morgan");
const favicon = require("serve-favicon");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const passport = require("passport");
const session = require("express-session");

const AppError = require("./utils/appError");
const missionRouter = require("./routes/missionRoutes");
const droneRouter = require("./routes/droneRoutes");
const userRouter = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.use(favicon(path.join(__dirname, "../client/public/favicon.ico")));

// Passport configuration
require("./controllers/passport");

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Register Google auth routes
app.use("/", authRoutes);

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5000"], // Allow multiple origins
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Handle preflight requests
app.options("*", cors());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Request time middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use("/api/v1/users", userRouter);

app.use("/api/v1/mission", missionRouter);

app.use("/api/v1/drone", droneRouter);

// 404 Handler
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
