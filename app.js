const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// This is how we configure session.
// By default this session is in memory
// We could configure an add on module to store 
// them in the DB though.
app.use(session({
  secret: 'SSSSHHHHHH',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict'
  }
}));

const users = {
  testuser: 'password'
}

// Logs a user in
// Normall we would check the DB, but we are just using hardcoded users in this demo
app.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  console.log(req.body);
  if (users[username] && users[username] === password) {
    // We set this property in the session
    // This proves the user is logged in.
    // We normally might store the userid or username or 
    // other things in here.
    req.session.loggedIn = true;
    res.send({
      loggedIn: true,
      message: "Successfully Logged In"
    });
  } else {
    res.status(401).send({
      loggedIn: false,
      message: "Unauthorized"
    });
  }
  
});

// This is an authenticated route.
// We could probably move these checks into an authRequired middleware.
app.get('/authenticated', (req, res,next) => {
  if (!req.session.loggedIn) {
    res.status(401).send({
      loggedIn: false,
      message: "Unauthorized"
    });
    return;
  }
  res.send({
    loggedIn: true,
    message: "Congrats you can see this"
  });
});

// This logs the user out by destroying their session
app.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.send({
    loggedIn: false,
    message: 'Logged Out'
  });
});

module.exports = app;
