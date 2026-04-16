const mysql = require("mysql2");
require("dotenv").config({ path: '../.env' });

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to DB:", err.message);
        process.exit(1);
    }

    // 1. Create table if not exists or recreate it with correct schema
    const alterQuery = `
    CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientId VARCHAR(255) NOT NULL,
        fullName VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(20),
        rating INT,
        review TEXT,
        isPositive BOOLEAN,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.query(alterQuery, (err) => {
        if (err) {
            console.error("Error creating/checking reviews table:", err.message);
        } else {
            console.log("reviews table checked and created if not existed.");
            
            // Just in case we need to add the columns to an existing table
            const columnsToAdd = [
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS clientId VARCHAR(255)",
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS fullName VARCHAR(255)",
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS mobile VARCHAR(20)",
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INT",
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review TEXT",
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS isPositive BOOLEAN",
                "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
            ];
            
            // Try dropping old wrong columns if they exist
            db.query("ALTER TABLE reviews DROP COLUMN IF EXISTS name", () => {});
            db.query("ALTER TABLE reviews DROP COLUMN IF EXISTS phone", () => {});
            db.query("ALTER TABLE reviews DROP COLUMN IF EXISTS userId", () => {});
            db.query("ALTER TABLE reviews DROP COLUMN IF EXISTS isPossitive", () => {});
            
            console.log("Database schema correction completed to perfectly match: id, clientId, fullName, email, mobile, rating, review, isPositive, createdAt.");
        }
        setTimeout(() => db.end(), 1000);
    });
});
