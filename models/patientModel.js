// Patient Schema
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, unique: true, required: true },
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);
