import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken, requireMerchant, requireOwnership } from "../middleware/auth.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { merchantid, stepName } = req.params;
    const stepDir = path.join(uploadsDir, merchantid, stepName);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(stepDir)) {
      fs.mkdirSync(stepDir, { recursive: true });
    }
    
    cb(null, stepDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload single file for a specific step
router.post("/:merchantid/:stepName", authenticateToken, requireOwnership, upload.single('file'), async (req, res) => {
  try {
    const { merchantid, stepName } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
      stepName,
      merchantid
    };

    res.json({
      message: "File uploaded successfully",
      file: fileInfo,
      url: `/uploads/${merchantid}/${stepName}/${req.file.filename}`
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Upload multiple files for a specific step
router.post("/:merchantid/:stepName/multiple", authenticateToken, requireOwnership, upload.array('files', 10), async (req, res) => {
  try {
    const { merchantid, stepName } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filesInfo = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
      stepName,
      merchantid
    }));

    res.json({
      message: `${req.files.length} files uploaded successfully`,
      files: filesInfo,
      urls: req.files.map(file => `/uploads/${merchantid}/${stepName}/${file.filename}`)
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get uploaded files for a merchant and step
router.get("/:merchantid/:stepName", authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid, stepName } = req.params;
    const stepDir = path.join(uploadsDir, merchantid, stepName);
    
    if (!fs.existsSync(stepDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(stepDir).map(filename => {
      const filePath = path.join(stepDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        uploadedAt: stats.birthtime,
        url: `/uploads/${merchantid}/${stepName}/${filename}`
      };
    });

    res.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a specific file
router.delete("/:merchantid/:stepName/:filename", authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid, stepName, filename } = req.params;
    const filePath = path.join(uploadsDir, merchantid, stepName, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);
    
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Serve uploaded files (static file serving)
router.get("/serve/:merchantid/:stepName/:filename", authenticateToken, requireOwnership, async (req, res) => {
  try {
    const { merchantid, stepName, filename } = req.params;
    const filePath = path.join(uploadsDir, merchantid, stepName, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;





