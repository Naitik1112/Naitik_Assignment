const mongoose = require("mongoose");

const droneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A Drone must have a name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "A Drone should have an Description"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  maxBattery: {
    type: Number,
    required: [true, "A Drone should have an battery"],
  },
  maxSpeed: {
    type: Number,
    reuqired: [true, "A drone should have an max speed"],
  },
  maxAltitude: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Drone = mongoose.model("Drone", droneSchema);

module.exports = Drone;
