import express from "express";
import Patient from "../models/patientModel.js"

const router = express.Router();

// Create a new patient with default/null values for other fields
router.post("/", async (req, res) => {
    try {
        const { name, phoneNumber, age, gender } = req.body;

        if (!name || !phoneNumber || !age || !gender) {
            return res.status(400).json({ message: "All fields (name, phoneNumber, age, gender) are required" });
        }

        // Create a new patient with other fields as null or default
        const newPatient = new Patient({
            name,
            phoneNumber,
            age,
            gender,
            lastRecord: null, // No last record yet
            conversation: null // No conversation yet
        });

        await newPatient.save();

        res.status(201).json({ message: "Patient created successfully", patient: newPatient });
    } catch (error) {
        console.error("Error creating patient:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

// {
//     "name": "John Doe",
//     "phoneNumber": "123-456-7890",
//     "age": 30,
//     "gender": "Male"
//   }
