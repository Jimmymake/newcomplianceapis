
import express from "express";
import mongoose from "mongoose"
import cors from "cors";
import dotenv from "dotenv"
import path from "path";
import authRoutes from "./routes/User.js";
import userProfileRoutes from "./routes/userProfile.js";
import companyinfo from './routes/companyinforroute.js';
import uboinfo from "./routes/uboroute.js";
import paymentInfo  from "./routes/paymentroute.js";
import settlementbank from "./routes/settlementbankdetailroute.js"
import riskmangementinfo from "./routes/riskmanagementroute.js";
import kycinfo from "./routes/kycdocsroute.js";
import onboardingRoutes from "./routes/onboarding.js";
import adminRoutes from "./routes/admin.js";
import dashboardRoutes from "./routes/dashboard.js";
import uploadRoutes from "./routes/upload.js";
import notificationRoutes from "./routes/notifications.js";

const app = express();



// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
dotenv.config();

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });






app.get('/', (req, res) => res.send('Compliance API is running'));

// Authentication routes
app.use('/api', authRoutes);

// User profile routes
app.use('/api/user', userProfileRoutes);

// Onboarding management routes
app.use('/api/onboarding', onboardingRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// User dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// File upload routes
app.use('/api/upload', uploadRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);



// Individual step routes (existing)
// Company info routes
app.use('/api/companyinfor', companyinfo);



//ubo infor
app.use('/api/uboinfo', uboinfo);

//payment info
app.use('/api/paymentinfo', paymentInfo);

//settlement bank info
app.use("/api/settlementbank", settlementbank);

//risk management info
app.use('/api/riskmanagementinfo', riskmangementinfo);

//kyc info
app.use('/api/kycinfo', kycinfo);





// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
