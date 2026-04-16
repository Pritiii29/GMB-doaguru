const router = require("express").Router();
const auth = require("../middleware/authmiddleware");

const {
    getClientReviews,
} = require("../controllers/clientController");

// 🔥 ONLY CLIENT ACCESS
router.get("/reviews", auth(["client"]), getClientReviews);

module.exports = router;