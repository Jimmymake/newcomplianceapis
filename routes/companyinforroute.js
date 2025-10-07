
import express from 'express';
import mongoose from 'mongoose';
import Company from '../models/companyinfomodel.js';
import User from '../models/User.js';
import { authenticateToken, requireOwnership } from '../middleware/auth.js';

const router = express.Router();

// Create company information for a merchant
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const companyData = { ...req.body, merchantid };

    // Check if company info already exists for this merchant
    const existingCompany = await Company.findOne({ merchantid });
    if (existingCompany) {
      return res.status(400).json({ 
        message: 'Company information already exists for this merchant',
        companyId: existingCompany._id
      });
    }

    // Validate required fields
    if (!companyData.companyName) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = new Company(companyData);
    await company.save();

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.companyinformation.completed = true;
      user.onboardingSteps.companyinformation.companyName = companyData.companyName;
      await user.save();
    }

    res.status(201).json({
      message: 'Company information created successfully',
      company,
      onboardingUpdated: true
    });
  } catch (err) {
    console.error('Error creating company info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get company information by merchant ID
router.get('/merchant/:merchantid', authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid } = req.params;
    
    const company = await Company.findOne({ merchantid });
    if (!company) {
      return res.status(404).json({ message: 'Company information not found' });
    }

    res.json({
      company,
      stepCompleted: company.completed
    });
  } catch (err) {
    console.error('Error fetching company info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current user's company information
router.get('/my-company', authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    
    const company = await Company.findOne({ merchantid });
    if (!company) {
      return res.status(404).json({ message: 'Company information not found' });
    }

    res.json({
      company,
      stepCompleted: company.completed
    });
  } catch (err) {
    console.error('Error fetching company info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update company information by merchant ID
router.put('/merchant/:merchantid', authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid } = req.params;
    const updateData = req.body;

    // Remove merchantid from update data to prevent changing it
    delete updateData.merchantid;

    // Mark as completed when form is submitted with data
    updateData.completed = true;

    const company = await Company.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company information not found' });
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.companyinformation.completed = true;
      if (updateData.companyName) {
        user.onboardingSteps.companyinformation.companyName = updateData.companyName;
      }
      await user.save();
    }

    res.json({
      message: 'Company information updated successfully',
      company
    });
  } catch (err) {
    console.error('Error updating company info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update current user's company information
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { merchantid } = req.user;
    const updateData = req.body;

    // Remove merchantid from update data to prevent changing it
    delete updateData.merchantid;

    // Mark as completed when form is submitted with data
    updateData.completed = true;
    updateData.merchantid = merchantid;
    updateData.stepid = 1;

    const company = await Company.findOneAndUpdate(
      { merchantid },
      updateData,
      { new: true, runValidators: true, upsert: true }
    );

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.companyinformation.completed = true;
      if (updateData.companyName) {
        user.onboardingSteps.companyinformation.companyName = updateData.companyName;
      }
      await user.save();
    }

    res.json({
      message: 'Company information updated successfully',
      company
    });
  } catch (err) {
    console.error('Error updating company info:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark company information as complete
router.put('/merchant/:merchantid/complete', authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid } = req.params;
    const { completed } = req.body;

    const company = await Company.findOneAndUpdate(
      { merchantid },
      { completed },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company information not found' });
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid });
    if (user) {
      user.onboardingSteps.companyinformation.completed = completed;
      await user.save();
    }

    res.json({
      message: `Company information marked as ${completed ? 'complete' : 'incomplete'}`,
      company
    });
  } catch (err) {
    console.error('Error updating completion status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List all companies (Admin only - requires admin role check in middleware)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 20, search, completed } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { merchantid: { $regex: search, $options: 'i' } },
        { companyEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(query);

    res.json({
      companies,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: companies.length,
        totalRecords: total
      }
    });
  } catch (err) {
    console.error('Error fetching companies list:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get company by ID (Admin only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (err) {
    console.error('Error fetching company by ID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete company information (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const company = await Company.findByIdAndDelete(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update user's onboarding step
    const user = await User.findOne({ merchantid: company.merchantid });
    if (user) {
      user.onboardingSteps.companyinformation.completed = false;
      user.onboardingSteps.companyinformation.companyName = '';
      await user.save();
    }

    res.json({ 
      message: 'Company information deleted successfully',
      deletedCompany: company
    });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;