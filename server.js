const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Store subscribers (in-memory for simplicity; use a database in production)
let subscribers = [];

// Nodemailer transporter configuration for Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Subscribe endpoint
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }
    if (subscribers.includes(email)) {
        return res.status(400).json({ message: 'Email already subscribed' });
    }
    subscribers.push(email);
    res.status(200).json({ message: 'Subscribed successfully' });
});

// Send newsletter endpoint
app.post('/api/send-newsletter', (req, res) => {
    const { subject, content } = req.body;
    if (!subject || !content) {
        return res.status(400).json({ message: 'Subject and content are required' });
    }

    const mailOptions = {
        from: `"The Reel Life" <${process.env.GMAIL_USER}>`,
        subject: subject,
        html: content // Send as HTML
    };

    // Send email to all subscribers
    const sendPromises = subscribers.map(email => {
        return transporter.sendMail({ ...mailOptions, to: email })
            .catch(err => ({ email, error: err.message }));
    });

    Promise.all(sendPromises)
        .then(results => {
            const errors = results.filter(result => result && result.error);
            if (errors.length > 0) {
                res.status(500).json({ message: 'Some emails failed to send', errors });
            } else {
                res.status(200).json({ message: `Newsletter sent to ${subscribers.length} subscribers` });
            }
        })
        .catch(err => {
            res.status(500).json({ message: 'Failed to send newsletter', error: err.message });
        });
});

// Get subscribers (for admin viewing)
app.get('/api/subscribers', (req, res) => {
    res.status(200).json({ subscribers });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
