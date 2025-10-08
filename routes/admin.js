import express from "express";
import User from "../models/User.js";
import companySchema from "../models/companyinfomodel.js";
import UboInfo from "../models/ubomodel.js";
import paymentinformodel from "../models/paymentinformodel.js";
import settlementbankdetails from "../models/settlementbankdetails.js";
import ComplianceRiskManagement from "../models/riskmanagement.js";
import KycDocs from "../models/kycdocs.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// Admin Dashboard Overview
router.get("/dashboard", async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalMerchants = await User.countDocuments({ role: 'merchant' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get onboarding status counts
    const statusCounts = await User.aggregate([
      { $group: { _id: "$onboardingStatus", count: { $sum: 1 } } }
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get completion rates for each step
    const stepCompletionRates = await User.aggregate([
      {
        $project: {
          companyinformation: "$onboardingSteps.companyinformation.completed",
          ubo: "$onboardingSteps.ubo.completed",
          paymentandprosessing: "$onboardingSteps.paymentandprosessing.completed",
          settlmentbankdetails: "$onboardingSteps.settlmentbankdetails.completed",
          riskmanagement: "$onboardingSteps.riskmanagement.completed",
          kycdocs: "$onboardingSteps.kycdocs.completed"
        }
      },
      {
        $group: {
          _id: null,
          companyinformation: { $avg: { $cond: ["$companyinformation", 1, 0] } },
          ubo: { $avg: { $cond: ["$ubo", 1, 0] } },
          paymentandprosessing: { $avg: { $cond: ["$paymentandprosessing", 1, 0] } },
          settlmentbankdetails: { $avg: { $cond: ["$settlmentbankdetails", 1, 0] } },
          riskmanagement: { $avg: { $cond: ["$riskmanagement", 1, 0] } },
          kycdocs: { $avg: { $cond: ["$kycdocs", 1, 0] } }
        }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalMerchants,
        totalAdmins,
        recentRegistrations
      },
      onboardingStatus: statusCounts,
      stepCompletionRates: stepCompletionRates[0] || {},
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all merchants with their onboarding status
router.get("/merchants", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: 'merchant' };
    
    if (status) {
      query.onboardingStatus = status;
    }
    
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { merchantid: { $regex: search, $options: 'i' } }
      ];
    }

    const merchants = await User.find(query)
      .select('fullname email phonenumber merchantid onboardingStatus onboardingSteps createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      merchants,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: merchants.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error("Error fetching merchants:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get detailed merchant information
router.get("/merchants/:merchantid", async (req, res) => {
  try {
    const { merchantid } = req.params;

    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Get all step data
    const [company, ubo, payment, settlement, risk, kyc] = await Promise.all([
      companySchema.findOne({ merchantid }),
      UboInfo.findOne({ merchantid }),
      paymentinformodel.findOne({ merchantid }),
      settlementbankdetails.findOne({ merchantid }),
      ComplianceRiskManagement.findOne({ merchantid }),
      KycDocs.findOne({ merchantid })
    ]);

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
        onboardingSteps: user.onboardingSteps,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      steps: {
        companyinformation: company,
        ubo: ubo,
        paymentandprosessing: payment,
        settlmentbankdetails: settlement,
        riskmanagement: risk,
        kycdocs: kyc
      }
    });
  } catch (error) {
    console.error("Error fetching merchant details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update merchant onboarding status (approve/reject)
router.put("/merchants/:merchantid/status", async (req, res) => {
  try {
    const { merchantid } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected', 'pending', 'in-progress', 'reviewed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    user.onboardingStatus = status;
    await user.save();

    res.json({
      message: `Merchant status updated to ${status}`,
      merchantid,
      status,
      reason
    });
  } catch (error) {
    console.error("Error updating merchant status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get pending reviews
router.get("/reviews/pending", async (req, res) => {
  try {
    const merchants = await User.find({ onboardingStatus: 'reviewed' })
      .select('fullname email merchantid onboardingStatus onboardingSteps createdAt')
      .sort({ updatedAt: -1 });

    res.json({
      pendingReviews: merchants,
      count: merchants.length
    });
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Bulk status update
router.put("/merchants/bulk-status", async (req, res) => {
  try {
    const { merchantids, status, reason } = req.body;

    if (!Array.isArray(merchantids) || merchantids.length === 0) {
      return res.status(400).json({ message: "Merchant IDs array is required" });
    }

    if (!['approved', 'rejected', 'pending', 'in-progress', 'reviewed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await User.updateMany(
      { merchantid: { $in: merchantids } },
      { onboardingStatus: status }
    );

    res.json({
      message: `Updated ${result.modifiedCount} merchants to ${status}`,
      modifiedCount: result.modifiedCount,
      status,
      reason
    });
  } catch (error) {
    console.error("Error bulk updating status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Analytics - Step completion over time
router.get("/analytics/step-completion", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stepCompletion = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          role: 'merchant'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          companyinformation: { $avg: { $cond: ["$onboardingSteps.companyinformation.completed", 1, 0] } },
          ubo: { $avg: { $cond: ["$onboardingSteps.ubo.completed", 1, 0] } },
          paymentandprosessing: { $avg: { $cond: ["$onboardingSteps.paymentandprosessing.completed", 1, 0] } },
          settlmentbankdetails: { $avg: { $cond: ["$onboardingSteps.settlmentbankdetails.completed", 1, 0] } },
          riskmanagement: { $avg: { $cond: ["$onboardingSteps.riskmanagement.completed", 1, 0] } },
          kycdocs: { $avg: { $cond: ["$onboardingSteps.kycdocs.completed", 1, 0] } }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    res.json({
      stepCompletion,
      period: `${days} days`,
      startDate,
      endDate: new Date()
    });
  } catch (error) {
    console.error("Error fetching step completion analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Approve merchant - matches frontend expected URL
router.put("/approve-merchant/:merchantId", async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { reason, notes } = req.body;

    const user = await User.findOne({ merchantid: merchantId });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Update user status to approved
    user.onboardingStatus = 'approved';
    await user.save();

    res.json({
      message: "Merchant approved successfully",
      merchantId,
      status: 'approved',
      reason,
      notes,
      approvedAt: new Date(),
      approvedBy: req.user.email || req.user.fullname
    });
  } catch (error) {
    console.error("Error approving merchant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reject merchant - matches frontend expected URL
router.put("/reject-merchant/:merchantId", async (req, res) => {
  try {
    const { merchantId } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const user = await User.findOne({ merchantid: merchantId });
    if (!user) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Update user status to rejected
    user.onboardingStatus = 'rejected';
    await user.save();

    res.json({
      message: "Merchant rejected successfully",
      merchantId,
      status: 'rejected',
      reason,
      notes,
      rejectedAt: new Date(),
      rejectedBy: req.user.email || req.user.fullname
    });
  } catch (error) {
    console.error("Error rejecting merchant:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;

