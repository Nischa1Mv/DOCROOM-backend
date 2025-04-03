import express from "express";
import Patient from "../models/patientModel.js";
import PatientRecord from "../models/patientRecord.js";
import Conversation from "../models/conversation.js";

const router = express.Router();

// Route to handle conversation and patient record
router.post("/", async (req, res) => {
    try {
        const { phoneNumber, name = "Unknown Patient", messages, BOT } = req.body;

        // Validate input
        if (!phoneNumber || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Phone number and messages array are required." });
        }

        // 🔹 Find or create the patient
        let patient = await Patient.findOne({ phoneNumber });

        if (!patient) {
            patient = new Patient({ phoneNumber, name, lastRecord: new Date() });
            await patient.save();
        }

        // 🔹 Find or create conversation
        let conversation = await Conversation.findById(patient.conversation);

        if (!conversation) {
            conversation = new Conversation({
                patient: patient._id,
                messages: messages
            });
        } else {
            conversation.messages.push(...messages);
        }

        // Save conversation
        await conversation.save();
        patient.conversation = conversation._id;

        // 🔹 Update last record timestamp
        patient.lastRecord = new Date();
        await patient.save();

        // 🔹 Update or create patient record with BOT data
        const patientRecord = await PatientRecord.findOneAndUpdate(
            { patient: patient._id },
            {
                $set: {
                    BOT: {
                        reportedSymptoms: BOT?.reportedSymptoms || "",
                        aiAnalysis: BOT?.aiAnalysis || "",
                        patientApproachMessage: BOT?.patientApproachMessage || "",
                        priorityStatus: BOT?.priorityStatus || "low",
                        aiSummary: BOT?.aiSummary || "",
                        AIDiagnosis: BOT?.AIDiagnosis || ""
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.status(201).json({
            message: "Messages and BOT data updated successfully.",
            conversation,
            patientRecord
        });

    } catch (error) {
        console.error("🚨 Error processing request:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

export default router;
