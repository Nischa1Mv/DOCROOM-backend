import express from "express";
import { User } from "../models/userModel.js";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation function
function isValidPassword(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password) &&
        /[\W_]/.test(password);
}

// Signup route
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            message: "Send all the required data (email, password)",
        });
    }

    // Validate email and password format
    if (!isValidEmail(email)) {
        return res.status(400).send({ message: "Invalid email format" });
    }
    if (!isValidPassword(password)) {
        return res.status(400).send({ message: "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character" });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).send({ message: "User already exists" });
        }

        const user = new User({
            email: email,
            password: hashSync(password, 10),
        });

        const savedUser = await user.save();
        return res.status(201).send({
            message: "User created successfully",
            user: {
                id: savedUser._id,
                email: savedUser.email,
            }
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            message: "Send all the required data (email, password)",
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send({ message: "User not found" });
        }

        if (!compareSync(password, user.password)) {
            return res.status(401).send({ message: "Incorrect password" });
        }

        if (!process.env.SECRET) {
            return res.status(500).send({ message: "JWT secret not configured" });
        }

        const payload = { id: user._id };
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "10d" });

        return res.status(200).send({
            message: "Successfully logged in",
            token: "Bearer " + token,
            user: {
                id: user._id,
                email: user.email,
            }
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

export default router;
