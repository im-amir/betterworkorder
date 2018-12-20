let express = require("express"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  path = require("path"),
  multer = require("multer"),
  busboyBodyParser = require("busboy-body-parser"),
  passport = require("passport"),
  passportLocal = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  flash = require("connect-flash"),
  auth = require("./routes/auth"),
  clients = require("./routes/clients"),
  Order = require("./models/Order"),
  Client = require("./models/Client"),
  Technician = require("./models/Technician"),
  User = require("./models/User"),
  moment = require("moment"),
  nodemailer = require("nodemailer"),
  xoauth2 = require('xoauth2')
  techs = require("./routes/techs"),
  middleware = require("./middleware"),
  app = express();

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

// Init Upload
const upload = multer({
  storage: storage
}).single("pdfFile");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(busboyBodyParser());

// Database Connect
var url = process.env.DATABASEURL || "mongodb://localhost/better_work_order";
mongoose.connect(url);

// Authentication

app.use(
  require("express-session")({
    secret: "Muhammad Amir",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use(function(req, res, next) {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// Routes

app.use(auth);
app.use(clients);
app.use(techs);

app.get("/orders", middleware.isLoggedIn, (req, res) => {
  Order.find({}, (err, orders) => {
    if (err) {
      alert("Could not load orders");
    }
    if (req.isAuthenticated()) {
      res.render("orders/orders", {
        orders: orders,
        user: true
      });
    } else {
      res.render("orders/orders", {
        orders: orders,
        user: false
      });
    }
  });
});

app.get("/orders/new", middleware.isLoggedIn, (req, res) => {
    Client.find({}, (err, clients) => {
        if (err) {
            console.log("Clients not found");
        }
        Technician.find({}, (err, techs) => {
            if (err) {
                console.log("Technicians not found");
            }
            if (req.isAuthenticated()) {
                res.render("orders/new", {
                    clients: clients,
                    technicians: techs,
                    user: true
                });
            } else {
                res.render("orders/new", {
                    clients: clients,
                    technicians: techs,
                    user: false
                });
            }
        });
    });
});
let currentOrder;
let currentClient;
let currentTech;

app.post("/orders/new", middleware.isLoggedIn, (req, res) => {
  const _MS_PER_DAY = 1000 * 60;
  let start = new Date(req.body.start);
  let stop = new Date(req.body.stop);
  var hours = Math.abs(stop - start) / 36e5;
  let hoursMinStr = hours.toString();
  let minutes =
    parseFloat(
      "0." +
        hoursMinStr.substring(hoursMinStr.indexOf(".") + 1, hoursMinStr.length)
    ) * 60;
  let orderObj = {
    title: req.body.title,
    start: req.body.start,
    stop: req.body.stop,
    Services: req.body.services,
    Recommendations: req.body.recommendations,
    Notes: req.body.notes,
    PartsAndMaterials: req.body.partsMaterials,
    totalHours: Math.round(hours),
    totalMinutes: Math.round(minutes),
    dateNow: moment().format("MMMM Do YYYY, h:mm:ss a")
  };

  if (req.body.clientCheck === "on") {
    Client.find({ _id: req.body.clientSelect }, (err, client) => {
      if (err) {
        console.log("client err");
        console.log(err);
      }
      currentClient = client;
      if (req.body.techCheck === "on") {
        Technician.find({ _id: req.body.techSelect }, (err2, tech) => {
          if (err2) {
            console.log("tech err");
            console.log(err2);
          }
          currentTech = tech;

          Order.create(orderObj, (err3, order) => {
            if (err3) {
              console.log("Not Created");
              console.log(err3);
            }
            currentOrder = order;
            res.redirect("/review");
          });
        });
      } else {
        Technician.create(
          {
            company: req.body.techCompany,
            email: req.body.techEmail,
            contactPerson: req.body.techContactPerson,
            phone: req.body.techPhone,
            address: req.body.techAddress
          },
          (err, tech) => {
            if (err) {
              console.log("error line 130");
            }
            currentTech = tech;
            Order.create(orderObj, (err3, order) => {
              if (err3) {
                console.log("Not Created");
                console.log(err3);
              }
              currentOrder = order;
              res.redirect("/review");
            });
          }
        );
      }
    });
  } else {
    Client.create(
      {
        company: req.body.clientCompany,
        email: req.body.clientEmail,
        contactPerson: req.body.clientContactPerson,
        phone: req.body.clientPhone,
        address: req.body.clientAddress
      },
      (err, client) => {
        if (err) {
          console.log("error line 130");
        }
        currentClient = client;
        if (req.body.techCheck === "on") {
          Technician.find({ _id: req.body.techSelect }, (err2, tech) => {
            if (err2) {
              console.log("tech err");
              console.log(err2);
            }
            currentTech = tech;

            Order.create(orderObj, (err3, order) => {
              if (err3) {
                console.log("Not Created");
                console.log(err3);
              }
              currentOrder = order;
              res.redirect("/review");
            });
          });
        } else {
          Technician.create(
            {
              company: req.body.techCompany,
              email: req.body.techEmail,
              contactPerson: req.body.techContactPerson,
              phone: req.body.techPhone,
              address: req.body.techAddress
            },
            (err, tech) => {
              if (err) {
                console.log("error line 130");
              }
              currentTech = tech;
              Order.create(orderObj, (err3, order) => {
                if (err3) {
                  console.log("Not Created");
                  console.log(err3);
                }
                currentOrder = order;
                res.redirect("/review");
              });
            }
          );
        }
      }
    );
  }
});
app.post("/orders/delete", (req, res) => {
    Order.findByIdAndRemove({_id: req.body.id}, (err) => {
        if (err){console.log(err)};
    })
})

app.get("/review", middleware.isLoggedIn, (req, res) => {
  let currentClient1;
  if (!currentClient[0]) {
    currentClient1 = currentClient;
    currentClient = currentClient1;
  } else {
    currentClient1 = currentClient[0];
    currentClient = currentClient1;
  }
  let currentTech1;
  if (!currentTech[0]) {
    currentTech1 = currentTech;
    currentTech = currentTech1;
  } else {
    currentTech1 = currentTech[0];
    currentTech = currentTech1;
  }
  if (req.isAuthenticated()) {
    res.render("reviewData", {
      currentOrder: currentOrder,
      currentClient: currentClient,
      currentTech: currentTech,
      user: true
    });
  } else {
    res.render("reviewData", {
      currentOrder: currentOrder,
      currentClient: currentClient,
      currentTech: currentTech,
      user: false
    });
  }
});

app.get("/sendEmail", middleware.isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    res.render("sendEmail", {
      user: true
    });
  } else {
    res.render("sendEmail", {
      user: false
    });
  }
});

app.post("/sendEmail", middleware.isLoggedIn, (req, res) => {
  let receiveList = [];
  receiveList.push(currentClient.email);
  let email2 = req.body.techCheck === "on" ? currentTech.email : "";
  if (email2 !== "") {
    receiveList.push(email2);
  }
  if (req.body.anotherEmail) {
    receiveList.push(req.body.anotherEmail);
  }
  let receivers = "";
  receiveList.forEach(receiver => {
    receivers = receivers + receiver + ",";
  });
  receivers = receivers.substring(0, receivers.length - 1);
  upload(req, res, err => {
    if (err) {
      res, render("/sendEmail", { currentOrder: currentOrder });
    } else {
      const output = `
      <p>App Name: Work Order</p>
      <p>Attached you will find the data collected by Form from your users.</p>
    `;

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: 'OAuth2',
                user: "im.amir107@gmail.com",
                clientId: '794334359277-k2e4j0lg9d0pk43e76qj6ubkra0pvmrv.apps.googleusercontent.com',
                clientSecret: 'ki4rlkGvSzhNa28iYWNZ15Bt',
                refreshToken: '1/Kfp1gn_Pn0RHTCdLom9T63ThbzK_RTZjBjSqYiEBOonMMhWH5aVmbil7QLXt2Pmw'
            },
        // tls: {
        //   rejectUnauthorized: false
        // }
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: 'Work Order <im.amir107@gmail.com>', // sender address
        to: receivers, // list of receivers
        subject: "Work Order Contact", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
        attachments: [
          {
            // utf-8 string as an attachment
            filename: `${req.body.title}.pdf`,
            content: req.files.pdfFile.data
          }
        ]
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.redirect("/");
      });
    }
  });
});

const PORT = process.env.PORT || 8888;

app.listen(PORT, function() {
  console.log("Listening");
});
