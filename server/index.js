const express = require("express");
// const mysql2 = require("mysql2");
const cors = require("cors");
const app = express();
const bcrypt = require('bcrypt');
app.use(cors());
app.use(express.json());
const pool = require('./db');



app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.status(200).json({ message: "Sign-in successful" });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/signup", async (req, res) => {
  console.log('Received request:', req.body);
  const { username, firstname, lastname, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);
    await pool.query(
      "INSERT INTO Users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, firstname, lastname, email, hashedPassword],
    );
    console.log('User inserted successfully');
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    console.error("Error during registration:", error);
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Username or email already taken" });
    } else {
      res.status(500).json({ error: "Registration failed" });
    }
  }
});
app.listen(5000,()=>{
    console.log('Listening on port 5000...')
})