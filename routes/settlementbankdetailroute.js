// import express from "express";
// import settlementinfo from "../models/settlementbankdetails.js";


// const router = express.Router();

// router.post("/", async (req, res) => {
//     try {
//         const settlement = new settlementinfo(req.body);
//         await settlement.save();
//         res.status(201).json(settlement)
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server error" })

//     }

// })


// export default router;
import express from "express";
import settlementbankdetails from "../models/settlementbankdetails.js";
import User from "../models/User.js";
import { authenticateToken, requireOwnership } from "../middleware/auth.js";

const router = express.Router();

// POST /api/settlementbank - Create settlement bank details
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const settlementData = { ...req.body, merchantid };

    // Check if settlement bank details already exist
    const existingSettlement = await settlementbankdetails.findOne({ merchantid });
    if (existingSettlement) {
      return res.status(400).json({ 
        message: 'Settlement bank details already exist for this merchant',
        settlementId: existingSettlement._id
      });
    }

    const settlement = new settlementbankdetails(settlementData);
    await settlement.save();

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.settlmentbankdetails.completed = true;
      await user.save();
    }

    res.status(201).json({
      message: 'Settlement bank details created successfully',
      settlement,
      onboardingUpdated: true
    });
  } catch (err) {
    console.error('Error creating settlement bank details:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/settlementbank - Update settlement bank details for current user
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const updateData = req.body;

    // Remove merchantid from update data to prevent changing it
    delete updateData.merchantid;

    // Mark as completed when form is submitted with data
    updateData.completed = true;

    const settlement = await settlementbankdetails.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!settlement) {
      return res.status(404).json({ message: 'Settlement bank details not found' });
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.settlmentbankdetails.completed = true;
      await user.save();
    }

    res.json({
      message: 'Settlement bank details updated successfully',
      settlement
    });
  } catch (error) {
    console.error('Error updating settlement bank details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/settlementbank - Get settlement bank details for current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    
    const settlement = await settlementbankdetails.findOne({ merchantid });
    if (!settlement) {
      return res.status(404).json({ message: 'Settlement bank details not found' });
    }

    res.json({
      settlement,
      stepCompleted: settlement.completed
    });
  } catch (error) {
    console.error('Error fetching settlement bank details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
