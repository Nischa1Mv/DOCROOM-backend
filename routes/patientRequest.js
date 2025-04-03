import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

// Get patient records for a doctor (filtered response)
router.get("/patientRecord", async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Find the doctor and populate patient records with only necessary fields
        const doctor = await User.findById(doctorId).populate({
            path: "patientRecord", // Correct field based on your schema
            populate: { path: "Patient", select: "name age gender" }, // Fetch patient details
            select: "BOT.aiSummary BOT.priorityStatus timeStampBegin patient", // Select only required fields
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Format response to include only required fields
        const patientRecords = doctor.patientRecord.map((record) => ({
            name: record.Patient?.name || "Unknown",
            age: record.Patient?.age || "N/A",
            gender: record.Patient?.gender || "N/A",
            aiSummary: record.BOT?.aiSummary || "N/A",
            priorityStatus: record.BOT?.priorityStatus || "N/A",
            recordedAt: record.timeStampBegin,
        }));

        res.status(200).json({ patientRecords });
    } catch (error) {
        console.error("Error fetching patient records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

// Example response structure
// {
//     "patientRecords": [
//       {
//         "name": "John Doe",
//         "age": 30,
//         "gender": "Male",
//         "aiSummary": "Patient likely has flu symptoms, recommended rest and hydration.",
//         "priorityStatus": "high",
//         "recordedAt": "2025-04-03T08:00:00Z"
//       }
//     ]
//   }
  