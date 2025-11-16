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
    low_stock_threshold: "",
  });
  const [search, setSearch] = useState({ name: "", category: "", priceMax: "" });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [globalDefaultThreshold, setGlobalDefaultThreshold] = useState(() => {
    const saved = localStorage.getItem("globalLowStockThreshold");
    return saved ? Number(saved) : 10;
  });
  const token = localStorage.getItem("token");

  // === Toast ===
  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  // === Save global default ===
  useEffect(() => {
    localStorage.setItem("globalLowStockThreshold", globalDefaultThreshold);
  }, [globalDefaultThreshold]);

  // === Set form default when global changes (only for new items) ===
  useEffect(() => {
    if (!editingId) {
      setForm((prev) => ({ ...prev, low_stock_threshold: globalDefaultThreshold }));
    }
  }, [globalDefaultThreshold, editingId]);

  // === Fetch Inventory ===
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get("/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(data);

        data.forEach((item) => {
          if (item.quantity <= item.low_stock_threshold) {
            showToast(
              `${item.product_name}: Only ${item.quantity} left! (Alert: ${item.low_stock_threshold})`,
              "warning"
            );
          }
        });
      } catch (err) {
        showToast(err,"Failed to load inventory");
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
      low_stock_threshold: globalDefaultThreshold,
    });
    setEditingId(null);
  };

  // === Submit ===
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

    if (!product_name || !quantity || !price || !category || low_stock_threshold === "") {
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
        const { data } = await axios.put(`/api/inventory/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        newItem = data;
      } else {
        const { data } = await axios.post("/api/inventory", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        newItem = data;
      }

      setInventory((prev) =>
        prev.map((i) => (i.id === newItem.id ? newItem : i)).concat(
          prev.some((i) => i.id === newItem.id) ? [] : [newItem]
        )
      );

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

  // === Edit & Delete ===
  const startEdit = (item) => {
    setForm({
      product_name: item.product_name,
      product_description: item.product_description || "",
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      low_stock_threshold: item.low_stock_threshold,
    });
    setEditingId(item.id);
  };

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
    <div className="inventory-layout">
      {/* Toast */}
      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Header with Global Threshold */}
      <div className="inventory-header">
        <h1>Inventory</h1>
        <div className="global-threshold">
          <label>
            Default Alert:
            <input
              type="number"
              min="0"
              value={globalDefaultThreshold}
              onChange={(e) => setGlobalDefaultThreshold(Number(e.target.value) || 0)}
              className="threshold-input"
            />
          </label>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="inventory-grid">
        {/* Left: Table */}
        <div className="inventory-table-section">
          <div className="search-bar">
            <input name="name" placeholder="Name..." value={search.name} onChange={handleSearch} />
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

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Desc</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Cat</th>
                  <th>Alert</th>
                  <th></th>
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
                      <td>{(item.product_description || "").slice(0, 20)}...</td>
                      <td className={isLow ? "low-stock-qty" : ""}>{item.quantity}</td>
                      <td>₦{Number(item.price).toFixed(2)}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={isLow ? "alert-level low" : "alert-level"}>
                          {item.low_stock_threshold}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => startEdit(item)} className="edit-btn">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Form */}
        <div className="inventory-form-section">
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
                Alert Level*
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
              <button type="submit" className="submit-btn">
                {editingId ? "Update" : "Add / Restock"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inventory;