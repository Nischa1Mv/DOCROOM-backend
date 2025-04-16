import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, },
    phone: String,
    specialization: String,
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
