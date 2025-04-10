const Drone = require("./../models/droneModels");
const AppError = require("./../utils/appError");
const CatchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllDronesByUser = CatchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const drones = await Drone.find({ user: userId });

  res.status(200).json({
    status: "success",
    results: drones.length,
    data: {
      drones,
    },
  });
});

exports.adduserId = CatchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  next();
});

exports.getAllDrones = factory.getAll(Drone);

exports.getDrone = factory.getOne(Drone);
exports.createDrone = factory.createOne(Drone);
exports.updateDrone = factory.updateOne(Drone);
exports.deleteDrone = factory.deleteOne(Drone);
