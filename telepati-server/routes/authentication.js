var express = require("express");
var router = express.Router();

const {
  signup,
} = require("../controllers/authentication_controller");

/* GET authentication page. */
router.get("/", function (req, res, next) {
  res.render("authentication/sigin", { title: "Express" });
});

router.get("/signup", function (req, res, next) {
  res.render("authentication/signup", { title: "Express" });
});

router.route("/signup").post(signup);

module.exports = router;
