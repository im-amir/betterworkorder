let express = require("express"),
  router = express.Router(),
  User = require("../models/User"),
  middleware = require("../middleware"),
  passport = require("passport");

// Index Route
let path;
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index", {user: true});
  } else {
    res.render("index", {user: false});
  }
});

//Auth Routes
router.get("/register", function(req, res) {
    if (req.isAuthenticated()) {
        res.render("auth/register", {user: true});
    }else{
        res.render("auth/register", {user: false});
    }
});
router.post("/register", function(req, res) {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function(err, user) {
      if (err) {
        req.flash("error", err.message);
        return res.render("auth/register");
      }
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome to Work Order " + user.username);
        res.redirect("/orders");
      });
    }
  );
});

router.get("/login", function(req, res) {
    path = req.session.returnTo;
    if (req.isAuthenticated()) {
        res.render("auth/login", {user: true});
    }else{
        res.render("auth/login", {user: false});
    }
});

router.post(
    "/login",
    passport.authenticate("local"), function(req, res) {
        res.redirect(path || "/");
        delete req.session.returnTo;
    }
);
router.get("/logout", function(req, res, next) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/");
});

module.exports = router;
