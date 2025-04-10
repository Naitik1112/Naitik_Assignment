const express = require("express");
const missionController = require("./../controllers/missionController");
const authController = require("../controllers/authContoller");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(missionController.getAllMissions)
  .post(missionController.createMission);

router
  .route("/user/")
  .get(missionController.getAllMissionsByUser)
  .post(missionController.adduserId, missionController.createMission);

router.route("/:missionId/:droneId").get(missionController.simulate);

router
  .route("/:id")
  .get(missionController.getMission)
  .patch(missionController.updateMission)
  .delete(missionController.deleteMission);

module.exports = router;
