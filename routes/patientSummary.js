import express from "express";
import PatientRecord from "../models/patientRecord.js";
import jwt from "jsonwebtoken";

const router = express.Router();
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader || !bearerHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid or missing token." });
    }
    const token = bearerHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

// Get patient summary from record ID
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const { id: recordId } = req.params;
        if (!recordId) {
            return res.status(400).json({ message: "Record ID is required" });
        }

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
            reportedSymptoms: patientRecord.botSummary?.reportedSymptoms || "N/A",
            aiDiagnosis: patientRecord.botSummary?.aiDiagnosis || "N/A",
            priorityStatus: patientRecord.botSummary?.priorityStatus || "N/A",
            aiSummary: patientRecord.botSummary?.aiSummary || "N/A",
            recordedAt: patientRecord.timeStampBegin,
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
//         "patient": {
//             "_id": "67eec58fe902b670b9976761",
//             "doctor": "67eec1d481c7f71a39c9e1f9",
//             "name": "NIhil",
//             "phoneNumber": "1234567890",
//             "lastRecord": "2025-04-03T18:11:35.896Z",
//             "age": 44,
//             "gender": "male",
//             "conversation": "67eecdad7937a752082bfd44",
//             "createdAt": "2025-04-03T17:29:51.081Z",
//             "updatedAt": "2025-04-03T18:11:35.897Z",
//             "__v": 0
//         },
//         "reportedSymptoms": "Headache, fever",
//         "aiDiagnosis": "Viral infection",
//         "priorityStatus": "medium",
//         "aiSummary": "Patient reported headache and fever. AI suggests a possible viral infection.",
//         "recordedAt": "2025-04-03T18:11:35.940Z"
//     }
// }