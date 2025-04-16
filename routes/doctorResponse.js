import express from "express";
import PatientRecord from "../models/patientRecord.js";
import Patient from "../models/patientModel.js";
import Conversation from "../models/conversation.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

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
        req.user = jwt.verify(token, process.env.SECRET);
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};
// Send Message on Behalf of Doctor and Close the Patient Record
router.post("/", verifyToken, async (req, res) => {
    try {
        const { patientRecordId, finalResponse, patientId } = req.body;
        const { id: doctorId } = req.user;
        console.log("Doctor ID:", doctorId);
        console.log("Patient ID:", patientId);
        console.log("Patient Record ID:", patientRecordId);
        console.log("Final Response:", finalResponse);

        if (!finalResponse) {
            return res.status(400).json({ message: " Final Response are required" });
        }
        if (patientId && !patientRecordId) {


            const conversation = await Conversation.findOne({ patient: patientId, doctor: doctorId });

            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            const conversationId = conversation._id;


            // Fetch doctor name from Doctor model (you'll need to import the Doctor model)
            const doctor = await User.findById(doctorId);
            const doctorName = doctor ? doctor.name : 'Unknown Doctor';


            // Step 3: Append the final response to the conversation
            const updatedConversation = await Conversation.findByIdAndUpdate(
                conversationId,
                {
                    $push: {
                        messages: {
                            sender: doctorName,
                            message: finalResponse,
                            timestamp: new Date(),
                        },
                    },
                },
                { new: true }
            );

            if (!updatedConversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            res.status(200).json({
                message: "Message sent and patient record closed successfully",
                data: {
                    sender: doctorName,
                    message: finalResponse,
                    timestamp: new Date(),
                },
            });

        }
        if (!patientId && patientRecordId) {

            // Step 1: Find the Patient Record 
            const patientRecord = await PatientRecord.findById(patientRecordId);

            if (!patientRecord) {
                return res.status(404).json({ message: "Patient record not found" });
            }

            const patientId = patientRecord.patient;
            if (!patientId) {
                return res.status(404).json({ message: "Patient ID not found in the record" });
            }

            const conversation = await Conversation.findOne({ patient: patientId, doctor: doctorId });

            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            const conversationId = conversation._id;

            // Fetch doctor name from Doctor model (you'll need to import the Doctor model)
            const doctor = await User.findById(conversation.doctor);
            const doctorName = doctor ? doctor.name : 'Unknown Doctor';

            // Step 3: Append the final response to the conversation
            const updatedConversation = await Conversation.findByIdAndUpdate(
                conversationId,
                {
                    $push: {
                        messages: {
                            sender: doctorName,
                            message: finalResponse,
                            timestamp: new Date(),
                        },
                    },
                },
                { new: true }
            );

            if (!updatedConversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            // Step 4: Mark the patient record as closed
            patientRecord.isClosed = true;
            patientRecord.timestampEnd = new Date(); // Update the end timestamp
            patientRecord.doctorResponse = finalResponse; // Save the doctor's response
            await patientRecord.save();

            res.status(200).json({
                message: "Message sent and patient record closed successfully",
                data: {
                    sender: doctor,
                    message: finalResponse,
                    timestamp: new Date(),
                },
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
// // Example response structure
// {
//     "message": "Message sent and patient record closed successfully",
//         "data": {
//         "sender": "doctor",
//             "message": "Hello Sahana, this is Dr. Aarav Mehta. Just wanted to check in and see how you're feeling after our consultation. Has the cough improved at all? Are you still experiencing any breathlessness or wheezing? Please feel free to update me if there are any changes or if you need further assistance.",
//                 "timestamp": "2025-04-16T20:12:59.056Z"
//     }
// }