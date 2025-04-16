// Patient Schema
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, unique: true, required: true },
    age: { type: Number, },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);
