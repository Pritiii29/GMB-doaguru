const db = require('../config/db');

module.exports = (req, res, next) => {
    const clientId = req.user.clientId || req.user.clientID;
    if (!clientId) return res.status(401).json({ message: "Invalid payload" });

    db.query("SELECT isActive FROM clients WHERE clientId = ?", [clientId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(403).json({ message: "Client not found or db error" });
        }
        if (!results[0].isActive) {
            return res.status(403).json({ message: "Account deactivated. Contact admin." });
        }
        next();
    });
};