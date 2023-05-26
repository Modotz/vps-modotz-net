var express = require("express");
var router = express.Router();

const {
  startMeeting,
  joinMeeting,
} = require("../controllers/roomController");


router.route("/:id").get(startMeeting);

router.route("/joinMeeting").post(joinMeeting);

module.exports = router;
