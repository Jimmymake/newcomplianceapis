import express from "express";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get notifications for the current user
router.get("/", async (req, res) => {
  try {
    const { merchantid, role } = req.user;
    
    // For now, we'll generate notifications based on user status
    // In a real app, you'd have a notifications collection
    const notifications = await generateNotifications(merchantid, role);
    
    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark notification as read
router.put("/:notificationId/read", async (req, res) => {
  try {
    // In a real app, you'd update the notification in the database
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark all notifications as read
router.put("/read-all", async (req, res) => {
  try {
    // In a real app, you'd update all notifications for the user
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Helper function to generate notifications based on user status
async function generateNotifications(merchantid, role) {
  const notifications = [];
  
  if (role === 'merchant') {
    const user = await User.findOne({ merchantid });
    if (user) {
      // Welcome notification
      notifications.push({
        id: 'welcome',
        type: 'info',
        title: 'Welcome to Compliance Portal',
        message: 'Your merchant account has been created successfully. Please complete the onboarding process.',
        read: false,
        createdAt: user.createdAt
      });

      // Onboarding progress notifications
      const steps = Object.values(user.onboardingSteps);
      const completedSteps = steps.filter(step => step.completed).length;
      const totalSteps = steps.length;

      if (completedSteps > 0 && completedSteps < totalSteps) {
        notifications.push({
          id: 'progress',
          type: 'info',
          title: 'Onboarding Progress',
          message: `You have completed ${completedSteps} out of ${totalSteps} steps. Keep going!`,
          read: false,
          createdAt: new Date()
        });
      }

      // Status-specific notifications
      switch (user.onboardingStatus) {
        case 'reviewed':
          notifications.push({
            id: 'under-review',
            type: 'warning',
            title: 'Application Under Review',
            message: 'Your application is currently being reviewed by our compliance team.',
            read: false,
            createdAt: new Date()
          });
          break;
        case 'approved':
          notifications.push({
            id: 'approved',
            type: 'success',
            title: 'Application Approved!',
            message: 'Congratulations! Your merchant application has been approved.',
            read: false,
            createdAt: new Date()
          });
          break;
        case 'rejected':
          notifications.push({
            id: 'rejected',
            type: 'error',
            title: 'Application Rejected',
            message: 'Your application was rejected. Please contact support for more information.',
            read: false,
            createdAt: new Date()
          });
          break;
      }
    }
  } else if (role === 'admin') {
    // Admin notifications
    const pendingReviews = await User.countDocuments({ onboardingStatus: 'reviewed' });
    const newRegistrations = await User.countDocuments({
      role: 'merchant',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (pendingReviews > 0) {
      notifications.push({
        id: 'pending-reviews',
        type: 'warning',
        title: 'Pending Reviews',
        message: `You have ${pendingReviews} merchant applications waiting for review.`,
        read: false,
        createdAt: new Date()
      });
    }

    if (newRegistrations > 0) {
      notifications.push({
        id: 'new-registrations',
        type: 'info',
        title: 'New Registrations',
        message: `${newRegistrations} new merchant(s) registered in the last 24 hours.`,
        read: false,
        createdAt: new Date()
      });
    }
  }

  // Sort by creation date (newest first)
  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default router;
