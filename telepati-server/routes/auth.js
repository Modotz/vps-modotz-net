var express = require("express");
var router = express.Router();

const {
  signup,
} = require("../controllers/authController");

/* GET authentication page. */
router.get("/signin", function (req, res, next) {
  res.render("auth/signin", { layout: false, title: "Express" });
});

router.get("/signup", function (req, res, next) {
  res.render("auth/signup", { layout: false,  title: "Express" });
});

router.route("/signup").post(signup);

module.exports = router;
