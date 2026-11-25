// Entry point (npm start): read .env, connect to MongoDB, open the port.
// .env must be loaded first: the other files read process.env when they load.
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const { CLIENT_URLS } = require('./config');

const PORT = process.env.PORT || 5000;

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
