import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      merchantid: user.merchantid,
      role: user.role,
      onboardingStatus: user.onboardingStatus
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Middleware to check if user is merchant
export const requireMerchant = (req, res, next) => {
  if (req.user.role !== 'merchant') {
    return res.status(403).json({ message: "Merchant access required" });
  }
  next();
};

// Middleware to check if user owns the resource (merchant can only access their own data)
export const requireOwnership = (req, res, next) => {
  const resourceMerchantId = req.params.merchantid || req.body.merchantid;
  
  if (req.user.role === 'admin') {
    return next(); // Admin can access any resource
  }
  
  if (req.user.merchantid !== resourceMerchantId) {
    return res.status(403).json({ message: "Access denied: You can only access your own data" });
  }
  
  next();
};

