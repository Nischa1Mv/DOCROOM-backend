import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: String,
    specialization: String,  // Fixed typo
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
    patientRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: "PatientRecord" }],
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
