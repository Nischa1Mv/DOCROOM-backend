import express from "express";
import Patient from "../models/patientModel.js";
import { User } from "../models/userModel.js";

const router = express.Router();

// Create a new patient and link to the doctor's patients array
router.post("/", async (req, res) => {
    try {
        const { name, phoneNumber, age, gender, doctorId } = req.body;

        // 🔹 Validate input
        if (!name || !phoneNumber || !age || !gender || !doctorId) {
            return res.status(400).json({ message: "All fields (name, phoneNumber, age, gender, doctorId) are required" });
        }

        // 🔹 Find the doctor first
        const doctor = await User.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // 🔹 Create a new patient
        const newPatient = new Patient({
            name,
            phoneNumber,
            age,
            gender,
            lastRecord: null, // No last record yet
            conversation: null // No conversation yet
        });

        // 🔹 Save patient and update doctor in a **transaction**
        const session = await Patient.startSession();
        session.startTransaction();

        try {
            await newPatient.save({ session });

            // Add patient ID to doctor's patients array
            doctor.patients.push(newPatient._id);
            await doctor.save({ session });

            // ✅ Commit transaction if both succeed
            await session.commitTransaction();
            session.endSession();

            res.status(201).json({ message: "Patient created successfully", patient: newPatient });

        } catch (error) {
            await session.abortTransaction(); // ❌ Rollback on failure
            session.endSession();
            throw error; // Re-throw to handle below
        }

    } catch (error) {
        console.error("Error creating patient:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

export default router;
