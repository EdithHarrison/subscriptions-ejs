// /path/to/your/app.js

import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongoDBSession from 'connect-mongodb-session';
import connectFlash from 'connect-flash';
import passport from 'passport';
import passportInit from './passport/passportInit.js';
import csrf from 'host-csrf';
import storeLocals from './middleware/storeLocals.js';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './db/connect.js';
import sessionRoutes from './routes/sessionRoutes.js';
import auth from './middleware/auth.js';
import jobs from './routes/jobs.js';
import secretWordRouter from './routes/secretWord.js';

dotenv.config();

const app = express();
const MongoDBStore = connectMongoDBSession(session);

app.set('view engine', 'ejs');
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

// Add the Content-Type setting middleware here
app.use((req, res, next) => {
  if (req.path === "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});

let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV === 'test') {
  mongoURL = process.env.MONGO_URI_TEST;
}

const sessionStore = new MongoDBStore({
  uri: mongoURL,
  collection: 'mySessions',
});

sessionStore.on('error', function (error) {
  console.error(error);
});

const sessionParams = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { secure: false, sameSite: 'strict' },
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionParams.cookie.secure = true;
}

app.use(session(sessionParams));
app.use(connectFlash());

passportInit();
app.use(passport.initialize());
app.use(passport.session());

// CSRF protection setup using host-csrf
let csrf_development_mode = true;
if (app.get('env') === 'production') {
  csrf_development_mode = false;
}
const csrf_options = {
  protected_operations: ['POST', 'PUT', 'DELETE'],
  protected_content_types: ['application/x-www-form-urlencoded', 'text/plain', 'multipart/form-data'],
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

// Ensure the route exists
app.use('/sessions', sessionRoutes);

app.get('/multiply', (req, res) => {
  let result = req.query.first * req.query.second;
  if (isNaN(result)) {
    result = 'NaN';
  } else if (result == null) {
    result = 'null';
  }
  res.json({ result: result });
});

app.get('/', (req, res) => {
  res.render('index');
});

app.use('/jobs', auth, jobs);
app.use('/secretWord', auth, secretWordRouter);

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
    await connectDB(mongoURL);
    const serverInstance = app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
    return serverInstance;
  } catch (error) {
    console.error(error);
  }
};

const server = await start();

export { app, server };
