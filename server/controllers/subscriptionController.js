const db = require("../config/db");

// Get all subscription plans
exports.getSubscriptionPlans = (req, res) => {
  const query = "SELECT * FROM subscription_plans WHERE is_active = 1 AND name IS NOT NULL ORDER BY price ASC";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

// Get subscription plan by ID
exports.getSubscriptionPlanById = (req, res) => {
  const { planId } = req.params;

  const query = "SELECT * FROM subscription_plans WHERE id = ? AND name IS NOT NULL";

  db.query(query, [planId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(results[0]);
  });
};

// Get active client details for subscription page
exports.getActiveClientForSubscription = (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    return res.status(400).json({ message: "clientId is required" });
  }

  const query = `
    SELECT 
      c.id,
      c.clientId,
      c.name,
      c.businessName,
      c.email,
      c.mobile,
      c.logo,
      c.isActive,
      s.id as subscriptionId,
      s.status as subscriptionStatus,
      s.start_date,
      s.end_date,
      p.name as planName,
      p.price as planPrice,
      p.duration_days
    FROM clients c
    LEFT JOIN subscriptions s 
      ON s.clientId = c.clientId 
      AND s.status = 'active' 
      AND s.end_date > NOW()
    LEFT JOIN subscription_plans p ON s.planId = p.id
    WHERE c.clientId = ? AND c.isActive = 1
    ORDER BY s.createdAt DESC
    LIMIT 1
  `;

  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Active client not found" });
    }

    res.json(results[0]);
  });
};

// Get client's current subscription
exports.getClientSubscription = (req, res) => {
  const clientId = req.user.clientId || req.user.clientID;

  const query = `
    SELECT s.*, p.name as planName, p.price, p.duration_days, p.max_reviews_per_month, p.features
    FROM subscriptions s
    JOIN subscription_plans p ON s.planId = p.id
    WHERE s.clientId = ? AND s.status = 'active'
    ORDER BY s.createdAt DESC
    LIMIT 1
  `;

  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length === 0) {
      return res.json(null); // No active subscription
    }
    res.json(results[0]);
  });
};

// Register a subscription for a client (Admin only)
exports.registerSubscription = (req, res) => {
  const { clientId, planId, auto_renew = true, amount_paid = 0, payment_method = 'manual', transaction_id = null, notes = '' } = req.body;

  if (!clientId || !planId) {
    return res.status(400).json({ message: "clientId and planId are required" });
  }

  // Get plan details
  db.query("SELECT * FROM subscription_plans WHERE id = ? AND name IS NOT NULL AND is_active = 1", [planId], (err, planResults) => {
    if (err || planResults.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const plan = planResults[0];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    // Check if client already has an active subscription
    db.query(
      "SELECT * FROM subscriptions WHERE clientId = ? AND status = 'active'",
      [clientId],
      (err, existingResults) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }

        if (existingResults.length > 0) {
          // Deactivate old subscription and record history
          const oldSubscriptionId = existingResults[0].id;
          const oldPlanId = existingResults[0].planId;

          db.query(
            "UPDATE subscriptions SET status = 'expired' WHERE id = ?",
            [oldSubscriptionId],
            (err) => {
              if (err) console.error(err);

              // Record in history
              db.query(
                "INSERT INTO subscription_history (clientId, subscriptionId, action, old_planId, new_planId, notes) VALUES (?, ?, ?, ?, ?, ?)",
                [clientId, oldSubscriptionId, 'upgraded', oldPlanId, planId, 'Subscription changed'],
                (err) => {
                  if (err) console.error(err);
                }
              );
            }
          );
        }

        // Insert new subscription
        const insertQuery = `
          INSERT INTO subscriptions 
          (clientId, planId, status, start_date, end_date, auto_renew, amount_paid, payment_method, transaction_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
          insertQuery,
          [clientId, planId, 'active', startDate, endDate, auto_renew, amount_paid, payment_method, transaction_id, notes],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Failed to register subscription" });
            }

            // Record in history
            db.query(
              "INSERT INTO subscription_history (clientId, subscriptionId, action, new_planId) VALUES (?, ?, ?, ?)",
              [clientId, result.insertId, 'created', planId],
              (err) => {
                if (err) console.error(err);
              }
            );

            res.status(201).json({
              message: "Subscription registered successfully",
              subscriptionId: result.insertId,
              clientId,
              planId,
              startDate,
              endDate
            });
          }
        );
      }
    );
  });
};

// Get all subscriptions for a client (Admin)
exports.getClientSubscriptionHistory = (req, res) => {
  const { clientId } = req.params;

  const query = `
    SELECT s.*, p.name as planName, p.price
    FROM subscriptions s
    JOIN subscription_plans p ON s.planId = p.id
    WHERE s.clientId = ?
    ORDER BY s.createdAt DESC
  `;

  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

// Get all subscriptions (Admin only)
exports.getAllSubscriptions = (req, res) => {
  const query = `
    SELECT s.*, p.name as planName, p.price, c.name as clientName, c.email
    FROM subscriptions s
    JOIN subscription_plans p ON s.planId = p.id
    JOIN clients c ON s.clientId = c.clientId
    ORDER BY s.createdAt DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

// Get subscription statistics
exports.getSubscriptionStats = (req, res) => {
  const query = `
    SELECT 
      COUNT(DISTINCT CASE WHEN s.status = 'active' AND s.end_date > NOW() THEN s.clientId END) as activeSubscriptions,
      COUNT(DISTINCT CASE WHEN s.status = 'expired' OR (s.status = 'active' AND s.end_date <= NOW()) THEN s.clientId END) as expiredSubscriptions,
      COUNT(DISTINCT CASE WHEN s.status = 'cancelled' THEN s.clientId END) as cancelledSubscriptions,
      SUM(CASE WHEN s.status = 'active' AND s.end_date > NOW() THEN s.amount_paid ELSE 0 END) as totalActiveRevenue,
      p.name as planName,
      COUNT(*) as count
    FROM subscriptions s
    LEFT JOIN subscription_plans p ON s.planId = p.id
    GROUP BY p.id, p.name
    ORDER BY p.price ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

// Check if subscription is valid
exports.checkSubscriptionValidity = (req, res) => {
  const clientId = req.user.clientId || req.user.clientID;

  const query = `
    SELECT s.*, p.name as planName
    FROM subscriptions s
    JOIN subscription_plans p ON s.planId = p.id
    WHERE s.clientId = ? AND s.status = 'active' AND s.end_date > NOW()
  `;

  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.json({ isValid: false, message: "No active subscription found" });
    }

    const subscription = results[0];
    const daysRemaining = Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      isValid: true,
      subscription: {
        id: subscription.id,
        planName: subscription.planName,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        daysRemaining,
        autoRenew: subscription.auto_renew
      }
    });
  });
};

// Cancel subscription
exports.cancelSubscription = (req, res) => {
  const { subscriptionId } = req.params;

  const query = "UPDATE subscriptions SET status = 'cancelled' WHERE id = ?";

  db.query(query, [subscriptionId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to cancel subscription" });
    }

    // Get subscription details for history
    db.query("SELECT * FROM subscriptions WHERE id = ?", [subscriptionId], (err, results) => {
      if (results && results.length > 0) {
        db.query(
          "INSERT INTO subscription_history (clientId, subscriptionId, action) VALUES (?, ?, ?)",
          [results[0].clientId, subscriptionId, 'cancelled'],
          (err) => {
            if (err) console.error(err);
          }
        );
      }
    });

    res.json({ message: "Subscription cancelled successfully" });
  });
};

// Renew subscription
exports.renewSubscription = (req, res) => {
  const { subscriptionId } = req.params;

  db.query("SELECT * FROM subscriptions WHERE id = ?", [subscriptionId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const subscription = results[0];

    db.query("SELECT duration_days FROM subscription_plans WHERE id = ? AND name IS NOT NULL", [subscription.planId], (err, planResults) => {
      if (err || planResults.length === 0) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + planResults[0].duration_days);

      db.query(
        "UPDATE subscriptions SET end_date = ?, status = 'active', renewal_date = NOW() WHERE id = ?",
        [newEndDate, subscriptionId],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to renew subscription" });
          }

          // Record in history
          db.query(
            "INSERT INTO subscription_history (clientId, subscriptionId, action) VALUES (?, ?, ?)",
            [subscription.clientId, subscriptionId, 'renewed'],
            (err) => {
              if (err) console.error(err);
            }
          );

          res.json({ message: "Subscription renewed successfully", newEndDate });
        }
      );
    });
  });
};
