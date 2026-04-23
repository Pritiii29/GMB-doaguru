const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");
const ensureSubscriptionSchema = require("../utils/ensureSubscriptionSchema");

router.use(async (req, res, next) => {
  try {
    await ensureSubscriptionSchema();
    next();
  } catch (error) {
    console.error("Subscription schema setup error:", error);
    res.status(500).json({ message: "Subscription setup failed" });
  }
});

// Public routes
router.get("/plans", subscriptionController.getSubscriptionPlans);
router.get("/plans/:planId", subscriptionController.getSubscriptionPlanById);
router.get("/client/:clientId", subscriptionController.getActiveClientForSubscription);

// Protected routes (Authenticated users)
router.get("/my-subscription", authMiddleware(), subscriptionController.getClientSubscription);
router.get("/check-validity", authMiddleware(), subscriptionController.checkSubscriptionValidity);

// Admin routes
router.post("/register", authMiddleware(["admin"]), subscriptionController.registerSubscription);

router.get("/admin/all", authMiddleware(["admin"]), subscriptionController.getAllSubscriptions);

router.get("/admin/stats", authMiddleware(["admin"]), subscriptionController.getSubscriptionStats);

router.get("/admin/history/:clientId", authMiddleware(["admin"]), subscriptionController.getClientSubscriptionHistory);

router.put("/cancel/:subscriptionId", authMiddleware(["admin"]), subscriptionController.cancelSubscription);

router.put("/renew/:subscriptionId", authMiddleware(["admin"]), subscriptionController.renewSubscription);

module.exports = router;
