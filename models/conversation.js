import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ["patient", "doctor", "bot"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    messages: [messageSchema]  // ✅ Store messages in an array
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
