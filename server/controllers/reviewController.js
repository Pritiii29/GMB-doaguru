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

  if (clientId === 'admin' || clientId === 'admin') {
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
  const { clientId, dateRange, startDate, endDate } = req.query;

  let query = `
    SELECT r.*, 
    CASE 
      WHEN r.clientId = 'admin' THEN 'DOAGuru'
      ELSE c.businessName 
    END as businessName
    FROM reviews r
    LEFT JOIN clients c ON r.clientId = c.clientId
    WHERE 1=1
  `;
  const params = [];

  if (clientId && clientId !== 'all') {
    query += " AND r.clientId = ?";
    params.push(clientId);
  }

  if (dateRange) {
    if (dateRange === 'Custom Range' && startDate && endDate) {
        query += " AND r.createdAt >= ? AND r.createdAt <= ?";
        params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    } else if (dateRange === 'This Month') {
        query += " AND MONTH(r.createdAt) = MONTH(NOW()) AND YEAR(r.createdAt) = YEAR(NOW())";
    } else if (dateRange === 'Last Month') {
        query += " AND r.createdAt >= DATE_SUB(DATE_FORMAT(NOW() ,'%Y-%m-01'), INTERVAL 1 MONTH) AND r.createdAt < DATE_FORMAT(NOW() ,'%Y-%m-01')";
    } else if (dateRange === 'Last 3 Months') {
        query += " AND r.createdAt >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    } else if (dateRange === 'Last 6 Months') {
        query += " AND r.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)";
    } else if (dateRange === 'Last 12 Months') {
        query += " AND r.createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)";
    }
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