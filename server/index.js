require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require('bcrypt');
app.use(cors());
app.use(express.json());
const pool = require('./db');
const jwt = require('jsonwebtoken');






// sign in api
app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] = await pool.query(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );
    if (!user.length) {
      return res.status(401).json({ error: "⚠ Invalid email or password" });
    }
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "⚠ Invalid email or password" });
    }
    const token = jwt.sign({ userId: user[0].id }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sign-in failed" });
  }
});
app.post("/api/verify-token", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false });
  }
});

//get username from db
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.SECRET_KEY, (err,user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    console.log('Decoded:', user);
    req.user = user
    next();
  });
}
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [user] = await pool.query('SELECT username FROM Users WHERE id = ?', [userId]);
    res.json({ username: user[0].username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});




//signup to db
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