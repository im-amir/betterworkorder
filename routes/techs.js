let express = require("express"),
  Technician = require("../models/Technician"),
  middleware = require("../middleware"),
  router = express.Router();

router.get("/technicians", middleware.isLoggedIn, (req, res) => {
  Technician.find({}, (err, technicians) => {
    if (err) {
      alert("Could not load technicians");
    }
    if (req.isAuthenticated()) {
      res.render("technicians/technicians", {
        technicians: technicians,
        user: true
      });
    } else {
      res.render("technicians/technicians", {
        technicians: technicians,
        user: false
      });
    }
  });
});

router.get("/technicians/new", middleware.isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    res.render("technicians/new", { user: true });
  } else {
    res.render("technicians/new", { user: false });
  }
});

router.post("/technicians/new", (req, res) => {
  const technicianObj = {
    company: req.body.company,
    email: req.body.email,
    contactPerson: req.body.contactPerson,
    phone: req.body.phone,
    address: req.body.address
  };
  Technician.create(technicianObj, (err, technician) => {
    if (err) {
      alert("Client Not Created");
    }
    res.redirect("/technicians");
  });
});
router.post("/technicians/delete", (req, res) => {
  Technician.findByIdAndRemove({_id: req.body.id}, (err) => {
    if (err){console.log(err)};
  })
})
module.exports = router;
