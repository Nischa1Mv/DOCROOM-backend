import express from "express";
import PatientRecord from "../models/PatientRecord.js";
import Patient from "../models/Patient.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// Send Message on Behalf of Doctor and Close the Patient Record
router.post("/send-message", async (req, res) => {
    try {
        const { patientRecordId, message } = req.body;

        if (!patientRecordId || !message) {
            return res.status(400).json({ message: "Patient Record ID and message are required" });
        }

        // Step 1: Find the Patient ID from the PatientRecord
        const patientRecord = await PatientRecord.findById(patientRecordId).select("Patient");

        if (!patientRecord) {
            return res.status(404).json({ message: "Patient record not found" });
        }

        const patientId = patientRecord.Patient;

        // Step 2: Find the patient's conversation ID
        const patient = await Patient.findById(patientId).select("conversation");

        if (!patient || !patient.conversation) {
            return res.status(404).json({ message: "Patient or conversation not found" });
        }

        // Step 3: Add a new message from the doctor to the conversation
        const newMessage = new Conversation({
            sender: "doctor",
            message: message,
            timestamp: new Date(),
        });

        await newMessage.save();

        // Step 4: Mark the patient record as closed
        patientRecord.isClosed = true;
        await patientRecord.save();

        res.status(200).json({ 
            message: "Message sent and patient record closed successfully",
            data: {
                sender: "doctor",
                message: message,
                timestamp: newMessage.timestamp
            }
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;


//WE CAN ALSO DO LIKE LATEST PATIENT RECORD TO CLOSE THE RECORD , ISTEAD OF PSSING THE RCROD
// {
//     "sender": "doctor",
//     "message": "Your test results are normal. Let me know if you need anything else.",
//     "timestamp": "2025-04-03T08:30:00Z"
//   }