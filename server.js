require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ---- Serve static frontend (public/index.html, css, js, etc.) ----
app.use(express.static(path.join(__dirname, "public")));

// ---- MySQL connection using cloud DB credentials (env vars) ----
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// ---- API health check (moved off root so the form can load at "/") ----
app.get("/api/status", (req, res) => {
  res.send("Student Registration API is running 🚀");
});

// ---- Route to handle form submission ----
app.post("/register", (req, res) => {
  const { sname, fname, mname, Contactno, email, dob, address } = req.body;

  const sql = `INSERT INTO students (sname, fname, mname, contact_no, email, dob, address)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [sname, fname, mname, Contactno, email, dob, address];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Insert failed:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    console.log("✅ Inserted row id:", result.insertId);
    res.json({ success: true, message: "Registration saved!" });
  });
});

// Local dev only — Vercel ignores this and uses the export below
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Required for Vercel to treat this as a serverless function
module.exports = app;