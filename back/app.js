// The Express app: middleware and routes, but no database connection and no
// open port. index.js starts it for real; tests start it on a test database.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./router/router');
const { CLIENT_URLS } = require('./config');
const { getEmailStatus } = require('./utils/mailer');

const app = express();

// Behind a hosting proxy (Render, Railway, Heroku...) set TRUST_PROXY=1,
// otherwise the rate limiter sees the proxy's IP for every user.
if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

app.use(helmet());

// Hosting checks this to know the server is alive (Render "Health Check Path").
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected',
        email: getEmailStatus(),
    });
});

app.use(cors({
    origin: CLIENT_URLS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: '10kb' }));

app.use("/auth", authRouter);

app.use((err, req, res, next) => {
    // Client mistakes (broken JSON, body too large) keep their 4xx status.
    if (err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({ message: err.expose ? err.message : "Bad request" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
});

module.exports = app;
