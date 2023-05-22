var express = require("express");
var router = express.Router();

const { index } = require("../controllers/membersController");

/* GET members page. */
router.route("/").get(index);

module.exports = router;