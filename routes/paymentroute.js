import express from "express";
import paymentinformodel from "../models/paymentinformodel.js";
import User from "../models/User.js";
import { authenticateToken, requireOwnership } from "../middleware/auth.js";

const router = express.Router();



// Create new processing info
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const paymentData = { ...req.body, merchantid };

    // Check if payment info already exists
    const existingPayment = await paymentinformodel.findOne({ merchantid });
    if (existingPayment) {
      return res.status(400).json({ 
        message: 'Payment information already exists for this merchant',
        paymentId: existingPayment._id
      });
    }

    const info = new paymentinformodel(paymentData);
    await info.save();

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.paymentandprosessing.completed = true;
      await user.save();
    }

    res.status(201).json({
      message: 'Payment information created successfully',
      payment: info,
      onboardingUpdated: true
    });
  } catch (err) {
    console.error('Error creating payment info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all processing info docs
router.get("/", async (req, res) => {
  try {
    const docs = await paymentinformodel.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by ID
router.get("/:id", async (req, res) => {
  try {
    const doc = await paymentinformodel.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/paymentinfo - Update payment information for current user
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const updateData = req.body;

    // Remove merchantid from update data to prevent changing it
    delete updateData.merchantid;

    // Mark as completed when form is submitted with data
    updateData.completed = true;

    const payment = await paymentinformodel.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment information not found' });
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.paymentandprosessing.completed = true;
      await user.save();
    }

    res.json({
      message: 'Payment information updated successfully',
      payment
    });
  } catch (error) {
    console.error('Error updating payment info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update by ID (Admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updated = await paymentinformodel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await paymentinformodel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

 export default router;