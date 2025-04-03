import express from "express";
import Patient from "../models/Patient.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// Get Conversations by Patient ID
router.get("/conversation", async (req, res) => {
    try {
        const { patientId } = req.params;

        // Step 1: Find the patient and get their conversation ID
        const patient = await Patient.findById(patientId).select("conversation");

        if (!patient || !patient.conversation) {
            return res.status(404).json({ message: "Patient or conversation not found" });
        }

        // Step 2: Fetch all messages from the conversation
        const conversations = await Conversation.find({
            _id: patient.conversation,  // Match conversation ID
        }).select("sender message timestamp");

        res.status(200).json({ conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

// {
//     "conversations": [
//       {
//         "sender": "patient",
//         "message": "I feel dizzy and weak.",
//         "timestamp": "2025-04-03T08:00:00Z"
//       },
//       {
//         "sender": "doctor",
//         "message": "Have you checked your blood pressure?",
//         "timestamp": "2025-04-03T08:05:00Z"
//       },
//       {
//         "sender": "Bot",
//         "message": "You may need to rest and drink water.",
//         "timestamp": "2025-04-03T08:10:00Z"
//       }
//     ]
//   }
  
