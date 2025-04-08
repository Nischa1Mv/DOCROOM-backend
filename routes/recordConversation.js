import express from "express";
import PatientRecord from "../models/patientRecord.js";
import Patient from "../models/patientModel.js";
import Conversation from "../models/conversation.js";

const router = express.Router();

// Get Conversations for a Patient Record
router.get("/recordConversation", async (req, res) => {
    try {
        const { recordId } = req.params;

        // Step 1: Find the Patient ID and Timestamp from the PatientRecord
        const patientRecord = await PatientRecord.findById(recordId).select("Patient timeStampBegin");

        if (!patientRecord) {
            return res.status(404).json({ message: "Patient record not found" });
        }

        const { Patient: patientId, timeStampBegin } = patientRecord;

        // Step 2: Find the Patient and get their conversation ID
        const patient = await Patient.findById(patientId).select("conversation");

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Step 3: Fetch conversations that happened after `timeStampBegin`
        const conversations = await Conversation.find({
            _id: patient.conversation,  // Match conversation ID
            timestamp: { $gte: timeStampBegin }, // Get messages after timestamp
        }).select("sender message timestamp");

        res.status(200).json({ conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

//Example response structure
// {
//     "conversations": [
//       {
//         "sender": "patient",
//         "message": "I have a fever and a headache.",
//         "timestamp": "2025-04-03T08:05:00Z"
//       },
//       {
//         "sender": "doctor",
//         "message": "How long have you had these symptoms?",
//         "timestamp": "2025-04-03T08:07:00Z"
//       },
//       {
//         "sender": "Bot",
//         "message": "Based on your symptoms, it may be a viral infection.",
//         "timestamp": "2025-04-03T08:10:00Z"
//       }
//     ]
//   }
  