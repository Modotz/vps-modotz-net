var express = require('express');
var router = express.Router();

const { index } = require("../controllers/usersController");

/* GET users page. */
router.route("/").get(index);

module.exports = router;
