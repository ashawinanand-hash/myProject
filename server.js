require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");


const app = express();

// Allow frontend (running on a different port/file) to talk to this server
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// ---- MySQL connection config ----
// Replace 'yourpassword' with the password you set in MySQL Workbench
const db = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password : process.env.DB_PASSWORD,
  database: "student_registration",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database");
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
