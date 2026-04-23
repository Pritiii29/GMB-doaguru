const router = require("express").Router();

const auth = require("../middleware/authmiddleware");
const checkClientActive = require("../middleware/checkClientActive");

const {
    getClientReviews,
    updateClientProfile,
    getClientProfile,
    getClientNotifications,
    markClientNotificationRead
} = require("../controllers/clientController");


router.use(auth(["client"]), checkClientActive);

router.get("/profile", getClientProfile);


router.put("/profile", updateClientProfile);


router.get("/reviews", getClientReviews);

// Notifications
router.get("/notifications", getClientNotifications);
router.put("/notifications/:id/read", markClientNotificationRead);


module.exports = router;