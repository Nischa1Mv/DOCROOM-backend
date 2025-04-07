import express from 'express';
import Patient from '../models/patientModel.js'; // Add .js if using ESModules
import { User } from '../models/userModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { doctorId } = req.body;

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