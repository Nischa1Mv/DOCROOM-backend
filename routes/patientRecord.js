import express from "express";
import Patient from "../models/patientModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import PatientRecord from "../models/patientRecord.js";

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

        // Find records using doctor id in patientRecord
        const patientRecords = await PatientRecord.find({ doctor: doctorId });
        if (!patientRecords || patientRecords.length === 0) {
            return res.status(404).json({ message: "No patient records found" });
        }

        // Extract record IDs and respective patient IDs
        const recordDetails = patientRecords.map((record) => ({
            recordId: record._id,
            patientId: record.patient,
            aiSummary: record.BotSummary.aiSummary,
        }));

        // Fetch patient details using patient IDs
        const populatedRecords = await Promise.all(
            recordDetails.map(async ({ recordId, patientId, aiSummary }) => {
                const patient = await Patient.findById(patientId);
                return { recordId, patient, aiSummary };
            })
        );

        res.status(200).json({ patientRecords: populatedRecords });
    } catch (error) {
        console.error("🚨 Error fetching patient records:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

export default router;

//example response
// {
//     "patientRecords": [
//         {
//             "_id": "64e2b8f1d3f3a5f4c4e2b8f1",
//             "patient": {
//                 "_id": "64e2b8f1d3f3a5f4c4e2b8f0",
//                 "name": "John Doe",
//                 "phoneNumber": "1234567890",
//                 "age": 30,
//  