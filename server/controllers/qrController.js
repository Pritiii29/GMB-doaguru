const QRCode = require('qrcode');

exports.generateQRCode = async (req, res) => {
    try {
        // Assume req.user contains clientId from admin dashboard or similar
        const clientId = req.user.clientId || 'demo-client';
        
        // Define frontend base URL ideally from env
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const reviewUrl = `${baseUrl}/review/${clientId}`;

        // Generate QR Code as Data URI
        const qrCodeDataUrl = await QRCode.toDataURL(reviewUrl, {
            width: 300,
            color: {
                dark: '#0f172a',  // slate-900
                light: '#ffffff'  // white
            }
        });

        res.json({ qrCodeDataUrl, reviewUrl });
    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).json({ message: "Failed to generate QR code" });
    }
};
