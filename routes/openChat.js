import express from "express";
import Conversation from "../models/conversation.js";
import jwt from "jsonwebtoken"

const router = express.Router();
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid or missing token." });
    }
    const token = bearerHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

// Get Conversations by Patient ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id: patientId } = req.params;
        const { timeStampBegin } = req.query;
        const { id: doctorId } = req.user;

        if (!patientId || !timeStampBegin) {
            return res.status(400).json({ message: "Patient ID and start timestamp are required" });
        }

        const conversation = await Conversation.find({ patient: patientId, doctor: doctorId })[0];


        if (!conversation) {
            return res.status(404).json({ message: "No conversations found" });
        }

        // filter the messages array in the conversation from start timestamp to end time stamp
        const filteredMessages = conversation.messages.filter((message) => {
            const messageTimestamp = new Date(message.timestamp).getTime();
            return messageTimestamp >= timeStampBegin;
        });

        // Return the filtered messages
        return res.status(200).json({ messages: filteredMessages });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});