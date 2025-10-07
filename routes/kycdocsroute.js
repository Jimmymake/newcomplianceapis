import express from 'express';
import KycDocs from "../models/kycdocs.js";
import User from "../models/User.js";
import { authenticateToken, requireOwnership } from "../middleware/auth.js";

const router = express.Router();


// Create KYC docs
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const kycData = { ...req.body, merchantid };

    // Check if KYC docs already exist
    const existingKyc = await KycDocs.findOne({ merchantid });
    if (existingKyc) {
      return res.status(400).json({ 
        message: 'KYC documents already exist for this merchant',
        kycId: existingKyc._id
      });
    }

    const kycdoc = new KycDocs(kycData);
    await kycdoc.save();

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.kycdocs.completed = true;
      await user.save();
    }

    res.status(201).json({
      message: 'KYC documents created successfully',
      kyc: kycdoc,
      onboardingUpdated: true
    });
  } catch (err) {
    console.error('Error creating KYC docs:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all KYC docs
router.get("/list", async (req, res) => {
  try {
    const docs = await KycDocs.find();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single KYC doc by ID
router.get("/:id", async (req, res) => {
  try {
    const doc = await KycDocs.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "KYC document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/kycinfo - Update KYC documents for current user
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const updateData = req.body;

    // Remove merchantid from update data to prevent changing it
    delete updateData.merchantid;

    const kyc = await KycDocs.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!kyc) {
      return res.status(404).json({ message: 'KYC documents not found' });
    }

    res.json({
      message: 'KYC documents updated successfully',
      kyc
    });
  } catch (error) {
    console.error('Error updating KYC docs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update KYC doc by ID (Admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updated = await KycDocs.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "KYC document not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete KYC doc by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await KycDocs.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "KYC document not found" });
    res.json({ message: "KYC document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// module.exports = router rou;
export default router;