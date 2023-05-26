var express = require("express");
var router = express.Router();

const {
  initMeeting,
} = require("../controllers/indexController");

/* GET home page. */
router.get("/", function (req, res, next) {
  var locals = {
    title: "Telepati",
    description: "Meeting wong jowo",
    pages: "index",
  };
  res.render("index", { layout: false, locals });
});

router.route("/initmeeting").post(initMeeting);

module.exports = router;
