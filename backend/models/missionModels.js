const mongoose = require("mongoose");

// Point schema with altitude validation
const pointSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  altitude: {
    type: Number,
    required: true,
    min: 0,
    max: 400, // Maximum altitude constraint
    validate: {
      validator: function (value) {
        return value <= 400;
      },
      message: "Altitude must be 400 meters or below",
    },
  },
});

// Haversine distance (in meters)
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

// Distance calculator
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

// Mission schema with waypoints altitude validation
const missionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A mission must have a name"],
  },
  title: {
    type: String,
    required: [true, "A mission should have a title"],
  },
  waypoints: {
    type: [pointSchema],
    validate: [
      {
        validator: function (points) {
          return points.every((p) => p.altitude <= 400);
        },
        message: "All waypoints must have altitude of 400 meters or below",
      },
      {
        validator: function (points) {
          const seen = new Set();
          for (const p of points) {
            const key = `${p.latitude},${p.longitude},${p.altitude}`;
            if (seen.has(key)) return false;
            seen.add(key);
          }
          return true;
        },
        message: "Waypoints must not contain duplicate coordinates",
      },
    ],
  },
  total_distance: {
    type: Number,
    required: true,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Pre-save hooks to calculate distance and validate altitude
missionSchema.pre("save", function (next) {
  // Validate all waypoints are within altitude limit
  const invalidPoints = this.waypoints.filter((wp) => wp.altitude > 400);
  if (invalidPoints.length > 0) {
    const err = new Error(
      `Waypoints exceed maximum altitude: ${invalidPoints
        .map((p) => p.altitude)
        .join(", ")}`
    );
    return next(err);
  }

  this.total_distance = calculateTotalDistance(this.waypoints);
  next();
});

// For findOneAndUpdate operations
missionSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.waypoints) {
    // Check altitude for new waypoints
    const invalidPoints = update.waypoints.filter((wp) => wp.altitude > 400);
    if (invalidPoints.length > 0) {
      const err = new Error(
        `Waypoints exceed maximum altitude: ${invalidPoints
          .map((p) => p.altitude)
          .join(", ")}`
      );
      return next(err);
    }

    const totalDistance = calculateTotalDistance(update.waypoints);
    this.setUpdate({
      ...update,
      total_distance: totalDistance,
    });
  }
  next();
});

const Mission = mongoose.model("Mission", missionSchema);

module.exports = Mission;
