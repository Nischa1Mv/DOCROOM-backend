import express from "express";
import mongoose from "mongoose";
import Patient from "../models/patientModel.js";
import PatientRecord from "../models/PatientRecord.js";
import Conversation from "../models/Conversation.js";
import { User } from "../models/userModel.js";

const router = express.Router();

// Route to handle conversation and patient record
router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { phoneNumber, name = "Unknown Patient", messages, BOT, userId } = req.body;

        // Validate input
        if (!phoneNumber || !Array.isArray(messages) || messages.length === 0 || !userId) {
            return res.status(400).json({ error: "Phone number, messages, and userId are required." });
        }

        // 🔹 Find or create the patient
        let patient = await Patient.findOne({ phoneNumber }).session(session);

        if (!patient) {
            patient = new Patient({ phoneNumber, name, lastRecord: new Date() });
            await patient.save({ session });
        }

        // 🔹 Find or create conversation
        let conversation = await Conversation.findById(patient.conversation).session(session);

        if (!conversation) {
            conversation = new Conversation({ patient: patient._id, messages });
        } else {
            conversation.messages.push(...messages);
        }
        await conversation.save({ session });

        // Link conversation to patient
        patient.conversation = conversation._id;
        patient.lastRecord = new Date();
        await patient.save({ session });

        // 🔹 Create a new patient record (instead of updating an existing one)
        const patientRecord = new PatientRecord({
            patient: patient._id,
            BOT: {
                reportedSymptoms: BOT?.reportedSymptoms || "",
                aiAnalysis: BOT?.aiAnalysis || "",
                patientApproachMessage: BOT?.patientApproachMessage || "",
                priorityStatus: BOT?.priorityStatus || "low",
                aiSummary: BOT?.aiSummary || "",
                AIDiagnosis: BOT?.AIDiagnosis || ""
            }
        });

        await patientRecord.save({ session });

        // 🔹 Store patientRecord in User model (ensure it's an array)
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { patientRecords: patientRecord._id } }, // ✅ Add without duplicates
            { new: true, session }
        );

        if (!user) {
            throw new Error("User not found.");
        }

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Messages, BOT data, and user patient records updated successfully.",
            conversation,
            patientRecord,
            user
        });

    } catch (error) {
        console.error("🚨 Error processing request:", error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: "Internal server error." });
    }
});

export default router;
