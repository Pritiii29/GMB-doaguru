const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { email, password } = req.body;

  // First check admin
  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, result) => {
    if (result && result.length > 0) {
      const admin = result[0];
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
    db.query("SELECT * FROM clients WHERE email = ?", [email], async (err, result) => {
      if (!result || result.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = result[0];
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
    });
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
  // If we reach here, it means authmiddleware passed.
  res.json({ isAuthenticated: true, user: req.user });
};