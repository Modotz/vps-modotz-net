var express = require('express');
var router = express.Router();

const {
  meet,
} = require("../controllers/index_controller");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.route("/meet").post(meet);

module.exports = router;
