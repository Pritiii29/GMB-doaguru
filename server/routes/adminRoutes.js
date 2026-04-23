const router = require("express").Router();
const auth = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createClient,
    getClients,
    toggleClientStatus,
    updateClient,
    getNotifications,
    markNotificationRead,
    testNotifications,
} = require("../controllers/adminController");

router.post("/clients", auth(["admin"]), createClient);
router.get("/clients", auth(["admin"]), getClients);
router.put("/clients/:clientId/status", auth(["admin"]), toggleClientStatus);
router.put("/clients/:clientId", auth(["admin"]), updateClient);

// Upload logo
router.post("/upload", auth(["admin", "client"]), upload.single("logo"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    // Return the relative URL of the uploaded image
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Notifications
router.get("/notifications", auth(["admin"]), getNotifications);
router.put("/notifications/:id/read", auth(["admin"]), markNotificationRead);
router.get("/test-notifications", auth(["admin"]), testNotifications);

module.exports = router;