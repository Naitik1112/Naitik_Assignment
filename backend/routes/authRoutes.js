const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authContoller");

const router = express.Router();

// Google Signup (Default)
router.get(
  "/google",
  authController.confirm,
  passport.authenticate("google-signup", {
    scope: ["profile", "email"],
  }),
  authController.confirm
);

// Google Login (Only for existing users)
router.get(
  "/google/login",
  passport.authenticate("google-login", {
    scope: ["profile", "email"],
  })
);

// Google Signup Callback
router.get(
  "/google/callback",
  authController.confirm,
  passport.authenticate("google-signup", {
    failureRedirect: `${process.env.backend_url}/signin`,
  }),
  authController.confirm,
  authController.googleCallback
);

// Google Login Callback (Login Only)
router.get(
  "/google/login/callback",
  passport.authenticate("google-login", {
    failureRedirect: `${process.env.frontend_url}/login`,
    failureMessage: true,
  }),
  authController.googleCallback
);

module.exports = router;
