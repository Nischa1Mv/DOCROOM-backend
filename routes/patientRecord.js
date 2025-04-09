import express from "express";
import { User } from "../models/userModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
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
        console.log("Decoded Token:", decoded);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};
router.get("/", verifyToken, async (req, res) => {
    try {
        const { id: doctorId } = req.user;

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