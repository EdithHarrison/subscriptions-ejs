const express = require("express");
require("express-async-errors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const connectFlash = require("connect-flash");
const passport = require("passport");
const passportInit = require("./passport/passportInit");
require("dotenv").config(); 

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const url = process.env.MONGO_URI;
const sessionStore = new MongoDBStore({
  uri: url,
  collection: "mySessions",
});

sessionStore.on("error", function (error) {
  console.error(error); 
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); 
  sessionParams.cookie.secure = true; 
}

app.use(session(sessionParams));
app.use(connectFlash());

passportInit();
app.use(passport.initialize());
app.use(passport.session());


const storeLocals = require("./middleware/storeLocals");
app.use(storeLocals);

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

const auth = require("./middleware/auth");
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

// 404 Error handler
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// 500 Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
