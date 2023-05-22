var express = require('express');
var router = express.Router();

const {
  meet,
  startMeet,
  joinMeeting
} = require("../controllers/indexController");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { layout: false, title: 'Express' });
});

 router.route("/:id").get(startMeet);
// router.route("/meet").post(meet);
// router.route("/joinMeeting").post(joinMeeting);


module.exports = router;
