import express from "express";
import Patient from "../models/patientModel.js";
import Conversation from "../models/conversation.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import PatientRecord from "../models/patientRecord.js";

const router = express.Router();

// Create a new patient and link to the doctor's patients array
router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            patientDetails,
            doctorSpecialization,
            conversation,
            BotSummary
        } = req.body;

        // 🔹 Validate input
        if (!patientDetails || !doctorSpecialization || !conversation || !BotSummary) {
            await session.abortTransaction();
            return res.status(400).json({ message: "All fields are required" });
        }

        const { phoneNumber } = patientDetails;
        let patient = await Patient.findOne({ phoneNumber }).session(session);

        if (!patient) {
            patient = new Patient({
                name: patientDetails.name,
                phoneNumber: phoneNumber,
                age: patientDetails.age,
                gender: patientDetails.gender,
            });
            await patient.save({ session });
        }

        const doctor = await User.findOne({ specialization: doctorSpecialization }).session(session);
        if (!doctor) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Doctor not found" });
        }

        const isPatientLinked = doctor.patients.some((id) => id.toString() === patient._id.toString());
        if (!isPatientLinked) {
            doctor.patients.push(patient._id);
            await doctor.save({ session });
        }

        const record = new PatientRecord({
            patient: patient._id,
            doctor: doctor._id,
            timeStampBegin: conversation[0].timestamp,
            BotSummary: {
                reportedSymptoms: BotSummary.reportedSymptoms,
                aiAnalysis: BotSummary.aiAnalysis,
                patientApproachMessage: BotSummary.patientApproachMessage,
                priorityStatus: BotSummary.priorityStatus,
                aiSummary: BotSummary.aiSummary,
                AIDiagnosis: BotSummary.AIDiagnosis,
            },
        });
        await record.save({ session });

        const conversationDoc = await Conversation.findOne({
            patient: patient._id,
            doctor: doctor._id
        }).session(session);

        if (!conversationDoc) {
            const newConversation = new Conversation({
                patient: patient._id,
                doctor: doctor._id,
                messages: conversation,
            });
            await newConversation.save({ session });
        } else {
            conversationDoc.messages.push(...conversation);
            await conversationDoc.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();

        res.status(200).json({
            message: "Operation completed successfully",
            patient,
            record
        });

    } catch (error) {
        // Abort transaction on any error
        await session.abortTransaction();
        console.error("Error:", error);
        res.status(500).json({
            message: "Operation failed, all changes have been rolled back",
            error: error.message
        });
    } finally {
        // End the session
        session.endSession();
    }
});

export default router;
