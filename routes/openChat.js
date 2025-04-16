import express from "express";
import Conversation from "../models/conversation.js";
import jwt from "jsonwebtoken"

const router = express.Router();

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
        req.user = jwt.verify(token, process.env.SECRET);
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id: patientId } = req.params;
        const { timeStampBegin, timeStampEnd } = req.query;
        const { id: doctorId } = req.user;

        if (!patientId || !timeStampBegin) {
            return res.status(400).json({ message: "Patient ID and start timestamp are required" });
        }

        const conversation = await Conversation.findOne({ patient: patientId, doctor: doctorId });

        if (!conversation) {
            return res.status(404).json({ message: "No conversations found" });
        }

        if (!Array.isArray(conversation.messages)) {
            return res.status(400).json({ message: "Conversation messages are not available or invalid." });
        }

        // Parse timestamps
        const startDate = new Date(timeStampBegin);
        const endDate = timeStampEnd ? new Date(timeStampEnd) : new Date();

        // Validate ISO 8601 format
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        if (!isoRegex.test(timeStampBegin)) {
            return res.status(400).json({ message: "Invalid timestamp format. Expected ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)" });
        }

        if (isNaN(startDate.getTime())) {
            return res.status(400).json({ message: "Invalid start timestamp format" });
        }

        // Filter messages
        const filteredMessages = conversation.messages.filter((message) => {
            try {
                const messageDate = new Date(message.timestamp);
                return messageDate >= startDate && messageDate <= endDate;
            } catch (err) {
                console.error("Error parsing message timestamp:", err);
                return false;
            }
        });

        // Sort messages by timestamp
        const sortedMessages = filteredMessages.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        return res.status(200).json({
            messages: sortedMessages,
            filterInfo: {
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                totalMessages: sortedMessages.length
            }
        });

    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});

export default router;