
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const imaps = require('imap-simple');
const fs = require('fs');


dotenv.config();

const app = express();
app.use(bodyParser.json());

let client;
let usersCollection;

// Connect to MongoDB Atlas
const connectToMongoDB = async () => {
    try {
        client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        const db = client.db('mailserver');
        usersCollection = db.collection('users');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Middleware for JWT Authentication
const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('Authorization header:', token); // Log the token for debugging

    if (!token) {
        return res.status(401).send('Access denied. Token is required.');
    }
    
    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Extract the token from 'Bearer <token>'
        req.user = verified;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error); // Log error for debugging
        res.status(400).send('Invalid token');
    }
};

// Routes

// User Registration Route
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ email, password: hashedPassword });
    res.send('User registered');
});


// User Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).send('Email and password are required');
        }

        // Find user in DB
        console.log('Searching for user with email:', email);
        const user = await usersCollection.findOne({ email });
        if (!user) {
            console.log('No user found with this email');
            return res.status(400).send('Invalid credentials');
        }

        // Compare password
        console.log('Comparing passwords...');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(400).send('Invalid credentials');
        }

        // Generate token
        console.log('Generating token...');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated:', token);

        res.json({ token });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send('Server error');
    }
});


// Send Email Route
app.post('/send', authenticate, async (req, res) => {
    const { to, subject, text } = req.body;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // Send email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            text,
        });
        res.send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});

// Retrieve Emails Route (For example, retrieving from Gmail IMAP)
app.get('/emails', authenticate, async (req, res) => {
    console.log("Request to /emails received");

    const config = {
        imap: {
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            timeout: 10000, // Set a timeout to prevent hanging connections
        },
    };

    try {
        console.log("Connecting to IMAP server...");
        const connection = await imaps.connect(config);
        console.log("Connected to IMAP server");

        await connection.openBox('INBOX');
        console.log("Inbox opened");

        // Retrieve emails SINCE the last 1 year for optimization
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 356);
        console.log(`Fetching emails since: ${sinceDate.toISOString()}`);

        const messages = await connection.search(['ALL', ['SINCE', sinceDate.toISOString()]], {
            bodies: ['HEADER'], // Fetch only headers
            struct: true,
        });

        console.log(`Found ${messages.length} messages`);

        const emailList = messages.map((msg) => {
            const headers = msg.parts.find(part => part.which === 'HEADER').body;
            return {
                subject: headers.subject ? headers.subject[0] : 'No Subject',
                from: headers.from ? headers.from[0] : 'Unknown Sender',
                date: headers.date ? headers.date[0] : 'Unknown Date',
            };
        });

        console.log(`Returning ${emailList.length} emails`);
        res.json(emailList);
    } catch (error) {
        console.error('Error retrieving emails:', error);
        res.status(500).send('Error retrieving emails');
    }
});

// Start Server
const startServer = async () => {
    await connectToMongoDB();
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
};

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    if (client) await client.close();
    process.exit(0);
});

startServer();
