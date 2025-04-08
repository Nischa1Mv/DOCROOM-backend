import express from "express";
import PatientRecord from "../models/patientRecord.js";

const router = express.Router();

// Get patient summary from record ID
router.get("/patient-summary", async (req, res) => {
    try {
        const { recordId } = req.params;

        // Find the patient record and populate patient details
        const patientRecord = await PatientRecord.findById(recordId).populate({
            path: "patient",
            select: "name age gender phoneNumber"
        });

        if (!patientRecord) {
            return res.status(404).json({ message: "Patient record not found" });
        }

        // Create a summary response
        const patientSummary = {
            patient: patientRecord.patient,
            reportedSymptoms: patientRecord.BOT?.reportedSymptoms || "N/A",
            aiDiagnosis: patientRecord.BOT?.AIdiagnosis || "N/A",
            priorityStatus: patientRecord.BOT?.priorityStatus || "N/A",
            aiSummary: patientRecord.BOT?.aiSummary || "N/A",
            recordedAt: patientRecord.timeStampBegin
        };

        res.status(200).json({ patientSummary });
    } catch (error) {
        console.error("Error fetching patient summary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

// Example response structure
// {
//     "patientSummary": {
//       "patient": {
//         "_id": "patient456",
//         "name": "John Doe",
//         "age": 30,
//         "gender": "Male",
//         "phoneNumber": "123-456-7890"
//       },
//       "reportedSymptoms": "Fever, Cough",
//       "aiDiagnosis": "Possible Flu",
//       "priorityStatus": "high",
//       "aiSummary": "Patient likely has flu symptoms, recommended rest and hydration.",
//       "recordedAt": "2025-04-03T08:00:00Z"
//     }
//   }
  