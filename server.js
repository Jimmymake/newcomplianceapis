// require('dotenv').config();
// const express = require('express');
import express from "express";
// const mongoose = require('mongoose');
import mongoose from "mongoose"
// const cors = require('cors');
import cors from "cors";
import dotenv from "dotenv";

// const authRoutes = require('./routes/User');
// const authRoutes = require("./routes/User"); 
import authRoutes from "./routes/User.js";
// const login = require("./routes/login"); 
import companyinfor from './routes/companyinfor.js'
// import 
const app = express();



// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies
dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merchantdb';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });




// Routes




app.get('/', (req, res) => res.send('Merchant API is running'));



app.use('/api', authRoutes  );
 

app.use('/api/companyinfor', companyinfor);



//routes end here



// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
