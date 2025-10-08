import express from "express";
import User from "../models/User.js";
import Company from "../models/companyinfomodel.js";
import UboInfo from "../models/ubomodel.js";
import paymentinformodel from "../models/paymentinformodel.js";
import settlementbankdetails from "../models/settlementbankdetails.js";
import ComplianceRiskManagement from "../models/riskmanagement.js";
import KycDocs from "../models/kycdocs.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/user/profile - Fetch complete user data
router.get("/profile", async (req, res) => {
  try {
    const { merchantid } = req.user;
    
    // Get user data
    const user = await User.findOne({ merchantid })
      .select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all form data
    const [company, ubo, payment, settlement, risk, kyc] = await Promise.all([
      Company.findOne({ merchantid }),
      UboInfo.findOne({ merchantid }),
      paymentinformodel.findOne({ merchantid }),
      settlementbankdetails.findOne({ merchantid }),
      ComplianceRiskManagement.findOne({ merchantid }),
      KycDocs.findOne({ merchantid })
    ]);

    // Calculate progress
    const steps = Object.values(user.onboardingSteps);
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    res.json({
      success: true,
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
      },
      progress: {
        completed: completedSteps,
        total: totalSteps,
        percentage: progressPercentage
      },
      forms: {
        companyinformation: company || null,
        ubo: ubo || null,
        paymentandprosessing: payment || null,
        settlmentbankdetails: settlement || null,
        riskmanagement: risk || null,
        kycdocs: kyc || null
      },
      onboardingSteps: user.onboardingSteps
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// GET /api/user/form-status - Check form completion status
router.get("/form-status", async (req, res) => {
  try {
    const { merchantid } = req.user;
    
    const user = await User.findOne({ merchantid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get completion status for each form
    const [company, ubo, payment, settlement, risk, kyc] = await Promise.all([
      Company.findOne({ merchantid }),
      UboInfo.findOne({ merchantid }),
      paymentinformodel.findOne({ merchantid }),
      settlementbankdetails.findOne({ merchantid }),
      ComplianceRiskManagement.findOne({ merchantid }),
      KycDocs.findOne({ merchantid })
    ]);

    const formStatus = {
      companyinformation: {
        completed: company?.completed || false,
        hasData: !!company,
        lastUpdated: company?.updatedAt || null,
        stepId: 1
      },
      ubo: {
        completed: ubo?.completed || false,
        hasData: !!ubo,
        lastUpdated: ubo?.updatedAt || null,
        stepId: 2
      },
      paymentandprosessing: {
        completed: payment?.completed || false,
        hasData: !!payment,
        lastUpdated: payment?.updatedAt || null,
        stepId: 3
      },
      settlmentbankdetails: {
        completed: settlement?.completed || false,
        hasData: !!settlement,
        lastUpdated: settlement?.updatedAt || null,
        stepId: 4
      },
      riskmanagement: {
        completed: risk?.completed || false,
        hasData: !!risk,
        lastUpdated: risk?.updatedAt || null,
        stepId: 5
      },
      kycdocs: {
        completed: kyc?.completed || false,
        hasData: !!kyc,
        lastUpdated: kyc?.updatedAt || null,
        stepId: 6
      }
    };

    // Calculate overall progress
    const completedForms = Object.values(formStatus).filter(form => form.completed).length;
    const totalForms = Object.keys(formStatus).length;
    const progressPercentage = Math.round((completedForms / totalForms) * 100);

    // Determine next incomplete form
    const stepOrder = [
      'companyinformation',
      'ubo', 
      'paymentandprosessing',
      'settlmentbankdetails',
      'riskmanagement',
      'kycdocs'
    ];

    const nextIncompleteForm = stepOrder.find(formName => 
      !formStatus[formName].completed
    );

    res.json({
      success: true,
      merchantid,
      overallStatus: user.onboardingStatus,
      progress: {
        completed: completedForms,
        total: totalForms,
        percentage: progressPercentage
      },
      forms: formStatus,
      nextIncompleteForm: nextIncompleteForm || null,
      allFormsCompleted: !nextIncompleteForm,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error("Error fetching form status:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// PUT /api/user/profile - Update user profile
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
      success: true,
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
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// GET /api/user/profiles - Get list of all profiles with complete data (Admin only)
router.get("/profiles", async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Admin access required" 
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      role, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.onboardingStatus = status;
    }
    
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phonenumber: { $regex: search, $options: 'i' } },
        { merchantid: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const users = await User.find(query)
      .select('-password') // Exclude passwords
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get all merchant IDs for fetching related data
    const merchantIds = users.map(user => user.merchantid).filter(id => id);

    // Fetch all related data for these merchants
    const [companies, ubos, payments, settlements, risks, kycs] = await Promise.all([
      Company.find({ merchantid: { $in: merchantIds } }),
      UboInfo.find({ merchantid: { $in: merchantIds } }),
      paymentinformodel.find({ merchantid: { $in: merchantIds } }),
      settlementbankdetails.find({ merchantid: { $in: merchantIds } }),
      ComplianceRiskManagement.find({ merchantid: { $in: merchantIds } }),
      KycDocs.find({ merchantid: { $in: merchantIds } })
    ]);

    // Create lookup maps for efficient data retrieval
    const companyMap = new Map(companies.map(comp => [comp.merchantid, comp]));
    const uboMap = new Map(ubos.map(ubo => [ubo.merchantid, ubo]));
    const paymentMap = new Map(payments.map(payment => [payment.merchantid, payment]));
    const settlementMap = new Map(settlements.map(settlement => [settlement.merchantid, settlement]));
    const riskMap = new Map(risks.map(risk => [risk.merchantid, risk]));
    const kycMap = new Map(kycs.map(kyc => [kyc.merchantid, kyc]));

    // Combine user data with all related information
    const usersWithCompleteData = users.map(user => {
      const merchantid = user.merchantid;
      
      return {
        // User information
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
        // Company information
        companyinformation: companyMap.get(merchantid) || null,
        // UBO information
        ubo: uboMap.get(merchantid) || null,
        // Payment information
        paymentandprosessing: paymentMap.get(merchantid) || null,
        // Settlement bank details
        settlmentbankdetails: settlementMap.get(merchantid) || null,
        // Risk management
        riskmanagement: riskMap.get(merchantid) || null,
        // KYC documents
        kycdocs: kycMap.get(merchantid) || null,
        // Summary of completion status
        completionSummary: {
          companyinformation: !!companyMap.get(merchantid),
          ubo: !!uboMap.get(merchantid),
          paymentandprosessing: !!paymentMap.get(merchantid),
          settlmentbankdetails: !!settlementMap.get(merchantid),
          riskmanagement: !!riskMap.get(merchantid),
          kycdocs: !!kycMap.get(merchantid),
          approved: false,
          rejected: false
        }
      };
    });

    // Get additional statistics
    const stats = await User.aggregate([
      { $group: { 
        _id: null,
        totalUsers: { $sum: 1 },
        totalMerchants: { $sum: { $cond: [{ $or: [{ $eq: ["$role", "merchant"] }, { $eq: ["$role", "user"] }] }, 1, 0] } },
        totalAdmins: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
        pendingUsers: { $sum: { $cond: [{ $eq: ["$onboardingStatus", "pending"] }, 1, 0] } },
        inProgressUsers: { $sum: { $cond: [{ $eq: ["$onboardingStatus", "in-progress"] }, 1, 0] } },
        reviewedUsers: { $sum: { $cond: [{ $eq: ["$onboardingStatus", "reviewed"] }, 1, 0] } },
        approvedUsers: { $sum: { $cond: [{ $eq: ["$onboardingStatus", "approved"] }, 1, 0] } },
        rejectedUsers: { $sum: { $cond: [{ $eq: ["$onboardingStatus", "rejected"] }, 1, 0] } }
      }}
    ]);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      users: usersWithCompleteData,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: users.length,
        totalRecords: total,
        limit: parseInt(limit)
      },
      statistics: {
        ...stats[0],
        recentRegistrations
      },
      filters: {
        role,
        status,
        search,
        sortBy,
        sortOrder
      },
      dataSummary: {
        totalUsersWithData: usersWithCompleteData.length,
        usersWithCompanyInfo: usersWithCompleteData.filter(u => u.companyinformation).length,
        usersWithUBOInfo: usersWithCompleteData.filter(u => u.ubo).length,
        usersWithPaymentInfo: usersWithCompleteData.filter(u => u.paymentandprosessing).length,
        usersWithSettlementInfo: usersWithCompleteData.filter(u => u.settlmentbankdetails).length,
        usersWithRiskInfo: usersWithCompleteData.filter(u => u.riskmanagement).length,
        usersWithKYCInfo: usersWithCompleteData.filter(u => u.kycdocs).length
      }
    });
  } catch (error) {
    console.error("Error fetching profiles list:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// GET /api/user/profiles/export - Export all profiles to CSV (Admin only)
router.get("/profiles/export", async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Admin access required" 
      });
    }

    const { role, status } = req.query;

    // Build query
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.onboardingStatus = status;
    }

    // Get all users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Full Name',
      'Email',
      'Phone Number',
      'Location',
      'Merchant ID',
      'Role',
      'Onboarding Status',
      'Company Info Completed',
      'UBO Completed',
      'Payment Info Completed',
      'Settlement Bank Completed',
      'Risk Management Completed',
      'KYC Docs Completed',
      'Created At',
      'Updated At'
    ];

    const csvRows = users.map(user => [
      user._id,
      user.fullname || '',
      user.email || '',
      user.phonenumber || '',
      user.location || '',
      user.merchantid || '',
      user.role || '',
      user.onboardingStatus || '',
      user.onboardingSteps?.companyinformation?.completed || false,
      user.onboardingSteps?.ubo?.completed || false,
      user.onboardingSteps?.paymentandprosessing?.completed || false,
      user.onboardingSteps?.settlmentbankdetails?.completed || false,
      user.onboardingSteps?.riskmanagement?.completed || false,
      user.onboardingSteps?.kycdocs?.completed || false,
      user.createdAt?.toISOString() || '',
      user.updatedAt?.toISOString() || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="user-profiles-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting profiles:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

export default router;
