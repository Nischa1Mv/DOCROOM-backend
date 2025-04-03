// Conversation Schema
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    sender: { type: String, enum: ["patient", "doctor", "Bot"], required: true },
    message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
