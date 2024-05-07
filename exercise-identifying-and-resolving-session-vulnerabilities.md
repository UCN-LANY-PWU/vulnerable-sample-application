# Exercise 2
**Identifying and Resolving Session Vulnerabilities**
 
## Objective  
In this exercise, you'll analyze a Node.js web application vulnerable to session fixation or Cross-Site Request Forgery (CSRF). You'll then implement appropriate fixes to resolve these issues and improve the application's overall security.

## Description  
Your task is to examine a sample Node.js application and identify existing vulnerabilities related to session management. Specifically, focus on session fixation or CSRF vulnerabilities. After identifying the issues, you'll implement fixes to make the application more secure.

## Instructions  

1. **Setting Up the Environment:**
   - Clone or download the sample vulnerable application [here](https://github.com/UCN-LANY-PWU/vulnerable-sample-application/tree/main).  
   - Make sure you have Node.js installed and the required packages (`express`, `express-session`, `body-parser`, `crypto`, etc.) using `npm install`.

2. **Identify Session Fixation or CSRF Vulnerabilities:**
   - **Session Fixation:**  
     - Investigate whether the application accepts a session ID from the URL, hidden fields, or headers.
     - Check if the session ID remains the same after login, even if it was initially known to the attacker.
   - **CSRF Vulnerability:**  
     - Review whether state-changing actions (e.g., form submissions, profile updates) are protected by anti-CSRF tokens.
     - Check if session cookies have the `SameSite` attribute set to "Lax" or "Strict."

3. **Implement Fixes:**
   - **Session Fixation:**  
     - Regenerate the session ID immediately after user login using `req.session.regenerate`:
     ```js
     app.post('/login', (req, res) => {
       // User authentication logic...
       if (isAuthenticated(req.body.username, req.body.password)) {
         req.session.regenerate((err) => {
           if (err) {
             return res.status(500).send('Error regenerating session');
           }
           req.session.user = req.body.username;
           res.redirect('/dashboard');
         });
       } else {
         res.status(401).send('Authentication failed');
       }
     });
     ```
   - **CSRF Protection:**  
     - Use a CSRF protection library like `csurf` to secure forms and state-changing actions:
     ```js
     const csrf = require('csurf');
     const csrfProtection = csrf({ cookie: true });
     const bodyParser = require('body-parser');

     app.use(bodyParser.urlencoded({ extended: false }));
     app.use(csrfProtection);

     app.get('/form', csrfProtection, (req, res) => {
       // Include the CSRF token in the form
       res.render('send', { csrfToken: req.csrfToken() });
     });

     app.post('/process', csrfProtection, (req, res) => {
       // Handle the form submission securely
       res.send('Form data successfully processed');
     });
     ```
   - **SameSite Cookie Attribute:**  
     - Set the `SameSite` attribute to "Strict" or "Lax" in session cookies:
     ```js
     app.use(session({
       secret: 'my-secure-secret',
       resave: false,
       saveUninitialized: false,
       cookie: {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'Strict' // or 'Lax'
       }
     }));
     ```

4. **Test Your Solution:**
   - **Session Fixation Mitigation:**  
     - Attempt to log in using an attacker-known session ID and verify that a new session ID is generated after successful login.
   - **CSRF Mitigation:**  
     - Submit forms without the CSRF token or with an incorrect token and verify that the server rejects such requests.
   - **SameSite Cookie:**  
     - Test cross-origin requests to ensure that cookies are not sent inappropriately.

## Documentation
1. Prepare your completed solution and upload it into a GitHub repository.
2. Write a brief report explaining your design choices for secure session ID generation and configuration.

Feel free to experiment with additional security improvements not covered here, as long as the core vulnerabilities are addressed.

---

## Appendix A

Here's a simplified Node.js application with intentional vulnerabilities related to session fixation and CSRF. Note that this sample is for educational purposes and should not be used in production.

**Vulnerable Sample Application (Node.js):**

1. **Setup Instructions:**
   - Create a new project directory and initialize it with `npm init`.
   - Install the required packages with `npm install express express-session body-parser`.

2. **Vulnerable Application Code:**
   - Create a file named `app.js` and add the following code:

```js
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
```

**Key Vulnerabilities:**

1. **Session Fixation:**
   - The session ID remains the same before and after user login, allowing attackers to predefine a session ID and access it after the user logs in.

2. **CSRF:**
   - No CSRF token is included in the form submission, making it susceptible to unauthorized actions.

3. **Secure Configuration Issues:**
   - The session secret is weak, and secure flags for cookies are not set.

**Instructions:**
1. Run the application using `node app.js`.
2. Access `http://localhost:3000/login` to see the login form.
3. After authentication, proceed to the form page (`/form`) or dashboard to identify vulnerabilities.

Use this vulnerable application as a baseline for the exercise "Identifying and Resolving Session Vulnerabilities," and implement the necessary fixes to resolve the identified issues.