import express from 'express';
import { User } from '../models/userModel.js';
import jwt from "jsonwebtoken"

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

router.get('/:id', verifyToken, async (req, res) => {
    const { id: doctorId } = req.params;

    if (!doctorId) {
        return res.status(400).json({ message: "Doctor ID is required" });
    }

    try {
        const doctor = await User.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Adjust the field name based on your schema
        const patients = doctor.patients || [];

        if (patients.length === 0) {
            return res.status(404).json({ message: "No patients found for this doctor" });
        }

        return res.status(200).json({
            message: "Patients retrieved successfully",
            patients,
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
//output
// {
//     "message": "Patients retrieved successfully",
//     "patients": [
//         "67eec58fe902b670b9976761"
//     ]
// }