
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {nanoid} from "nanoid";
import User from "../models/User.js"; // ✅ include .js extension for ESM

const router = express.Router();

const merchantId = "MID" + nanoid(20);

console.log(merchantId); // e.g. "V1StGXR8_Z"

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, phonenumber, location, password, roll } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({

      merchantid: merchantId,
      
      fullname,
      email,
      phonenumber,
      location,
      password: hashedPassword,
      roll,
    });

    await newUser.save();

    // Generate JWT token with fullname & email
    const token = jwt.sign(
      { fullname: newUser.fullname, email: newUser.email, merchantid: newUser.merchantid },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        fullname: newUser.fullname,
        email: newUser.email,
        phonenumber: newUser.phonenumber,
        location: newUser.location,
        roll: newUser.roll,
        onboardingStatus: newUser.onboardingStatus,
        onboardingSteps: newUser.onboardingSteps,
        createdAt: newUser.createdAt
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern.email) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      if (err.keyPattern.phonenumber) {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }
    }
   res.status(500).json({ 
    message: "Something went wrong", 
    error: err.message // <-- only send the error message
});

  }
});

// // POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phonenumber: emailOrPhone }]
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { fullname: user.fullname, email: user.email,merchantId:user.merchantid },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        fullname: user.fullname,
        email: user.email,
        phonenumber: user.phonenumber,
        location: user.location,
        roll: user.roll,
        onboardingStatus: user.onboardingStatus,
        onboardingSteps: user.onboardingSteps,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/list", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    // Search using regex for partial matches (case-insensitive)
    const users = await User.find({
      $or: [
        { fullname: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phonenumber: { $regex: q, $options: "i" } }
      ]
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;