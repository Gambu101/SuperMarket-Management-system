// src/pages/Inventory.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./Inventory.css";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    quantity: "",
    price: "",
    category: "",
    low_stock_threshold: "5", // default
  });
  const [search, setSearch] = useState({ name: "", category: "", priceMax: "" });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const token = localStorage.getItem("token");

  // === Toast ===
  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  // === Fetch Inventory ===
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(data);

        // Check low stock on load
        data.forEach((item) => {
          if (item.quantity <= item.low_stock_threshold) {
            showToast(
              `${item.product_name}: Only ${item.quantity} left! (Alert: ${item.low_stock_threshold})`,
              "warning"
            );
          }
        });
      } catch (err) {
        showToast(err, "Failed to load inventory");
      }
    };
    fetch();
  }, [token]);

  // === Filter ===
  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const nameOk = !search.name || item.product_name.toLowerCase().includes(search.name.toLowerCase());
      const catOk = !search.category || item.category.toLowerCase().includes(search.category.toLowerCase());
      const priceOk = search.priceMax === "" || item.price <= Number(search.priceMax);
      return nameOk && catOk && priceOk;
    });
  }, [inventory, search]);

  // === Form Handlers ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      product_name: "",
      product_description: "",
      quantity: "",
      price: "",
      category: "",
      low_stock_threshold: "5",
    });
    setEditingId(null);
  };

  // === Submit: Add / Restock / Edit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      product_name,
      product_description,
      quantity,
      price,
      category,
      low_stock_threshold,
    } = form;

    if (!product_name || !quantity || !price || !category || !low_stock_threshold) {
      showToast("Fill all required fields");
      return;
    }

    const qtyNum = Number(quantity);
    const thresholdNum = Number(low_stock_threshold);

    try {
      const payload = {
        product_name,
        product_description: product_description || null,
        quantity: qtyNum,
        price: Number(price).toFixed(2),
        category,
        low_stock_threshold: thresholdNum,
      };

      let newItem;

      if (editingId) {
        const { data } = await axios.put(
          `/api/inventory/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newItem = data;
      } else {
        const { data } = await axios.post("/api/inventory", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        newItem = data;
      }

      // Update state
      setInventory((prev) =>
        prev.map((i) => (i.id === newItem.id ? newItem : i)).concat(
          prev.some((i) => i.id === newItem.id) ? [] : [newItem]
        )
      );

      // Per-item low stock alert on add/restock
      if (newItem.quantity <= newItem.low_stock_threshold) {
        showToast(
          `${newItem.product_name}: Only ${newItem.quantity} left! (Alert: ${newItem.low_stock_threshold})`,
          "warning"
        );
      } else {
        showToast(editingId ? "Updated!" : "Added/Restocked!", "success");
      }

      resetForm();
    } catch (err) {
      showToast(err.response?.data?.error || "Operation failed");
    }
  };

  // === Edit ===
  const startEdit = (item) => {
    setForm({
      product_name: item.product_name,
      product_description: item.product_description || "",
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      low_stock_threshold: item.low_stock_threshold || 5,
    });
    setEditingId(item.id);
  };

  // === Delete ===
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory((prev) => prev.filter((i) => i.id !== id));
      showToast("Deleted", "success");
    } catch (err) {
      showToast(err, "Delete failed");
    }
  };

  return (
    <div className="inventory-container">
      {/* Toast */}
      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <h1>Inventory</h1>

      {/* Search */}
      <div className="search-bar">
        <input name="name" placeholder="Search name..." value={search.name} onChange={handleSearch} />
        <input name="category" placeholder="Category..." value={search.category} onChange={handleSearch} />
        <input
          name="priceMax"
          type="number"
          step="0.01"
          placeholder="Max price..."
          value={search.priceMax}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Category</th>
              <th>Alert Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isLow = item.quantity <= item.low_stock_threshold;
              return (
                <tr key={item.id} className={isLow ? "low-stock-row" : ""}>
                  <td>
                    {item.product_name}
                    {isLow && <span className="low-stock-badge">LOW</span>}
                  </td>
                  <td>{item.product_description || "-"}</td>
                  <td className={isLow ? "low-stock-qty" : ""}>{item.quantity}</td>
                  <td>₦{Number(item.price).toFixed(2)}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className={isLow ? "alert-level low" : "alert-level"}>
                      {item.low_stock_threshold}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => startEdit(item)} className="edit">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="delete">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="inventory-form">
        <h2>{editingId ? "Edit Item" : "Add / Restock"}</h2>
        <div className="form-grid">
          <label>
            Product Name*
            <input name="product_name" value={form.product_name} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea name="product_description" value={form.product_description} onChange={handleChange} />
          </label>
          <label>
            Quantity*
            <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required />
          </label>
          <label>
            Price*
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            Category*
            <input name="category" value={form.category} onChange={handleChange} required />
          </label>
          <label>
            Low Stock Alert*
            <input
              name="low_stock_threshold"
              type="number"
              min="0"
              value={form.low_stock_threshold}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">{editingId ? "Update" : "Add / Restock"}</button>
          {editingId && (
            <button type="button" onClick={resetForm} className="cancel">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Inventory;