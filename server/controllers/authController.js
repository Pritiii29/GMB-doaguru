const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ensureSubscriptionSchema = require("../utils/ensureSubscriptionSchema");

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // First check admin
  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, adminResult) => {
    if (err) {
      console.error("Admin DB Error:", err);
      return res.status(500).json({ message: "Admin DB Error: " + err.message });
    }

    try {
      if (adminResult && adminResult.length > 0) {
        const admin = adminResult[0];

        if (!admin.password) {
          return res.status(500).json({ message: "Admin account has no password set" });
        }

        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
          return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
          { id: admin.id, role: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
        });

        return res.json({ message: "Admin login success", role: "admin" });
      }

      // If not admin, check client
      db.query("SELECT * FROM clients WHERE email = ?", [email], async (err2, clientResult) => {
        if (err2) {
          console.error("Client DB Error:", err2);
          return res.status(500).json({ message: "Client DB Error: " + err2.message });
        }

        try {
          if (!clientResult || clientResult.length === 0) {
            return res.status(400).json({ message: "User not found" });
          }

          const user = clientResult[0];

          if (!user.password) {
            return res.status(500).json({ message: "Client account has no password set" });
          }

          if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated. Contact admin." });
          }

          const match = await bcrypt.compare(password, user.password);

          if (!match) {
            return res.status(400).json({ message: "Invalid password" });
          }

          ensureSubscriptionSchema()
            .then(() => {
              // Check subscription validity
              db.query(
                "SELECT s.*, p.name as planName FROM subscriptions s JOIN subscription_plans p ON s.planId = p.id WHERE s.clientId = ? AND s.status = 'active' AND s.end_date > NOW()",
                [user.clientId],
                (err, subscriptionResult) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error checking subscription" });
                  }

                  const hasActiveSubscription = subscriptionResult && subscriptionResult.length > 0;

                  if (!hasActiveSubscription) {
                    // Return a special message that indicates subscription is required
                    return res.status(403).json({
                      message: "No active subscription. Please register for a subscription plan.",
                      needsSubscription: true,
                      clientId: user.clientId
                    });
                  }

                  const token = jwt.sign(
                    {
                      clientId: user.clientId || user.clientID,
                      role: "client",
                      businessName: user.businessName,
                      logo: user.logo,
                      subscriptionId: subscriptionResult[0].id,
                      planName: subscriptionResult[0].planName
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                  );

                  res.cookie("token", token, {
                    httpOnly: true,
                    sameSite: "lax",
                  });

                  return res.json({
                    message: "Client login success",
                    role: "client",
                    subscription: {
                      id: subscriptionResult[0].id,
                      planName: subscriptionResult[0].planName,
                      endDate: subscriptionResult[0].end_date
                    }
                  });
                }
              );
            })
            .catch((error) => {
              console.error("Subscription setup error:", error);
              return res.status(500).json({ message: "Subscription setup failed" });
            });
        } catch (error) {
          console.error("Client login verification error:", error);
          return res.status(500).json({ message: "Internal server error during login" });
        }
      });
    } catch (error) {
      console.error("Admin login verification error:", error);
      return res.status(500).json({ message: "Internal server error during login" });
    }
  });
};

exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "lax"
  });
  res.json({ message: "Logout successful" });
};

exports.verifyAuth = (req, res) => {
  res.json({ isAuthenticated: true, user: req.user });
};
