# Vulnerable Sample Application
This is a simplified Node.js application with intentional vulnerabilities related to session fixation and CSRF.

**Note that this sample is for educational purposes and should not be used in production.**

## Objective  
Use this application to analyze vulnerability to session fixation or Cross-Site Request Forgery (CSRF). You can then implement appropriate fixes to resolve these issues and improve the application's overall security.

## Key Vulnerabilities:

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
