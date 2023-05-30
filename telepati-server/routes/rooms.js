var express = require("express");
var router = express.Router();

const {
  meet,
  meet2,
  startMeeting,
  joinMeeting,
} = require("../controllers/roomController");

router.route("/meet").get(meet);
router.route("/meet2").get(meet2);

router.route("/:id").get(startMeeting);

router.route("/joinMeeting").post(joinMeeting);

module.exports = router;
