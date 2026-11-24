require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./router/router');
const cors = require('cors');
const helmet = require('helmet');
const { CLIENT_URLS } = require('./config');

const PORT = process.env.PORT || 5000;

const app = express();

// Behind a hosting proxy (Render, Railway, Heroku...) set TRUST_PROXY=1,
// otherwise the rate limiter sees the proxy's IP for every user.
if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

app.use(helmet());

// Hosting checks this to know the server is alive (Render "Health Check Path").
app.get('/health', (req, res) => {
    res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' });
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

const start = async () => {
    try {
        if (!process.env.DB_URL) {
            throw new Error("DB_URL is not set in .env");
        }
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new Error("JWT_ACCESS_SECRET is not set in .env");
        }

        await mongoose.connect(process.env.DB_URL);

        console.log("✅ MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}, accepting requests from: ${CLIENT_URLS.join(', ')}`);
        });

    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

start();
