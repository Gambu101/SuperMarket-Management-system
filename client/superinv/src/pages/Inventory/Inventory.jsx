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
  });
  const [search, setSearch] = useState({
    name: "",
    category: "",
    priceMax: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const token = localStorage.getItem("token");

  // === Toast ===
  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  // === Fetch Inventory ===
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(data);
      } catch (err) {
        showToast(err,"Failed to load inventory");
      }
    };
    fetch();
  }, [token]);

  // === Filter ===
  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const nameOk =
        !search.name ||
        item.product_name.toLowerCase().includes(search.name.toLowerCase());
      const catOk =
        !search.category ||
        item.category.toLowerCase().includes(search.category.toLowerCase());
      const priceOk =
        search.priceMax === "" ||
        item.price <= Number(search.priceMax);
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
    });
    setEditingId(null);
  };

  // === Submit (Add or Update Quantity) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { product_name, product_description, quantity, price, category } = form;
    if (!product_name || !quantity || !price || !category) {
      showToast("Fill all required fields");
      return;
    }

    try {
      const payload = {
        product_name,
        product_description,
        quantity: Number(quantity),
        price: Number(price).toFixed(2),
        category,
      };

      let newItem;
      if (editingId) {
        // Full update
        const { data } = await axios.put(
          `/api/inventory/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newItem = data;
      } else {
        // Upsert: add new or increase quantity
        const { data } = await axios.post("/api/inventory", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        newItem = data;
      }

      // Update local state
      setInventory((prev) =>
        prev.map((i) => (i.id === newItem.id ? newItem : i))
      );
      showToast(editingId ? "Updated!" : "Added!", "success");
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
      showToast(err,"Delete failed");
    }
  };

  return (
    <div className="inventory-container">
      {/* Toast */}
      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <h1>Inventory</h1>

      {/* Search */}
      <div className="search-bar">
        <input
          name="name"
          placeholder="Search name..."
          value={search.name}
          onChange={handleSearch}
        />
        <input
          name="category"
          placeholder="Category..."
          value={search.category}
          onChange={handleSearch}
        />
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.product_description || "-"}</td>
                <td>{item.quantity}</td>
                <td>₦{Number(item.price).toFixed(2)}</td>
                <td>{item.category}</td>
                <td>
                  <button onClick={() => startEdit(item)} className="edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="delete">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="inventory-form">
        <h2>{editingId ? "Edit Item" : "Add / Restock"}</h2>
        <div className="form-grid">
          <label>
            Product Name*
            <input
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="product_description"
              value={form.product_description}
              onChange={handleChange}
            />
          </label>
          <label>
            Quantity*
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Price*
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Category*
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">
            {editingId ? "Update" : "Add / Restock"}
          </button>
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