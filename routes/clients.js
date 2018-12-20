let express = require("express"),
  Client = require("../models/Client"),
  middleware = require("../middleware"),
  router = express.Router();

router.get("/clients",middleware.isLoggedIn, (req, res) => {
  Client.find({}, (err, clients) => {
    if (err) {
      alert("Could not load clients");
    }
    if (req.isAuthenticated()) {
      res.render("clients/clients", { clients: clients, user: true });
    } else {
      res.render("clients/clients", { clients: clients, user: false });
    }
  });
});

router.get("/clients/new", middleware.isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    res.render("clients/new", { user: true });
  } else {
    res.render("clients/new", { user: false });
  }
});

router.post("/clients/new", (req, res) => {
  const clientObj = {
    company: req.body.company,
    email: req.body.email,
    contactPerson: req.body.contactPerson,
    phone: req.body.phone,
    address: req.body.address
  };
  Client.create(clientObj, (err, client) => {
    if (err) {
      alert("Client Not Created");
    }
    res.redirect("/clients");
  });
});
router.post("/clients/delete", (req, res) => {
  Client.findByIdAndRemove({_id: req.body.id}, (err) => {
    if (err){console.log(err)};
  })
})
module.exports = router;
