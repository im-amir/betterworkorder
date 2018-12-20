let Order = require("../models/Order"),
    Client = require("../models/Client"),
    Technician = require("../models/Technician");

// all the middleare goes here
let middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    req.session.returnTo = req.path;
    res.redirect("/login");
}

module.exports = middlewareObj;