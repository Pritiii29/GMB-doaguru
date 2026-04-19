const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");


exports.createClient = (req, res) => {
    const { name, businessName, email, mobile, password, placeID, logo } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    const clientID = uuidv4();

    const query = `
        INSERT INTO clients 
        (clientID, name, businessName, email, mobile, password, placeID, logo, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())
    `;

    db.query(
        query,
        [clientID, name, businessName, email, mobile, password, placeID, logo],
        (err) => {
            if (err) {
                console.error(err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Email already exists" });
                }

                return res.status(500).json({ message: "Error creating client" });
            }

            res.status(201).json({
                message: "Client created successfully",
                clientID
            });
        }
    );
};



exports.clientLogin = (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM clients WHERE email = ?`;

    db.query(query, [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email" });
        }

        const client = result[0];

        if (!client.isActive) {
            return res.status(403).json({
                message: "Account is deactivated. Contact admin."
            });
        }

        if (client.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.json({
            message: "Login successful",
            client: {
                id: client.id,
                clientID: client.clientID,
                name: client.name,
                businessName: client.businessName
            }
        });
    });
};



exports.updateClientProfile = (req, res) => {
    const clientId = req.user.id; // from auth middleware

    const { name, businessName, mobile, logo } = req.body;

    const query = `
        UPDATE clients
        SET name = ?, businessName = ?, mobile = ?, logo = ?, updatedAt = NOW()
        WHERE id = ?
    `;

    db.query(query, [name, businessName, mobile, logo, clientId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Update failed" });
        }

        res.json({ message: "Profile updated successfully" });
    });
};


exports.toggleClientStatus = (req, res) => {
    const clientId = req.params.id;
    const { isActive } = req.body;

    const query = `
        UPDATE clients
        SET isActive = ?, updatedAt = NOW()
        WHERE id = ?
    `;

    db.query(query, [isActive, clientId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Status update failed" });
        }

        res.json({
            message: isActive
                ? "Client activated successfully"
                : "Client deactivated successfully"
        });
    });
};