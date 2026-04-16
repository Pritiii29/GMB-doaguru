const db = require("../config/db");

// Get Reviews (Client specific)
exports.getClientReviews = (req, res) => {
    const clientId = req.user.clientId;

    const { type, search } = req.query;

    let query = `
    SELECT id, fullName, email, mobile, rating, review, createdAt, isPositive
    FROM reviews
    WHERE clientId = ?
  `;

    const queryParams = [clientId];

    if (type === "positive") query += " AND isPositive = TRUE";
    if (type === "negative") query += " AND isPositive = FALSE";
    
    if (search) {
        query += ` AND fullName LIKE ?`;
        queryParams.push(`%${search}%`);
    }

    db.query(query, queryParams, (err, result) => {
        if (err) {
             console.error(err);
             return res.status(500).json({ message: "Error fetching reviews" });
        }
        res.json(result);
    });
};