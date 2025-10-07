import express from "express";
import User from "../models/User.js";
import companySchema from "../models/companyinfomodel.js";
import UboInfo from "../models/ubomodel.js";
import paymentinformodel from "../models/paymentinformodel.js";
import settlementbankdetails from "../models/settlementbankdetails.js";
import ComplianceRiskManagement from "../models/riskmanagement.js";
import KycDocs from "../models/kycdocs.js";
import { authenticateToken, requireMerchant } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken, requireMerchant);

// Get user dashboard overview
router.get("/overview", async (req, res) => {
  try {
    const { merchantid } = req.user;
    
    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate progress
    const steps = Object.values(user.onboardingSteps);
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    // Get step details
    const stepDetails = await Promise.all([
      companySchema.findOne({ merchantid }),
      UboInfo.findOne({ merchantid }),
      paymentinformodel.findOne({ merchantid }),
      settlementbankdetails.findOne({ merchantid }),
      ComplianceRiskManagement.findOne({ merchantid }),
      KycDocs.findOne({ merchantid })
    ]);

    const stepStatus = {
      companyinformation: {
        completed: stepDetails[0]?.completed || false,
        hasData: !!stepDetails[0],
        lastUpdated: stepDetails[0]?.updatedAt
      },
      ubo: {
        completed: stepDetails[1]?.completed || false,
        hasData: !!stepDetails[1],
        lastUpdated: stepDetails[1]?.updatedAt
      },
      paymentandprosessing: {
        completed: stepDetails[2]?.completed || false,
        hasData: !!stepDetails[2],
        lastUpdated: stepDetails[2]?.updatedAt
      },
      settlmentbankdetails: {
        completed: stepDetails[3]?.completed || false,
        hasData: !!stepDetails[3],
        lastUpdated: stepDetails[3]?.updatedAt
      },
      riskmanagement: {
        completed: stepDetails[4]?.completed || false,
        hasData: !!stepDetails[4],
        lastUpdated: stepDetails[4]?.updatedAt
      },
      kycdocs: {
        completed: stepDetails[5]?.completed || false,
        hasData: !!stepDetails[5],
        lastUpdated: stepDetails[5]?.updatedAt
      }
    };

    // Determine next action
    const stepOrder = [
      'companyinformation',
      'ubo', 
      'paymentandprosessing',
      'settlmentbankdetails',
      'riskmanagement',
      'kycdocs'
    ];

    const nextIncompleteStep = stepOrder.find(stepName => 
      !stepStatus[stepName].completed
    );

    res.json({
      user: {
        fullname: user.fullname,
        email: user.email,
        merchantid: user.merchantid,
        onboardingStatus: user.onboardingStatus,
        createdAt: user.createdAt
      },
      progress: {
        completed: completedSteps,
        total: totalSteps,
        percentage: progressPercentage
      },
      steps: stepStatus,
      nextAction: nextIncompleteStep ? {
        step: nextIncompleteStep,
        message: `Complete ${nextIncompleteStep} to continue`
      } : {
        step: null,
        message: "All steps completed! Your application is under review."
      },
      status: {
        current: user.onboardingStatus,
        message: getStatusMessage(user.onboardingStatus)
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get specific step data
router.get("/step/:stepName", async (req, res) => {
  try {
    const { stepName } = req.params;
    const { merchantid } = req.user;

    let stepData = null;
    let model = null;

    switch (stepName) {
      case 'companyinformation':
        model = companySchema;
        break;
      case 'ubo':
        model = UboInfo;
        break;
      case 'paymentandprosessing':
        model = paymentinformodel;
        break;
      case 'settlmentbankdetails':
        model = settlementbankdetails;
        break;
      case 'riskmanagement':
        model = ComplianceRiskManagement;
        break;
      case 'kycdocs':
        model = KycDocs;
        break;
      default:
        return res.status(400).json({ message: "Invalid step name" });
    }

    stepData = await model.findOne({ merchantid });

    res.json({
      step: stepName,
      data: stepData,
      completed: stepData?.completed || false,
      lastUpdated: stepData?.updatedAt
    });
  } catch (error) {
    console.error("Error fetching step data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const { merchantid } = req.user;
    
    const user = await User.findOne({ merchantid })
      .select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        phonenumber: user.phonenumber,
        location: user.location,
        merchantid: user.merchantid,
        role: user.role,
        onboardingStatus: user.onboardingStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const { merchantid } = req.user;
    const { fullname, phonenumber, location } = req.body;

    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    if (fullname) user.fullname = fullname;
    if (phonenumber) user.phonenumber = phonenumber;
    if (location) user.location = location;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        fullname: user.fullname,
        email: user.email,
        phonenumber: user.phonenumber,
        location: user.location,
        merchantid: user.merchantid
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get onboarding timeline/history
router.get("/timeline", async (req, res) => {
  try {
    const { merchantid } = req.user;
    
    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const timeline = [
      {
        step: 'registration',
        title: 'Account Created',
        description: 'Your merchant account was created',
        completed: true,
        date: user.createdAt,
        status: 'completed'
      }
    ];

    // Add step completions to timeline
    const stepOrder = [
      { key: 'companyinformation', title: 'Company Information', description: 'Company details submitted' },
      { key: 'ubo', title: 'UBO Information', description: 'Ultimate Beneficial Owner details submitted' },
      { key: 'paymentandprosessing', title: 'Payment Processing', description: 'Payment processing information submitted' },
      { key: 'settlmentbankdetails', title: 'Settlement Bank Details', description: 'Bank details submitted' },
      { key: 'riskmanagement', title: 'Risk Management', description: 'Risk management information submitted' },
      { key: 'kycdocs', title: 'KYC Documents', description: 'KYC documents submitted' }
    ];

    stepOrder.forEach(step => {
      const stepData = user.onboardingSteps[step.key];
      if (stepData) {
        timeline.push({
          step: step.key,
          title: step.title,
          description: step.description,
          completed: stepData.completed,
          date: stepData.completed ? stepData.updatedAt : null,
          status: stepData.completed ? 'completed' : 'pending'
        });
      }
    });

    // Add final status
    if (user.onboardingStatus === 'approved') {
      timeline.push({
        step: 'approval',
        title: 'Application Approved',
        description: 'Your merchant application has been approved',
        completed: true,
        date: user.updatedAt,
        status: 'completed'
      });
    } else if (user.onboardingStatus === 'rejected') {
      timeline.push({
        step: 'rejection',
        title: 'Application Rejected',
        description: 'Your merchant application was rejected',
        completed: true,
        date: user.updatedAt,
        status: 'rejected'
      });
    }

    // Sort by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      timeline,
      currentStatus: user.onboardingStatus,
      progress: {
        completed: timeline.filter(item => item.completed).length,
        total: timeline.length
      }
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Helper function to get status message
function getStatusMessage(status) {
  const messages = {
    'pending': 'Your application is pending. Please complete all required steps.',
    'in-progress': 'Your application is in progress. Continue completing the required steps.',
    'reviewed': 'Your application is under review. We will notify you of the decision.',
    'approved': 'Congratulations! Your application has been approved.',
    'rejected': 'Your application was rejected. Please contact support for more information.'
  };
  return messages[status] || 'Unknown status';
}

export default router;

