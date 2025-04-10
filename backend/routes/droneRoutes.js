const express = require("express");
const droneController = require("./../controllers/droneController");
const authController = require("../controllers/authContoller");

const router = express.Router();

router.use(authController.protect);

router
  .route("/user/")
  .get(droneController.getAllDronesByUser)
  .post(droneController.adduserId, droneController.createDrone);

router
  .route("/")
  .get(droneController.getAllDrones)
  .post(droneController.createDrone);

router
  .route("/:id")
  .get(droneController.getDrone)
  .patch(droneController.updateDrone)
  .delete(droneController.deleteDrone);

module.exports = router;
