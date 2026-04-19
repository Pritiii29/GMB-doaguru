const db = require("../config/db");

exports.getClientProfile = (req, res) => {
    const clientId = req.user.clientId || req.user.clientID;
    if (!clientId) return res.status(401).json({ message: "Invalid payload" });

    db.query("SELECT id, clientId, name, businessName, email, mobile, placeId, logo, isActive FROM clients WHERE clientId = ?", [clientId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) return res.status(404).json({ message: "Client not found" });
        res.json(results[0]);
    });
};

exports.updateClientProfile = (req, res) => {
    const clientId = req.user.clientId || req.user.clientID;
    const { name, businessName, mobile, logo } = req.body;

    const query = `
        UPDATE clients
        SET name = ?, businessName = ?, mobile = ?, logo = ?, updatedAt = NOW()
        WHERE clientId = ?
    `;

    db.query(query, [name, businessName, mobile, logo, clientId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Update failed" });
        }

        res.json({ message: "Profile updated successfully" });
    });
};

exports.getClientReviews = (req, res) => {
    const clientId = req.user.clientId || req.user.clientID;
    if (!clientId) return res.status(401).json({ message: "Invalid payload" });

    const { type, search } = req.query;

    let query = "SELECT * FROM reviews WHERE clientId = ?";
    let params = [clientId];

    // Optional filters if they exist
    if (type) {
        query += " AND isPositive = ?";
        params.push(type === 'positive');
    }
    if (search) {
        query += " AND (fullName LIKE ? OR email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY createdAt DESC";

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};