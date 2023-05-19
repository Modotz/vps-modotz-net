var express = require("express");
var router = express.Router();

/* GET authentication page. */
router.get("/", function (req, res, next) {
  res.render("authentication/sigin", { title: "Express" });
});

router.get("/signup", function (req, res, next) {
  res.render("authentication/signup", { title: "Express" });
});

module.exports = router;
