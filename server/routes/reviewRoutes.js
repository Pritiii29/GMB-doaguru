const express = require("express");
const router = express.Router();
const { submitReview, getAllReviews } = require("../controllers/reviewController");
const authmiddleware = require("../middleware/authmiddleware");

router.post("/", submitReview);

router.get("/all", authmiddleware(["admin"]), getAllReviews);
module.exports = router;