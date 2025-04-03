
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    phone: String,
});


export const User = new mongoose.model("User", userSchema);