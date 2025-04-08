import express from "express";
import PatientRecord from "../models/PatientRecord.js";
import Patient from "../models/patientModel.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// Send Message on Behalf of Doctor and Close the Patient Record
router.post("/", async (req, res) => {
    try {
        const { patientRecordId, finalResponse } = req.body;

        if (!patientRecordId || !finalResponse) {
            return res.status(400).json({ message: "Patient Record ID and Final Response are required" });
        }

        // Step 1: Find the Patient Record 
        const patientRecord = await PatientRecord.findById(patientRecordId);

        if (!patientRecord) {
            return res.status(404).json({ message: "Patient record not found" });
        }

        const patientId = patientRecord.patient;
        if (!patientId) {
            return res.status(404).json({ message: "Patient ID not found in the record" });
        }

        // Step 2: Find the patient's conversation ID
        const patient = await Patient.findById(patientId).select("conversation");

        if (!patient || !patient.conversation) {
            return res.status(404).json({ message: "Patient or conversation not found" });
        }

        const conversationId = patient.conversation;

        // Step 3: Append the final response to the conversation
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            {
                $push: {
                    messages: {
                        sender: "doctor",
                        message: finalResponse,
                        timestamp: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (!updatedConversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Step 4: Mark the patient record as closed
        patientRecord.isClosed = true;
        await patientRecord.save();

        res.status(200).json({
            message: "Message sent and patient record closed successfully",
            data: {
                sender: "doctor",
                message: finalResponse,
                timestamp: new Date(),
            },
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;