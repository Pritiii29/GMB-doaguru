const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function registerAdmin(email, password) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to database...");

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = "INSERT INTO admins (email, password) VALUES (?, ?)";
    const [result] = await connection.execute(query, [email, hashedPassword]);

    console.log(`Success! Admin registered with ID: ${result.insertId}`);
    
    await connection.end();
  } catch (error) {
    console.error("Error registering admin:", error.message);
  }
}

const args = process.argv.slice(2);
if (args.length >= 2) {
  registerAdmin(args[0], args[1]);
} else {
  console.log("Usage: node registerAdmin.js <email> <password>");
}
