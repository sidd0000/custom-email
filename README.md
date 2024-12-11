# Custom Mail Server

## Overview
This project is a custom mail server built with Node.js. It supports sending and receiving emails using industry-standard protocols (SMTP for sending, IMAP for receiving). Users can register, log in, and securely manage their email accounts.

---

## Features
- **Send Emails**: Send emails using the SMTP protocol.
- **Receive Emails**: Retrieve emails using the IMAP protocol.
- **User Authentication**: Secure registration and login with JWT-based authentication.
- **Secure Communication**: Emails are encrypted during transmission using TLS.
- **Database Integration**: User credentials are securely stored in MongoDB.

---

## Setup Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB setup)
- Two email accounts for testing (e.g., Gmail, Mailtrap)

### Environment Variables
Create a `.env` file with the following keys:

```env
PORT=5000
MONGO_URI=<Your MongoDB Connection URI>
JWT_SECRET=<Your JWT Secret>
SMTP_HOST=<SMTP Server Host>
SMTP_PORT=<SMTP Server Port>
SMTP_USER=<SMTP Username>
SMTP_PASS=<SMTP Password>
