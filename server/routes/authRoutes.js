const express = require("express");
const router = express.Router();
const { login, logout, verifyAuth } = require("../controllers/authController")
const authmiddleware = require("../middleware/authmiddleware");

router.post("/", login);
router.post("/logout", logout);
// Provide empty array to authmiddleware to accept any authenticated user (admin or client)
router.get("/verify", authmiddleware(), verifyAuth);

module.exports = router;