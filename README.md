# Custom Mail Server

## Overview
This project is a custom mail server built with Node.js. It supports sending and receiving emails using industry-standard protocols (SMTP for sending, IMAP for receiving). Users can register, log in, and securely manage their email accounts. The server uses JWT for authentication, and emails are encrypted during transmission using TLS.

---

## Features
Send Emails: Send emails using the SMTP protocol.
Receive Emails: Retrieve emails using the IMAP protocol.
User Authentication: Secure registration and login with JWT-based authentication.
Secure Communication: Emails are encrypted during transmission using TLS.
Database Integration: User credentials are securely stored in MongoDB.


---

## Setup Guide
Prerequisites
Node.js (v14 or higher)
MongoDB Atlas account (or local MongoDB setup)

Step 1: Clone the Repository
git clone https://github.com/sidd0000/custom-email.git
npm install

:Step 1: Setting Up MongoDB Atlas
Create a MongoDB Atlas Account

Go to MongoDB Atlas and sign up for an account.
Create a New Cluster:

Follow the instructions on the dashboard to create a free cluster.
Create a Database:

After your cluster is set up, create a new database called mailserver.
Create a Database User:

In the Database Access section, create a new user with a strong password. Note down the username and password.
Obtain the MongoDB Connection URI: in env

Go to Connect > Connect your application.
Copy the connection string and replace <password> with the database user's password.

### Environment Variables
Create a `.env` file with the following keys:

```env


# MongoDB Atlas Connection URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mailserver?retryWrites=true&w=majority

# JWT Secret (Used for authentication tokens)
JWT_SECRET=<Your JWT Secret>

# SMTP Settings for Sending Emails
SMTP_HOST=smtp.gmail.com        # For Gmail. 
SMTP_PORT=587                   # For Gmail
SMTP_USER=<your_email@gmail.com> # Your Gmail address 
SMTP_PASS=<your_google_app_password> # Your Gmail App Password
```
<username> and <password>: Your MongoDB Atlas database username and password.
<Your JWT Secret>: A secure string for JWT token generation.
<your_email@gmail.com>: Your Gmail address or Mailtrap username.
<your_google_app_password>: The App Password generated in the Google Account
## API ENDPOINTS

Register User:

POST /register
Request body: { email, password }
Registers a new user.
Login User:

POST /login
Request body: { email, password }
Returns a JWT token upon successful login.
Send Email:

POST /send
Headers: Authorization: Bearer <JWT Token>
Request body: { to, subject, text }
Sends an email using the SMTP server.
Retrieve Emails:

GET /emails
Headers: Authorization: Bearer <JWT Token>
Retrieves emails using the IMAP protocol (fetches emails since the last 356 days).
 FOR TESTING THIS , OPEN POSTMAN OR THUNDERCLIENT , PUT THE PORT ADDRESS AND TEST ON THE API POINTS 
###TROUBLESHOOTING
Troubleshooting
Ensure that your SMTP settings (host, port, username, and password) are correct.
Make sure 2-Step Verification and App Passwords are correctly configured for Gmail if using Gmail for SMTP.
Double-check your MongoDB URI and credentials.
For local development, consider using Mailtrap for capturing emails sent through the SMTP server without actually sending them.

