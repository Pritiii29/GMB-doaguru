const db = require("../config/db");
const { defaultPlans } = require("../utils/ensureSubscriptionSchema");

const mapConfiguredPlan = (plan, dbPlan = {}) => ({
  id: dbPlan.id ?? null,
  plan_code: plan.code,
  name: plan.name,
  description: plan.description,
  price: plan.price,
  currency: plan.currency || "INR",
  duration_days: plan.durationDays,
  max_reviews_per_month: plan.maxReviewsPerMonth,
  features: plan.features,
  badge: plan.badge || null,
  is_active: dbPlan.is_active ?? 1,
});

const findConfiguredPlan = (dbPlan) =>
  defaultPlans.find(
    (plan) => plan.code === dbPlan?.plan_code || plan.name === dbPlan?.name
  );

const getCodeDrivenPlans = async () => {
  const [dbPlans] = await db
    .promise()
    .query("SELECT id, plan_code, name, is_active FROM subscription_plans WHERE name IS NOT NULL");

  const plansByCode = new Map(
    dbPlans.filter((plan) => plan.plan_code).map((plan) => [plan.plan_code, plan])
  );
  const plansByName = new Map(dbPlans.map((plan) => [plan.name, plan]));

  return defaultPlans
    .map((plan) => {
      const dbPlan = plansByCode.get(plan.code) || plansByName.get(plan.name);
      return mapConfiguredPlan(plan, dbPlan);
    })
    .filter((plan) => plan.is_active === 1 || plan.is_active === true);
};

// Get all subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await getCodeDrivenPlans();
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

exports.getSubscriptionPlanById = async (req, res) => {
  const { planId } = req.params;

  try {
    const plans = await getCodeDrivenPlans();
    const numericPlanId = Number(planId);
    const plan = plans.find(
      (item) => item.id === numericPlanId || item.plan_code === planId
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
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
exports.registerSubscription = async (req, res) => {
  const {
    clientId,
    planId,
    planCode,
    auto_renew = true,
    amount_paid = 0,
    payment_method = 'manual',
    transaction_id = null,
    notes = ''
  } = req.body;

  if (!clientId || (!planId && !planCode)) {
    return res.status(400).json({ message: "clientId and planId are required" });
  }

  try {
    const connection = db.promise();
    const planLookupQuery = planId
      ? "SELECT id, plan_code, name, is_active FROM subscription_plans WHERE id = ? AND name IS NOT NULL AND is_active = 1"
      : "SELECT id, plan_code, name, is_active FROM subscription_plans WHERE plan_code = ? AND name IS NOT NULL AND is_active = 1";
    const planLookupValue = planId || planCode;
    const [planResults] = await connection.query(planLookupQuery, [planLookupValue]);

    if (planResults.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const dbPlan = planResults[0];
    const configuredPlan = findConfiguredPlan(dbPlan);

    if (!configuredPlan) {
      return res.status(404).json({ message: "Plan configuration not found in code" });
    }

    const resolvedPlanId = dbPlan.id;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + configuredPlan.durationDays);

    const [existingResults] = await connection.query(
      "SELECT * FROM subscriptions WHERE clientId = ? AND status = 'active'",
      [clientId]
    );

    if (existingResults.length > 0) {
      const oldSubscriptionId = existingResults[0].id;
      const oldPlanId = existingResults[0].planId;

      await connection.query(
        "UPDATE subscriptions SET status = 'expired' WHERE id = ?",
        [oldSubscriptionId]
      );

      await connection.query(
        "INSERT INTO subscription_history (clientId, subscriptionId, action, old_planId, new_planId, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [clientId, oldSubscriptionId, 'upgraded', oldPlanId, resolvedPlanId, 'Subscription changed']
      );
    }

    const [result] = await connection.query(
      `
        INSERT INTO subscriptions
        (clientId, planId, status, start_date, end_date, auto_renew, amount_paid, payment_method, transaction_id, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [clientId, resolvedPlanId, 'active', startDate, endDate, auto_renew, amount_paid, payment_method, transaction_id, notes]
    );

    await connection.query(
      "INSERT INTO subscription_history (clientId, subscriptionId, action, new_planId) VALUES (?, ?, ?, ?)",
      [clientId, result.insertId, 'created', resolvedPlanId]
    );

    res.status(201).json({
      message: "Subscription registered successfully",
      subscriptionId: result.insertId,
      clientId,
      planId: resolvedPlanId,
      planCode: configuredPlan.code,
      startDate,
      endDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register subscription" });
  }
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
      COUNT(DISTINCT CASE WHEN status = 'active' THEN clientId END) as activeSubscriptions,
      COUNT(DISTINCT CASE WHEN status = 'expired' THEN clientId END) as expiredSubscriptions,
      COUNT(DISTINCT CASE WHEN status = 'cancelled' THEN clientId END) as cancelledSubscriptions,
      SUM(CASE WHEN status = 'active' THEN amount_paid ELSE 0 END) as totalActiveRevenue,
      p.name as planName,
      COUNT(*) as count
    FROM subscriptions s
    LEFT JOIN subscription_plans p ON s.planId = p.id
    GROUP BY p.name
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

    db.query("SELECT plan_code, name FROM subscription_plans WHERE id = ? AND name IS NOT NULL", [subscription.planId], (err, planResults) => {
      if (err || planResults.length === 0) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const configuredPlan = findConfiguredPlan(planResults[0]);
      if (!configuredPlan) {
        return res.status(404).json({ message: "Plan configuration not found in code" });
      }

      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + configuredPlan.durationDays);

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
