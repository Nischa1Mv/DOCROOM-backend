import mongoose from "mongoose";
import app from "./app.js";
import { PORT, mongoDBURL } from "./config.js";

const startServer = async () => {
    try {
        await mongoose.connect(mongoDBURL);
        console.log("✅ MongoDB connected successfully!");

        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1); // Stop server if DB fails
    }
};

startServer();
