import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    sender: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true },
});

const conversationSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [messageSchema]  // ✅ Store messages in an array
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
