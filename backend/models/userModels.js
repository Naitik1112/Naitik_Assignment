const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const {
  defaultMissions,
  defaultDrones,
} = require("./../utils/defaultResources.js");
const Mission = require("./missionModels.js");
const Drone = require("./droneModels.js");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A user should have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "user.jpg",
  },
  role: {
    type: String,
    enum: ["user", "institution", "admin"],
    default: "user",
  },
  password: {
    type: String,
    // required: [true, 'Password is required'],
    // minlength: 8,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  googleId: String,
  passwordConfirm: {
    type: String,
    // required: [true, 'Confirm the password'],
    // validate: {
    //   validator: function(el) {
    //     return el === this.password;
    //   },
    //   message: 'Passwords must be the same'
    // }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (angle) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTotalDistance(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    total += haversineDistance(
      wp1.latitude,
      wp1.longitude,
      wp2.latitude,
      wp2.longitude
    );
  }
  return total;
}

// Pre-save hook for password hashing and handling Google login
userSchema.pre("save", async function (next) {
  // If the user is being created via Google, skip password and passwordConfirm
  if (this.googleId) {
    this.password = undefined; // Do not require password for Google OAuth login
    this.passwordConfirm = undefined; // Skip password confirmation for Google OAuth
    return next(); // Skip further processing for password
  }

  // Only hash the password if it's being modified
  if (!this.isModified("password")) return next();

  // Hash the password if it's being modified or set
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // Remove passwordConfirm after hashing
  next();
});

// Pre-save hook to update passwordChangedAt field if password is changed
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.post("save", async function (user, next) {
  try {
    // Create default missions
    const missionPromises = defaultMissions.map((mission) =>
      Mission.create({
        ...mission,
        user: user._id,
        total_distance: calculateTotalDistance(mission.waypoints),
      })
    );

    // Create default drones
    const dronePromises = defaultDrones.map((drone) =>
      Drone.create({
        ...drone,
        user: user._id,
        photo: "default.jpg",
      })
    );

    await Promise.all([...missionPromises, ...dronePromises]);
    next();
  } catch (err) {
    next(err);
  }
});

// Query middleware to only find active users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if password has changed after JWT issuance
userSchema.methods.changedPasswordAfter = function (JWTTimesstamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimesstamp < changedTimestamp;
  }
  return false;
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
