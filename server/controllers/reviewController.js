const db = require("../config/db");

exports.submitReview = (req, res) => {
  const { clientId, rating } = req.body;
  const fullName = req.body.fullName || req.body.name;
  const email = req.body.email || null;
  const mobile = req.body.mobile || null;
  const review = req.body.review || req.body.message;

  const isPositive = rating >= 4;

  const insertReview = (placeId) => {
    const query = "INSERT INTO reviews (clientId, fullName, email, mobile, rating, review, isPositive) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [clientId, fullName, email, mobile, rating, review, isPositive],
      (err) => {
        if (err) {
           console.error(err);
           return res.status(500).json({ message: "Error submitting review" });
        }

        if (isPositive) {
          return res.json({
            redirect: "google",
            url: `https://search.google.com/local/writereview?placeid=${placeId}`,
          });
        } else {
          return res.json({ redirect: "internal" });
        }
      }
    );
  };

  if (clientId === 'admin' || clientId === 'default-client-id') {
    const adminPlaceId = 'ChIJT-5eGRaxgTkRxyMc7_psGWI';
    return insertReview(adminPlaceId);
  }

  // 1. Get client placeId
  db.query(
    "SELECT placeId FROM clients WHERE clientId = ?",
    [clientId],
    (err, clientResult) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (clientResult.length === 0) {
        return res.status(400).json({ message: "Client not found" });
      }

      insertReview(clientResult[0].placeId);
    }
  );
};

// Admin dashboard ke liye
// Admin dashboard ke liye - Sare reviews with Business Name
exports.getAllReviews = (req, res) => {
  const { clientId } = req.query;

  let query = `
    SELECT r.*, 
    CASE 
      WHEN r.clientId = 'admin' THEN 'DOAGuru'
      WHEN r.clientId = 'default-client-id' THEN 'DOAGuru'
      ELSE c.businessName 
    END as businessName
    FROM reviews r
    LEFT JOIN clients c ON r.clientId = c.clientId
  `;
  const params = [];

  if (clientId && clientId !== 'all') {
    query += " WHERE r.clientId = ?";
    params.push(clientId);
  }

  query += " ORDER BY r.createdAt DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error in getAllReviews:", err);
      return res.status(500).json({ message: "DB Error" });
    }
    res.json(results);
  });
};