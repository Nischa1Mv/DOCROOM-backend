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
        req.user = jwt.verify(token, process.env.SECRET);
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

// Get Conversations by Patient ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id: patientId } = req.params;
        const { id: doctorId } = req.user;

        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        const conversation = await Conversation.findOne({ patient: patientId, doctor: doctorId });
        const messages = conversation.messages;

        return res.status(200).json({
            message: "Messages fetched successfully",
            messages,
        });

    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
// // Example response structure
// {
//     "message": "Messages fetched successfully",
//     "messages": [
//         {
//             "sender": "patient",
//             "message": "I have a severe headache and fever.",
//             "timestamp": "2025-04-03T10:30:00.000Z",
//             "_id": "67eecdad7937a752082bfd45"
//         },
//         {
//             "sender": "bot",
//             "message": "Noted. Do you have any other symptoms?",
//             "timestamp": "2025-04-03T10:31:00.000Z",
//             "_id": "67eecdad7937a752082bfd46"
//         },
//         {
//             "sender": "patient",
//             "message": "Yes, I also feel dizzy sometimes.",
//             "timestamp": "2025-04-03T10:32:00.000Z",
//             "_id": "67eecdad7937a752082bfd47"
//         },
//         {
//             "sender": "patient",
//             "message": "I have a severe headache and fever.",
//             "timestamp": "2025-04-03T10:30:00.000Z",
//             "_id": "67eecddc70925ff807d332a7"
//         },
//         {
//             "sender": "bot",
//             "message": "Noted. Do you have any other symptoms?",
//             "timestamp": "2025-04-03T10:31:00.000Z",
//             "_id": "67eecddc70925ff807d332a8"
//         },
//         {
//             "sender": "patient",
//             "message": "Yes, I also feel dizzy sometimes.",
//             "timestamp": "2025-04-03T10:32:00.000Z",
//             "_id": "67eecddc70925ff807d332a9"
//         },
//         {
//             "sender": "patient",
//             "message": "I have a severe headache and fever.",
//             "timestamp": "2025-04-03T10:30:00.000Z",
//             "_id": "67eece35c74e66500e3bad0c"
//         },
//         {
//             "sender": "bot",
//             "message": "Noted. Do you have any other symptoms?",
//             "timestamp": "2025-04-03T10:31:00.000Z",
//             "_id": "67eece35c74e66500e3bad0d"
//         },
//         {
//             "sender": "patient",
//             "message": "Yes, I also feel dizzy sometimes.",
//             "timestamp": "2025-04-03T10:32:00.000Z",
//             "_id": "67eece35c74e66500e3bad0e"
//         },
//         {
//             "sender": "patient",
//             "message": "I have a severe headache and fever.",
//             "timestamp": "2025-04-03T10:30:00.000Z",
//             "_id": "67eecf5725d7e3badb792715"
//         },
//         {
//             "sender": "bot",
//             "message": "Noted. Do you have any other symptoms?",
//             "timestamp": "2025-04-03T10:31:00.000Z",
//             "_id": "67eecf5725d7e3badb792716"
//         },
//         {
//             "sender": "patient",
//             "message": "Yes, I also feel dizzy sometimes.",
//             "timestamp": "2025-04-03T10:32:00.000Z",
//             "_id": "67eecf5725d7e3badb792717"
//         },
//         {
//             "sender": "doctor",
//             "message": "AI suggests a possible viral infection.",
//             "timestamp": "2025-04-05T07:28:26.463Z",
//             "_id": "67f0db9a7686574a9c77e30e"
//         }
//     ]
// }