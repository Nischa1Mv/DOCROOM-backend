import express from "express";

const app = express();

// Test route to check if the server is running
app.get("/test", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});
export default app;