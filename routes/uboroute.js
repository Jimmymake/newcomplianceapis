import express from "express";
import UboInfo from "../models/ubomodel.js";
import User from "../models/User.js";
import { authenticateToken, requireOwnership } from "../middleware/auth.js";

const router = express.Router();

// POST /api/uboinfo - Create UBO information
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const uboData = { ...req.body, merchantid };

    // Check if UBO info already exists
    const existingUbo = await UboInfo.findOne({ merchantid });
    if (existingUbo) {
      return res.status(400).json({ 
        message: 'UBO information already exists for this merchant',
        uboId: existingUbo._id
      });
    }

    const ubo = new UboInfo(uboData);
    await ubo.save();

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.ubo.completed = true;
      await user.save();
    }

    res.status(201).json({
      message: 'UBO information created successfully',
      ubo,
      onboardingUpdated: true
    });
  } catch (err) {
    console.error('Error creating UBO info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// ✅ List all UBOInfos
router.get("/list", async (req, res) => {
  try {
    const ubos = await UboInfo.find();
    res.status(200).json(ubos);
  } catch (error) {
    console.error("Error fetching ubos:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ List UBOInfos by merchantid (optional)
router.get("/list/:merchantid", async (req, res) => {
  try {
    const ubos = await UboInfo.findOne({ merchantid: req.params.merchantid });
    if (!ubos) {
      return res.status(404).json({ message: "No UBOs found for this merchant" });
    }
    res.status(200).json(ubos);
  } catch (error) {
    console.error("Error fetching ubo by merchantid:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// PUT /api/uboinfo - Update UBO information for current user
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const updateData = req.body;

    // Remove merchantid from update data to prevent changing it
    delete updateData.merchantid;

    // Mark as completed when form is submitted with data
    updateData.completed = true;

    const ubo = await UboInfo.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!ubo) {
      return res.status(404).json({ message: 'UBO information not found' });
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.ubo.completed = true;
      await user.save();
    }

    res.json({
      message: 'UBO information updated successfully',
      ubo
    });
  } catch (error) {
    console.error('Error updating UBO info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * ✅ Update all UBOs for a merchant (replace array)
 */
router.put("/ubos/:merchantid", authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid } = req.params;
    const { ubo } = req.body; // expect array of ubos

    const updated = await UboInfo.findOneAndUpdate(
      { merchantid },
      { $set: { ubo } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating UBOs:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ Update a single UBO inside the array by index
 */
router.put("/ubos/:merchantid/:index", async (req, res) => {
  try {
    const { merchantid, index } = req.params;
    const updateData = req.body; // partial update e.g. { fullname: "New Name" }

    const record = await UboInfo.findOne({ merchantid });
    if (!record) return res.status(404).json({ message: "Merchant not found" });

    if (!record.ubo[index]) {
      return res.status(404).json({ message: "UBO not found at this index" });
    }

    // merge updates
    record.ubo[index] = { ...record.ubo[index]._doc, ...updateData };

    await record.save();
    res.status(200).json(record);
  } catch (error) {
    console.error("Error updating single UBO:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ❌ Delete a single UBO from the array by index
 */
router.delete("/ubos/:merchantid/:index", async (req, res) => {
  try {
    const { merchantid, index } = req.params;

    const record = await UboInfo.findOne({ merchantid });
    if (!record) return res.status(404).json({ message: "Merchant not found" });

    if (!record.ubo[index]) {
      return res.status(404).json({ message: "UBO not found at this index" });
    }

    record.ubo.splice(index, 1); // remove UBO at index
    await record.save();

    res.status(200).json({ message: "UBO deleted successfully", record });
  } catch (error) {
    console.error("Error deleting UBO:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ❌ Delete all UBOs for a merchant
 */
router.delete("/ubos/:merchantid", async (req, res) => {
  try {
    const { merchantid } = req.params;

    const updated = await UboInfo.findOneAndUpdate(
      { merchantid },
      { $set: { ubo: [] } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.status(200).json({ message: "All UBOs deleted successfully", updated });
  } catch (error) {
    console.error("Error deleting UBOs:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
