const db = require('../config/db');
const bcrypt = require('bcryptjs');
const generateClientId = require('../utils/generateClientId');

exports.createClient = async (req, res) => {
    const { name, businessName, email, mobile, password, placeId, logo } = req.body;

    const clientId = generateClientId(); // Note spelling depends on what was exported. It's actually exported as generateClienetId but assigned locally. So require works.
    
    try {
        const hashed = await bcrypt.hash(password, 10);

        const query = `
        INSERT INTO clients 
        (clientId, name, businessName, email, mobile, password, placeId, logo, isActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        db.query(
            query,
            [clientId, name, businessName, email, mobile, hashed, placeId, logo, true], // Default active
            (err) => {
                if (err) {
                    console.error("DB Error:", err);
                    return res.status(500).json({ message: "Error creating client" });
                }

                res.json({ message: "Client created successfully" });
            }
        );
    } catch (error) {
        console.error("Hashing error", error);
        res.status(500).json({ message: "Error creating client credentials" });
    }
};

// Get Clients
exports.getClients = (req, res) => {
    db.query("SELECT * FROM clients ORDER BY createdAt DESC", (err, result) => {
        if (err) {
            console.error("DB Error in getClients:", err);
            return res.status(500).json({ message: "Error fetching clients: " + err.message, sqlError: err });
        }
        
        // Remove passwords before sending to frontend
        const safeClients = result.map(client => {
            const { password, ...safeData } = client;
            return safeData;
        });

        res.json(safeClients);
    });
};

// Toggle client status
exports.toggleClientStatus = (req, res) => {
    const { clientId } = req.params;
    const { isActive } = req.body; // Expect boolean

    const query = "UPDATE clients SET isActive = ? WHERE clientId = ?";
    db.query(query, [isActive, clientId], (err) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Error updating status" });
        }
        res.json({ message: `Client status updated to ${isActive ? 'Active' : 'Inactive'}` });
    });
};