var express = require("express");
var router = express.Router();

const {
  getAll,
  getById,
  initMeeting,
} = require("../controllers/meetingsController");

router.route("/").get(getAll);
router.route("/:id").get(getById);
router.route("/initmeeting").post(initMeeting);

module.exports = router;
