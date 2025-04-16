import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: [] }],
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    specialization: { type: String, default: "" },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
