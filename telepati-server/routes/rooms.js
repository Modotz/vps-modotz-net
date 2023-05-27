var express = require("express");
var router = express.Router();

const {
  meet,
  startMeeting,
  joinMeeting,
} = require("../controllers/roomController");

router.route("/meet").get(meet);

router.route("/:id").get(startMeeting);

router.route("/joinMeeting").post(joinMeeting);

module.exports = router;
