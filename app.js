// app.js

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Vulnerable session configuration (weak session secret, no regeneration)
app.use(session({
  secret: 'vulnerable-secret',
  resave: true,
  saveUninitialized: true
}));

// Fake database for storing credentials
const fakeUsers = {
  'admin': 'password'
};

// Simple login form
app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form action="/login" method="post">
      Username: <input type="text" name="username"><br>
      Password: <input type="password" name="password"><br>
      <input type="submit" value="Login">
    </form>
  `);
});

// Vulnerable login logic (session fixation vulnerability)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (fakeUsers[username] === password) {
    req.session.user = username; // Session fixation issue: reusing an existing session ID
    res.redirect('/dashboard');
  } else {
    res.status(401).send('Authentication failed');
  }
});

// CSRF vulnerability: No token in the form submission
app.get('/form', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.send(`
    <h1>Submit Form</h1>
    <form action="/process" method="post">
      <input type="hidden" name="user" value="${req.session.user}">
      <input type="submit" value="Submit">
    </form>
  `);
});

// Vulnerable form processing (susceptible to CSRF attacks)
app.post('/process', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.send('Form data successfully processed');
});

// Dashboard page requiring login
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.send(`<h1>Welcome to the Dashboard, ${req.session.user}!</h1><a href="/form">Submit Form</a>`);
});

app.listen(3000, () => {
  console.log('Vulnerable app listening on http://localhost:3000');
});