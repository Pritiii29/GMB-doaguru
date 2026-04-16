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

    const alterQuery = `
    CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientId VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        businessName VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(20),
        password VARCHAR(255),
        placeId VARCHAR(255),
        logo VARCHAR(255),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.query(alterQuery, (err) => {
        if (err) {
            console.error("Error creating clients table:", err.message);
        } else {
            console.log("clients table constructed successfully!");
        }
        setTimeout(() => db.end(), 1000);
    });
});
