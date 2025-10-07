import express from "express";
import User from "../models/User.js";
import companySchema from "../models/companyinfomodel.js";
import UboInfo from "../models/ubomodel.js";
import paymentinformodel from "../models/paymentinformodel.js";
import settlementbankdetails from "../models/settlementbankdetails.js";
import ComplianceRiskManagement from "../models/riskmanagement.js";
import KycDocs from "../models/kycdocs.js";
import { authenticateToken, requireMerchant, requireOwnership } from "../middleware/auth.js";

const router = express.Router();

// Get onboarding status for a merchant
router.get("/status/:merchantid", authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid } = req.params;
    
    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Get completion status for each step
    const steps = await Promise.all([
      companySchema.findOne({ merchantid }),
      UboInfo.findOne({ merchantid }),
      paymentinformodel.findOne({ merchantid }),
      settlementbankdetails.findOne({ merchantid }),
      ComplianceRiskManagement.findOne({ merchantid }),
      KycDocs.findOne({ merchantid })
    ]);

    const stepStatus = {
      companyinformation: {
        completed: steps[0]?.completed || false,
        data: steps[0] || null
      },
      ubo: {
        completed: steps[1]?.completed || false,
        data: steps[1] || null
      },
      paymentandprosessing: {
        completed: steps[2]?.completed || false,
        data: steps[2] || null
      },
      settlmentbankdetails: {
        completed: steps[3]?.completed || false,
        data: steps[3] || null
      },
      riskmanagement: {
        completed: steps[4]?.completed || false,
        data: steps[4] || null
      },
      kycdocs: {
        completed: steps[5]?.completed || false,
        data: steps[5] || null
      }
    };

    const totalSteps = 6;
    const completedSteps = Object.values(stepStatus).filter(step => step.completed).length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    res.json({
      merchantid,
      overallStatus: user.onboardingStatus,
      progress: {
        completed: completedSteps,
        total: totalSteps,
        percentage: progressPercentage
      },
      steps: stepStatus,
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching onboarding status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update onboarding step completion status
router.put("/step/:merchantid/:stepName/complete", authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid, stepName } = req.params;
    const { completed } = req.body;

    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Update the specific step in user's onboardingSteps
    if (user.onboardingSteps[stepName]) {
      user.onboardingSteps[stepName].completed = completed;
      
      // Update overall onboarding status
      const allSteps = Object.values(user.onboardingSteps);
      const allCompleted = allSteps.every(step => step.completed);
      
      if (allCompleted) {
        user.onboardingStatus = 'reviewed';
      } else if (completed) {
        user.onboardingStatus = 'in-progress';
      }
      
      await user.save();
    }

    res.json({ 
      message: `Step ${stepName} completion status updated`,
      completed,
      overallStatus: user.onboardingStatus
    });
  } catch (error) {
    console.error("Error updating step completion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get next incomplete step
router.get("/next-step/:merchantid", authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid } = req.params;
    
    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    const stepOrder = [
      'companyinformation',
      'ubo', 
      'paymentandprosessing',
      'settlmentbankdetails',
      'riskmanagement',
      'kycdocs'
    ];

    const nextIncompleteStep = stepOrder.find(stepName => 
      !user.onboardingSteps[stepName]?.completed
    );

    res.json({
      nextStep: nextIncompleteStep || null,
      allStepsCompleted: !nextIncompleteStep,
      currentStatus: user.onboardingStatus
    });
  } catch (error) {
    console.error("Error finding next step:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset onboarding (admin only)
router.post("/reset/:merchantid", authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.params;
    
    // Only admin can reset onboarding
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Reset all steps to incomplete
    Object.keys(user.onboardingSteps).forEach(stepName => {
      user.onboardingSteps[stepName].completed = false;
    });
    
    user.onboardingStatus = 'pending';
    await user.save();

    res.json({ 
      message: "Onboarding reset successfully",
      status: user.onboardingStatus
    });
  } catch (error) {
    console.error("Error resetting onboarding:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;

