const express = require("express");
const router = express.Router();
const { login, logout, verifyAuth } = require("../controllers/authController")
const authmiddleware = require("../middleware/authMiddleware");

router.post("/", login);
router.post("/logout", logout);
router.get("/verify", authmiddleware(), verifyAuth);

module.exports = router;