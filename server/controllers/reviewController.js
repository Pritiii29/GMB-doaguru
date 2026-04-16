const db = require("../config/db");

exports.submitReview = (req, res) => {
  const { clientId, fullName, email, mobile, rating, review } = req.body;

  const isPositive = rating >= 4;

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

      const placeId = clientResult[0].placeId;

      // 2. Insert directly into reviews
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
    }
  );
};

// Admin dashboard ke liye
exports.getAllReviews = (req, res) => {
  db.query("SELECT * FROM reviews ORDER BY createdAt DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB Error" });
    }
    res.json(results);
  });
};