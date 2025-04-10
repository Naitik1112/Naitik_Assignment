// defaultResources.js
module.exports = {
  defaultMissions: [
    {
      name: "Beginner Survey",
      title: "Practice Flight Pattern",
      waypoints: [
        { latitude: 12.9716, longitude: 77.5946, altitude: 50 },
        { latitude: 12.9726, longitude: 77.5956, altitude: 60 },
        { latitude: 12.9736, longitude: 77.5966, altitude: 70 },
      ],
    },
    {
      name: "Field Inspection",
      title: "Agricultural Survey",
      waypoints: [
        { latitude: 12.9746, longitude: 77.5976, altitude: 80 },
        { latitude: 12.9756, longitude: 77.5986, altitude: 90 },
        { latitude: 12.9766, longitude: 77.5996, altitude: 100 },
      ],
    },
    {
      name: "City Tour",
      title: "Urban Photography Mission",
      waypoints: [
        { latitude: 12.9776, longitude: 77.6006, altitude: 120 },
        { latitude: 12.9786, longitude: 77.6016, altitude: 120 },
        { latitude: 12.9796, longitude: 77.6026, altitude: 120 },
      ],
    },
    {
      name: "Mountain Recon",
      title: "High Altitude Survey",
      waypoints: [
        { latitude: 12.9806, longitude: 77.6036, altitude: 350 },
        { latitude: 12.9816, longitude: 77.6046, altitude: 380 },
        { latitude: 12.9826, longitude: 77.6056, altitude: 400 },
      ],
    },
  ],

  defaultDrones: [
    {
      name: "Starter Quad",
      description: "Beginner-friendly drone with basic camera",
      maxBattery: 120000, // 120 km range
      maxSpeed: 50, // km/h
      maxAltitude: 200,
    },
    {
      name: "Agricultural Scout",
      description: "Specialized for field surveys",
      maxBattery: 180000, // 180 km range
      maxSpeed: 40, // km/h
      maxAltitude: 150,
    },
    {
      name: "Urban Explorer",
      description: "Compact drone for city environments",
      maxBattery: 90000, // 90 km range
      maxSpeed: 70, // km/h
      maxAltitude: 300,
    },
    {
      name: "High-Altitude Pro",
      description: "Professional grade for mountain surveys",
      maxBattery: 240000, // 240 km range
      maxSpeed: 60, // km/h
      maxAltitude: 400,
    },
  ],
};
