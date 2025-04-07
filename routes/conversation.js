import express from "express";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// Get Conversations by Patient ID
router.get("/", async (req, res) => {
    try {
        const { patientId } = req.body;

        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        const conversations = await Conversation.find({ patient: patientId });
        const messages = conversations.flatMap(convo => convo.messages || []);

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
