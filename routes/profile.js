const express = require("express");
const router = express.Router();
const auth = require("../User");

// Protected route
router.get("/profile", auth, (req, res) => {
  res.json({
    message: "This is your profile",
    user: req.user // contains fullname & email from token
  });
});

module.exports = router;
