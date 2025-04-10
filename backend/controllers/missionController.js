const Mission = require("./../models/missionModels");
const AppError = require("./../utils/appError");
const Drone = require("./../models/droneModels");
const CatchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllMissionsByUser = CatchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const missions = await Mission.find({ user: userId });

  res.status(200).json({
    status: "success",
    results: missions.length,
    data: {
      missions,
    },
  });
});

exports.adduserId = CatchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  next();
});

exports.simulate = CatchAsync(async (req, res, next) => {
  const { droneId, missionId } = req.params;

  // 1. Fetch drone and mission
  const drone = await Drone.findById(droneId);
  if (!drone) {
    return res.status(404).json({
      status: "fail",
      message: "Drone not found",
    });
  }

  const mission = await Mission.findById(missionId);
  if (!mission) {
    return res.status(404).json({
      status: "fail",
      message: "Mission not found",
    });
  }

  // 2. Validate waypoint altitudes
  const invalidWaypoints = mission.waypoints.filter(
    (wp) => wp.altitude > drone.maxAltitude
  );

  if (invalidWaypoints.length > 0) {
    const firstInvalid = invalidWaypoints[0];
    return res.status(200).json({
      status: "fail",
      canComplete: false,
      reason: `Waypoint at ${firstInvalid.latitude},${firstInvalid.longitude} exceeds drone's maximum altitude. 
              This drone can fly up to ${drone.maxAltitude}m only, but waypoint is at ${firstInvalid.altitude}m.`,
      invalidWaypoints: invalidWaypoints.map((wp) => ({
        latitude: wp.latitude,
        longitude: wp.longitude,
        waypointAltitude: wp.altitude,
        droneMaxAltitude: drone.maxAltitude,
      })),
    });
  }

  // 3. Calculate distance (using pre-calculated total_distance if available)
  const distance =
    mission.total_distance || calculateTotalDistance(mission.waypoints);

  // 4. Convert maxSpeed from km/h to m/s for calculations
  const speedMps = drone.maxSpeed * (1000 / 3600);

  // 5. Calculate time and battery usage
  const timeSeconds = distance / speedMps;
  const timeMinutes = timeSeconds / 60;
  const batteryUsed = (distance / drone.maxBattery) * 100;
  const canComplete = batteryUsed <= 100;

  // 6. Handle insufficient battery case
  if (!canComplete) {
    return res.status(200).json({
      status: "fail",
      canComplete: false,
      reason: `Insufficient battery. This drone can travel ${
        drone.maxBattery
      }m maximum at single full charge, 
              but the mission requires ${distance.toFixed(
                2
              )}m (${batteryUsed.toFixed(2)}% battery).`,
      requiredDistance: parseFloat(distance.toFixed(2)),
      maxPossibleDistance: drone.maxBattery,
      batteryDeficit: parseFloat((distance - drone.maxBattery).toFixed(2)),
    });
  }

  // 7. Successful simulation response
  return res.status(200).json({
    status: "success",
    canComplete,
    batteryUsed: parseFloat(batteryUsed.toFixed(2)),
    timeMinutes: parseFloat(timeMinutes.toFixed(2)),
    totalDistanceMeters: parseFloat(distance.toFixed(2)),
    maxAltitudeCheck: "All waypoints are within safe altitude limits",
    droneSpecs: {
      maxAltitude: drone.maxAltitude,
      maxSpeed: drone.maxSpeed,
      maxBattery: drone.maxBattery,
    },
  });
});

// Helper function to calculate total distance if not pre-calculated
function calculateTotalDistance(waypoints) {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    total += Math.sqrt(
      Math.pow(end.latitude - start.latitude, 2) +
        Math.pow(end.longitude - start.longitude, 2) +
        Math.pow(end.altitude - start.altitude, 2)
    );
  }
  return total;
}

exports.getAllMissions = factory.getAll(Mission);
exports.getMission = factory.getOne(Mission);
exports.createMission = factory.createOne(Mission);
exports.updateMission = factory.updateOne(Mission);
exports.deleteMission = factory.deleteOne(Mission);
