import express from "express";
import { User } from "../models/userModel.js";
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }

        // Find doctor and populate patient records
        const doctor = await User.findById(doctorId).populate({
            path: "patientRecords",
            match: { isClosed: false },
            populate: { path: "patient", select: "name age gender" }, // Correct field name
            select: "BOT timeStampBegin patient", // Correct selection of fields
        });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        let patientRecords = [];

        if (doctor.patientRecords && doctor.patientRecords.length > 0) {
            patientRecords = doctor.patientRecords.map((record) => ({
                id: record._id, // Include the record ID
                name: record.patient?.name || "Unknown",
                age: record.patient?.age || "N/A",
                gender: record.patient?.gender || "N/A",
                aiSummary: record.BOT?.aiSummary || "N/A",
                priorityStatus: record.BOT?.priorityStatus || "N/A",
                recordedAt: record.timeStampBegin || "N/A",
            }));
        }

        res.status(200).json({ patientRecords });
    } catch (error) {
        console.error("🚨 Error fetching patient records:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

export default router;