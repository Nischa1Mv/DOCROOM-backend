import express from "express";

const router = express.Router();

// Test route to check if the server is running
router.get("/test", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});
export default router;