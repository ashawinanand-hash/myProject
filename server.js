require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

// Allow frontend to talk to this server
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());
// Serve the frontend (index.html, style.css, script.js) from /public
app.use(express.static(path.join(__dirname, "public")));

// ---- MySQL connection pool ----
// A pool (not a single connection) is required for serverless platforms
// like Vercel, where many function instances can run at once. Each query
// borrows a connection from the pool and releases it back automatically.
//
// SSL is OFF by default (fine for local MySQL). Set DB_SSL=true in your
// cloud environment's variables once you're using a cloud database.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

// Quick check that the pool can actually reach the database at startup
pool.query("SELECT 1", (err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// ---- Route to handle form submission ----
app.post("/register", (req, res) => {
  const { sname, fname, mname, Contactno, email, dob, address } = req.body;

  const sql = `INSERT INTO students (sname, fname, mname, contact_no, email, dob, address)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [sname, fname, mname, Contactno, email, dob, address];

  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Insert failed:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    console.log("✅ Inserted row id:", result.insertId);
    res.json({ success: true, message: "Registration saved!" });
  });
});

// ---- Local dev server (Vercel ignores this and uses the export below) ----
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Required for Vercel to run this as a serverless function
module.exports = app;