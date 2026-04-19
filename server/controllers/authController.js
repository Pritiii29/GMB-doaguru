const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

          const match = await bcrypt.compare(password, user.password);

          if (!match) {
            return res.status(400).json({ message: "Invalid password" });
          }

          const token = jwt.sign(
            {
              clientId: user.clientId,
              role: "client",
              businessName: user.businessName,
              logo: user.logo
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
          });

          return res.json({ message: "Client login success", role: "client" });
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