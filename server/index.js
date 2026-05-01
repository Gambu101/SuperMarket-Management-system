require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
app.use(cors());
app.use(express.json());
const pool = require("./db");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

// Email transporter using environment variables
let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: parseInt(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send low-stock email
const sendLowStockEmail = async (userEmail, lowItems) => {
  const itemsList = lowItems
    .map(
      (item) =>
        `<li><strong>${item.product_name}</strong>: ${item.quantity} left (threshold: ${item.low_stock_threshold})</li>`,
    )
    .join("");

  const mailOptions = {
    from: `"SuperInv Alerts" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🚨 Low Stock Alert - SuperInv`,
    html: `
      <h2>Low Stock Alert</h2>
      <p>Hello! The following items need restocking:</p>
      <ul>${itemsList}</ul>
      <p>Kindly update </p>
      <p>Best,<br>SuperInv Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Low-stock email sent to ${userEmail}`);
  } catch (err) {
    console.error("Email failed:", err);
  }
};

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Middleware to check if user is manager or admin
function requireManager(req, res, next) {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: "Manager or Admin access required" });
  }
  next();
}

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

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
const token = jwt.sign(
      { id: user[0].id, role: user[0].role },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );
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
    const [rows] = await pool.query("SELECT username, role FROM Users WHERE id = ?", [
      req.user.id,
    ]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    res.json({ username: rows[0].username, role: rows[0].role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// API endpoint to sign up
app.post("/api/signup", async (req, res) => {
  console.log("Received request:", req.body);
  const { username, firstname, lastname, email, password, role = 'user' } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);
    await pool.query(
      "INSERT INTO Users (username, firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, firstname, lastname, email, hashedPassword, role],
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

//GET for /api/inventory
app.get("/api/inventory", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Inventory ORDER BY product_name",
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Dedicated endpoint to check low stock and send email alert
app.post("/api/check-low-stock", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Inventory ORDER BY product_name",
    );

    const lowItems = rows.filter(
      (item) => item.quantity <= item.low_stock_threshold,
    );

    // Get user email
    const [userRows] = await pool.query(
      "SELECT email FROM Users WHERE id = ?",
      [req.user.id],
    );
    const userEmail = userRows[0]?.email;

    if (!userEmail) {
      return res.status(400).json({ error: "User email not found" });
    }

    if (lowItems.length > 0) {
      await sendLowStockEmail(userEmail, lowItems);
      return res.json({ 
        message: `Low stock alert sent for ${lowItems.length} items`,
        lowItems 
      });
    }

    res.json({ message: "No low stock items", lowItems: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Check failed" });
  }
});

// Helper function to log stock activities
const logStockActivity = async (
  userId,
  activityType,
  productId,
  productName,
  quantityChanged,
  previousQuantity,
  newQuantity,
  details = null
) => {
  try {
    await pool.query(
      `INSERT INTO StockActivityLog 
       (user_id, activity_type, product_id, product_name, quantity_changed, previous_quantity, new_quantity, details, activity_timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        activityType,
        productId,
        productName,
        quantityChanged,
        previousQuantity,
        newQuantity,
        details,
      ]
    );
  } catch (err) {
    console.error("Failed to log stock activity:", err);
  }
};

//POST for /api/inventory → UPSERT (add or restock)
app.post("/api/inventory", authenticateToken, async (req, res) => {
  const {
    product_name,
    product_description,
    quantity,
    price,
    category,
    low_stock_threshold = 5,
  } = req.body;
  const userId = req.user.id;

  try {
    const [existing] = await pool.query(
      "SELECT id, quantity FROM Inventory WHERE product_name = ?",
      [product_name],
    );

    let result;
    if (existing.length > 0) {
      const previousQty = existing[0].quantity;
      const newQty = existing[0].quantity + Number(quantity);
      await pool.query(
        "UPDATE Inventory SET quantity = ?, price = ?, category = ?, product_description = ?, low_stock_threshold = ? WHERE id = ?",
        [
          newQty,
          price,
          category,
          product_description || null,
          low_stock_threshold,
          existing[0].id,
        ],
      );
      result = {
        id: existing[0].id,
        product_name,
        product_description,
        quantity: newQty,
        price,
        category,
        low_stock_threshold,
      };
      // Log ADD/RESTOCK activity (adding quantity to existing item)
      await logStockActivity(
        userId,
        "ADD",
        existing[0].id,
        product_name,
        Number(quantity),
        previousQty,
        newQty,
        JSON.stringify({ action: "restock", price, category })
      );
    } else {
      const [insert] = await pool.query(
        "INSERT INTO Inventory (product_name, product_description, quantity, price, category, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?)",
        [
          product_name,
          product_description || null,
          quantity,
          price,
          category,
          low_stock_threshold,
        ],
      );
      result = {
        id: insert.insertId,
        product_name,
        product_description,
        quantity,
        price,
        category,
        low_stock_threshold,
      };
      // Log ADD activity (new item added)
      await logStockActivity(
        userId,
        "ADD",
        insert.insertId,
        product_name,
        Number(quantity),
        0,
        Number(quantity),
        JSON.stringify({ action: "new_item", price, category })
      );
    }

    // Send email if low
    const [userRows] = await pool.query(
      "SELECT email FROM Users WHERE id = ?",
      [userId],
    );
    const userEmail = userRows[0]?.email;
    if (userEmail && result.quantity <= low_stock_threshold) {
      await sendLowStockEmail(userEmail, [result]);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upsert failed" });
  }
});

//PUT for /api/inventory/:id
app.put("/api/inventory/:id", authenticateToken, async (req, res) => {
  const {
    product_name,
    product_description,
    quantity,
    price,
    category,
    low_stock_threshold,
  } = req.body;
  const id = req.params.id;
  const userId = req.user.id;

  try {
    // Get previous quantity before update
    const [existing] = await pool.query(
      "SELECT product_name, quantity FROM Inventory WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    const previousQty = existing[0].quantity;
    const previousName = existing[0].product_name;

    const [result] = await pool.query(
      "UPDATE Inventory SET product_name = ?, product_description = ?, quantity = ?, price = ?, category = ?, low_stock_threshold = ? WHERE id = ?",
      [
        product_name,
        product_description || null,
        quantity,
        price,
        category,
        low_stock_threshold,
        id,
      ],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updatedItem = {
      id,
      product_name,
      product_description,
      quantity,
      price,
      category,
      low_stock_threshold,
    };

    // Log EDIT activity
    await logStockActivity(
      userId,
      "EDIT",
      id,
      product_name,
      Number(quantity) - previousQty,
      previousQty,
      Number(quantity),
      JSON.stringify({ action: "edit", price, category })
    );

    // Send email if now low
    const [userRows] = await pool.query(
      "SELECT email FROM Users WHERE id = ?",
      [userId],
    );
    const userEmail = userRows[0]?.email;
    if (userEmail && quantity <= low_stock_threshold) {
      await sendLowStockEmail(userEmail, [updatedItem]);
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

//DELETE for /api/inventory/:id
app.delete("/api/inventory/:id", authenticateToken, async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    // Get item details before delete for logging
    const [existing] = await pool.query(
      "SELECT product_name, quantity FROM Inventory WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    const productName = existing[0].product_name;
    const previousQty = existing[0].quantity;

    const [result] = await pool.query("DELETE FROM Inventory WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    // Log DELETE activity
    await logStockActivity(
      userId,
      "DELETE",
      id,
      productName,
      -previousQty,
      previousQty,
      0,
      JSON.stringify({ action: "delete" })
    );

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// GET /api/transactions – all sales to be viewed by current user
app.get("/api/transactions", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         t.id,
         t.product_name,
         t.quantity,
         t.unit_price,
         t.total_price,
         t.transaction_date
       FROM Transactions t
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC`,
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
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
      "INSERT INTO Transactions (user_id, product_id, product_name, transaction_date, quantity, unit_price, total_price) VALUES ?";
    const transactionValues = Object.values(cart).map((item) => [
      userId,
      item.product.id,
      item.product.product_name,
      new Date(),
      item.quantity,
      item.product.price,
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

// Admin APIs

// GET /api/admin/users - List all users (admin only)
app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, firstname, lastname, email, role FROM Users ORDER BY username"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users - Create user with role (admin only)
app.post("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  const { username, firstname, lastname, email, password, role = 'user' } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO Users (username, firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [username, firstname, lastname, email, hashedPassword, role]
    );
    res.status(201).json({
      id: result.insertId,
      username,
      firstname,
      lastname,
      email,
      role,
      message: "User created successfully"
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Username or email already taken" });
    } else {
      res.status(500).json({ error: "User creation failed" });
    }
  }
});

// PUT /api/admin/users/:id/role - Change user role (admin only)
app.put("/api/admin/users/:id/role", authenticateToken, requireAdmin, async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!['user', 'manager', 'admin'].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Users SET role = ? WHERE id = ?",
      [role, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User role updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Role update failed" });
  }
});

// DELETE /api/admin/users/:id - Delete user (admin only)
app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }

  try {
    const [result] = await pool.query("DELETE FROM Users WHERE id = ?", [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "User deletion failed" });
  }
});

// GET /api/admin/all-transactions - View all transactions (admin only)
app.get("/api/admin/all-transactions", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         t.id,
         t.product_name,
         t.quantity,
         t.unit_price,
         t.total_price,
         t.transaction_date,
         u.username as user_username
       FROM Transactions t
       LEFT JOIN Users u ON t.user_id = u.id
       ORDER BY t.transaction_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all transactions" });
  }
});

// Manager APIs

// GET /api/manager/inventory - View all inventory (manager/admin only)
app.get("/api/manager/inventory", authenticateToken, requireManager, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Inventory ORDER BY product_name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// GET /api/manager/transactions - View all transactions (manager/admin only)
app.get("/api/manager/transactions", authenticateToken, requireManager, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         t.id,
         t.product_name,
         t.quantity,
         t.unit_price,
         t.total_price,
         t.transaction_date,
         u.username as user_username
       FROM Transactions t
       LEFT JOIN Users u ON t.user_id = u.id
       ORDER BY t.transaction_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all transactions" });
  }
});

// GET /api/manager/reports - Sales reports (manager/admin only)
app.get("/api/manager/reports", authenticateToken, requireManager, async (req, res) => {
  try {
    // Total sales by product
    const [productSales] = await pool.query(
      `SELECT
         product_name,
         SUM(quantity) as total_quantity_sold,
         SUM(total_price) as total_revenue
       FROM Transactions
       GROUP BY product_name
       ORDER BY total_revenue DESC`
    );

    // Daily sales summary
    const [dailySales] = await pool.query(
      `SELECT
         DATE(transaction_date) as date,
         COUNT(*) as total_transactions,
         SUM(total_price) as daily_revenue
       FROM Transactions
       GROUP BY DATE(transaction_date)
       ORDER BY date DESC
       LIMIT 30`
    );

    // Current inventory value
    const [inventoryValue] = await pool.query(
      `SELECT
         SUM(quantity * price) as total_inventory_value,
         COUNT(*) as total_products
       FROM Inventory`
    );

    res.json({
      productSales,
      dailySales,
      inventorySummary: inventoryValue[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate reports" });
  }
});

app.listen(5000, () => {
  console.log("Listening on port 5000...");
});
