const express = require("express");
require("express-async-errors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const connectFlash = require("connect-flash");
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const csrf = require("host-csrf");
const storeLocals = require("./middleware/storeLocals");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

// Security Middleware
app.use(helmet());
app.use(xss());
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again after an hour'
});
app.use(limiter);

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

// CSRF protection setup using host-csrf
let csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
}
const csrf_options = {
  protected_operations: ["POST", "PUT", "DELETE"],
  protected_content_types: ["application/x-www-form-urlencoded", "text/plain", "multipart/form-data"],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options);
app.use(csrf_middleware);

// Middleware to add CSRF token to locals
app.use((req, res, next) => {
  const token = csrf.token(req, res);
  if (token) {
    res.locals._csrf = token;
  }
  next();
});

app.use(storeLocals);

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/sessions", require("./routes/sessionRoutes"));

const auth = require("./middleware/auth");
const jobs = require("./routes/jobs");
app.use("/jobs", auth, jobs);

const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

// 404 Error handler
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// 500 Error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(500).send('Form tampered with.');
  } else {
    console.error(err);
    res.status(500).send(err.message);
  }
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