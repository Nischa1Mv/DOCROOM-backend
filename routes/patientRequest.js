
import express from "express";
import mongoose from "mongoose";
import { User } from "../models/User.js";  // Ensure the correct path
import PatientRecord from "../models/PatientRecord.js";

const router = express.Router();

router.get("/patient-records", async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Find the doctor and populate patient records
        const doctor = await User.findById(doctorId).populate({
            path: "patientRecords", 
            populate: { path: "patient", select: "name age gender phoneNumber" } // Also fetch patient details
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ patientRecords: doctor.patientRecords });
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
//         "_id": "record123",
//         "patient": {
//           "_id": "patient456",
//           "name": "John Doe",
//           "age": 30,
//           "gender": "Male",
//           "phoneNumber": "123-456-7890"
//         },
//         "BOT": {
//           "reportedSymptoms": "Fever, Cough",
//           "priorityStatus": "high",
//           "AIdiagnosis": "Possible Flu"
//         },
//         "timeStampBegin": "2025-04-03T08:00:00Z"
//       }
//     ]
//   }
