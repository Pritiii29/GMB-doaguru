const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const auth = require("../middleware/authmiddleware"); 

// Generate QR code for the logged-in client/admin
router.get('/generate', auth(["admin", "client"]), qrController.generateQRCode);

module.exports = router;
