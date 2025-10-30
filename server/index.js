require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
app.use(cors());
app.use(express.json());
const pool = require("./db");
const jwt = require("jsonwebtoken");

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    const [user] = await pool.query("SELECT username FROM Users WHERE id = ?", [
      decoded.userId,
    ]);
    req.user = { id: decoded.userId, username: user[0].username };
    next();
  });
}

// API endpoint to sign in
app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] = await pool.query("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
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

// API endpoint to verify token
app.post("/api/verify-token", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false });
  }
});

// API endpoint to get user data
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [user] = await pool.query("SELECT username FROM Users WHERE id = ?", [
      userId,
    ]);
    res.json({ username: user[0].username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// API endpoint to sign up
app.post("/api/signup", async (req, res) => {
  console.log("Received request:", req.body);
  const { username, firstname, lastname, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);
    await pool.query(
      "INSERT INTO Users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, firstname, lastname, email, hashedPassword],
    );
    console.log("User inserted successfully");
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

// API endpoint to get inventory
app.get("/api/inventory", authenticateToken, async (req, res) => {
  try {
    const [inventory] = await pool.query("SELECT * FROM Inventory");
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error fetching inventory", details: error.message });
  }
});

// API endpoint to add to inventory
app.post("/api/inventory", authenticateToken, async (req, res) => {
  try {
    const { product_name, product_description, quantity, price, category } =
      req.body;
    const [result] = await pool.query(
      "INSERT INTO Inventory (product_name, product_description, quantity, price, category) VALUES (?, ?, ?, ?, ?)",
      [product_name, product_description, quantity, price, category],
    );
    const [inventory] = await pool.query(
      "SELECT * FROM Inventory WHERE id = ?",
      [result.insertId],
    );
    res.json(inventory[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding to inventory" });
  }
});

// API endpoint to make a sale
app.post("/api/sale", authenticateToken, async (req, res) => {
  const { cart } = req.body;
  const userId = req.user.id; // assuming req.user is set by the authenticateToken middleware

  try {
    await pool.query("START TRANSACTION");

    // Insert transaction records
    const transactionQuery =
      "INSERT INTO Transactions (user_id, product_id, product_name, transaction_date, quantity, total_price) VALUES ?";
    const transactionValues = Object.values(cart).map((item) => [
      userId,
      item.product.id,
      item.product.product_name,
      new Date(),
      item.quantity,
      item.product.price * item.quantity,
    ]);
    await pool.query(transactionQuery, [transactionValues]);

    // Update inventory quantity for each product in the cart
    for (const item of Object.values(cart)) {
      const updateQuery =
        "UPDATE Inventory SET quantity = quantity - ? WHERE id = ?";
      await pool.query(updateQuery, [item.quantity, item.product.id]);
    }

    await pool.query("COMMIT");
    res.json({ message: "Sale made successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error making sale" });
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000...");
});
