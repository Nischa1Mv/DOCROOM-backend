import express from 'express';
import { User } from '../models/userModel.js';
import Patient from '../models/patientModel.js'; // Import the Patient model
import jwt from "jsonwebtoken";
import Conversation from '../models/conversation.js';

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

router.get('/', verifyToken, async (req, res) => {
    const { id: doctorId } = req.user;

    if (!doctorId) {
        return res.status(400).json({ message: "Doctor ID is required" });
    }

    try {
        const doctor = await User.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const patientIds = doctor.patients || [];

        if (patientIds.length === 0) {
            return res.status(404).json({ message: "No patients found for this doctor" });

        }

        const patients = await Patient.find({ _id: { $in: patientIds } });

        if (patients.length === 0) {
            return res.status(404).json({ message: "No patient details found" });
        }

        const patientDetails = await Promise.all(
            patients.map(async (patient) => {
                const conversation = await Conversation.findOne({ patient: patient._id })
                    .sort({ "messages.timestamp": -1 })
                    .select("messages.timestamp");
                const lastTimestamp = conversation?.messages?.[conversation.messages.length - 1]?.timestamp || null;

                return {
                    name: patient.name,
                    phoneNumber: patient.phoneNumber,
                    lastTimestamp,
                    patientId: patient._id,
                };
            })
        );

        return res.status(200).json({
            message: "Patients retrieved successfully",
            patients: patientDetails,
        });

    } catch (error) {
        console.error("Error fetching patients:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

export default router;

// Example response structure
// {
//     "message": "Patients retrieved successfully",
//     "patients": [
//         {
//             "name": "Sahana Reddy",
//             "phoneNumber": "+919876543210",
//             "lastTimestamp": "2025-04-16T07:03:45.000Z",
//             "patientId": "680009d0ea2a4587bfaceb5f"
//         }
//     ]
// }