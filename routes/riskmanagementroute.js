import express from "express";
import ComplianceRiskManagement from "../models/riskmanagement.js";
import User from "../models/User.js";
import { authenticateToken, requireOwnership } from "../middleware/auth.js";

const router = express.Router();




// Create new compliance doc
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const riskData = { ...req.body, merchantid };

    // Check if risk management info already exists
    const existingRisk = await ComplianceRiskManagement.findOne({ merchantid });
    if (existingRisk) {
      return res.status(400).json({ 
        message: 'Risk management information already exists for this merchant',
        riskId: existingRisk._id
      });
    }

    const doc = new ComplianceRiskManagement(riskData);
    await doc.save();

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.riskmanagement.completed = true;
      await user.save();
    }

    res.status(201).json({
      message: 'Risk management information created successfully',
      risk: doc,
      onboardingUpdated: true
    });
  } catch (err) {
    console.error('Error creating risk management info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all compliance docs
router.get("/list", async (req, res) => {
  try {
    const docs = await ComplianceRiskManagement.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single doc by ID
router.get("/:id", async (req, res) => {
  try {
    const doc = await ComplianceRiskManagement.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/riskmanagementinfo - Update risk management info for current user
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const updateData = req.body;

    // Remove merchantid from update data to prevent changing it
    delete updateData.merchantid;

    // Mark as completed when form is submitted with data
    updateData.completed = true;

    const risk = await ComplianceRiskManagement.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!risk) {
      return res.status(404).json({ message: 'Risk management information not found' });
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.riskmanagement.completed = true;
      await user.save();
    }

    res.json({
      message: 'Risk management information updated successfully',
      risk
    });
  } catch (error) {
    console.error('Error updating risk management info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update doc by ID (Admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updated = await ComplianceRiskManagement.findByIdAndUpdate(
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

// Delete doc by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ComplianceRiskManagement.findByIdAndDelete(
      req.params.id
    );
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// module.exports = router;
export default router;