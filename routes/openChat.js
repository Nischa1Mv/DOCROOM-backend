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
//sample response
// {
//     "messages": [
//         {
//             "sender": "bot",
//             "message": "Hello! I'm here to assist with your respiratory concerns. What symptoms are you currently experiencing?",
//             "timestamp": "2025-04-16T07:00:00.000Z",
//             "_id": "680009d0ea2a4587bfaceb67"
//         },
//         {
//             "sender": "patient",
//             "message": "I have a persistent cough for over a week, especially at night. I'm also wheezing a bit.",
//             "timestamp": "2025-04-16T07:01:15.000Z",
//             "_id": "680009d0ea2a4587bfaceb68"
//         },
//         {
//             "sender": "bot",
//             "message": "Thanks for sharing. Are you producing any phlegm or is it a dry cough?",
//             "timestamp": "2025-04-16T07:01:40.000Z",
//             "_id": "680009d0ea2a4587bfaceb69"
//         },
//         {
//             "sender": "patient",
//             "message": "Mostly dry, but occasionally there’s some white mucus.",
//             "timestamp": "2025-04-16T07:02:05.000Z",
//             "_id": "680009d0ea2a4587bfaceb6a"
//         },
//         {
//             "sender": "bot",
//             "message": "Do you have any history of asthma, allergies, or exposure to dust/smoke?",
//             "timestamp": "2025-04-16T07:02:30.000Z",
//             "_id": "680009d0ea2a4587bfaceb6b"
//         },
//         {
//             "sender": "patient",
//             "message": "Yes, I have dust allergy and mild asthma diagnosed years ago.",
//             "timestamp": "2025-04-16T07:02:55.000Z",
//             "_id": "680009d0ea2a4587bfaceb6c"
//         },
//         {
//             "sender": "bot",
//             "message": "Have you experienced any fever, chest pain, or breathlessness recently?",
//             "timestamp": "2025-04-16T07:03:20.000Z",
//             "_id": "680009d0ea2a4587bfaceb6d"
//         },
//         {
//             "sender": "patient",
//             "message": "Slight breathlessness when climbing stairs, but no fever or chest pain.",
//             "timestamp": "2025-04-16T07:03:45.000Z",
//             "_id": "680009d0ea2a4587bfaceb6e"
//         }
//     ],
//         "filterInfo": {
//         "startTime": "2025-04-16T07:00:00.000Z",
//             "endTime": "2025-04-16T19:55:04.982Z",
//                 "totalMessages": 8
//     }
// }