import express from "express";
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
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded; // Store the decoded token in the request object
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};
// Send Message on Behalf of Doctor and Close the Patient Record
router.post("/", verifyToken, async (req, res) => {
    const { id: doctorId } = req.user;
    const { name, phone, specialization } = req.body;
    const doctor = await User.findById(doctorId);
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }
    //i need to add name ,phone , specialization, to users

    const updatedDoctor = await User.findByIdAndUpdate(doctorId, {
        name: name,
        phone: phone,
        specialization: specialization,
    }, { new: true });
    if (!updatedDoctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor details updated successfully", doctor: updatedDoctor });
});
export default router;