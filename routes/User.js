
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import User from "../models/User.js"; // ✅ include .js extension for ESM
import axios from "axios"; // if you are using ES Modules (type: "module" in package.json)


const router = express.Router();

// POST /api/auth/signup
router.post("/user/signup", async (req, res) => {
  try {
    const { fullname, email, phonenumber, location, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate unique merchant ID for each user
    const merchantId = "MID" + nanoid(20) + Date.now() + Math.random().toString(36).substring(2, 15);
    // const merchantIdAssignedAt = new Date();
    
    const newUser = new User({
      merchantid: merchantId,
      // merchantIdAssignedAt: merchantIdAssignedAt,
      fullname,
      email,
      phonenumber,
      location,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Send webhook notification (don't wait for it to complete)
    const payload = {
      message: "A new user has signed up",
      user: {
        fullname,
        email, 
        phonenumber,
      }, 
      timestamp: new Date().toISOString()
    }

    // Send webhook asynchronously (don't await)
    axios.post(
      "https://webhook.site/f35d1012-7235-4853-bac4-ee2a2004e651", 
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).catch(err => {
      console.error("Webhook failed:", err.message);
      // Don't send response here - just log the error
    });

    // Generate JWT token with fullname & email
    const token = jwt.sign(
      { fullname: newUser.fullname, email: newUser.email, merchantid: newUser.merchantid, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        fullname: newUser.fullname,
        email: newUser.email,
        phonenumber: newUser.phonenumber,
        location: newUser.location,
        role: newUser.role,
        merchantid: newUser.merchantid,
        merchantIdAssignedAt: newUser.merchantIdAssignedAt,
        onboardingStatus: newUser.onboardingStatus,
        onboardingSteps: newUser.onboardingSteps,
        createdAt: newUser.createdAt
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern.email) {
        console.error("Error sending webhook:", err.message);
        return res.status(400).json({ message: "User with this email already exists" });
      }
      if (err.keyPattern.phonenumber) {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }
    }
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message // <-- only send the error message
    });

  }
});

// // POST /api/auth/login
router.post("/user/login", async (req, res) => {
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
      { fullname: user.fullname, email: user.email,role: user.role, merchantId: user.merchantid },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        fullname: user.fullname,
        email: user.email,
        phonenumber: user.phonenumber,
        location: user.location,
        role: user.role,
        merchantid: user.merchantid,
        merchantIdAssignedAt: user.merchantIdAssignedAt,
        onboardingStatus: user.onboardingStatus,
        onboardingSteps: user.onboardingSteps,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/user/list", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
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

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;