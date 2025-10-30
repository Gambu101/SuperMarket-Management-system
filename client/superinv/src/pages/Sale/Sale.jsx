import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./Sale.css";

const Sale = () => {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const token = localStorage.getItem("token");

  // === Toast Helper ===
  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  // === Fetch Inventory ===
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get("/api/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(data.sort((a, b) => a.product_name.localeCompare(b.product_name)));
      } catch (err) {
        showToast("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [token]);

  // === Search Filter ===
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  // === Cart Logic ===
  const updateCart = useCallback((product, delta) => {
    const current = cart[product.id]?.quantity ?? 0;
    const newQty = current + delta;

    if (newQty < 0) return;
    if (newQty > product.quantity) {
      showToast(`Only ${product.quantity} left!`);
      return;
    }

    if (newQty === 0) {
      const { [product.id]: _, ...rest } = cart;
      setCart(rest);
    } else {
      setCart({ ...cart, [product.id]: { product, quantity: newQty } });
    }
  }, [cart]);

  const removeFromCart = (id) => {
    const { [id]: _, ...rest } = cart;
    setCart(rest);
  };

  // === Totals ===
  const cartTotal = useMemo(() => {
    return Object.values(cart).reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0
    );
  }, [cart]);

  // === Confirm Purchase ===
  const handlePurchase = () => {
    if (Object.keys(cart).length === 0) {
      showToast("Cart is empty!");
      return;
    }
    setShowConfirm(true);
  };

  const confirmPurchase = async () => {
    try {
      // 1. Record sale
      await axios.post("/api/sale", { cart }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Refresh inventory
      const { data } = await axios.get("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(data.sort((a, b) => a.product_name.localeCompare(b.product_name)));

      // 3. Reset
      setCart({});
      setShowConfirm(false);
      showToast("Sale completed!", "success");
    } catch (err) {
      showToast("Sale failed. Try again.");
      console.error(err);
    }
  };

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <>
      {/* Toast */}
      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="sale-container">
        {/* Product List */}
        <section className="product-list">
          <h1>Sale</h1>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="product-grid">
            {filteredInventory.map((item) => (
              <div key={item.id} className="product-card">
                <h3>{item.product_name}</h3>
                <p>₦{Number(item.price).toFixed(2)}</p>
                <p className="stock">Stock: {item.quantity}</p>

                <div className="quantity-controls">
                  <button onClick={() => updateCart(item, -1)}>-</button>
                  <span className="qty">
                    {cart[item.id]?.quantity ?? 0}
                  </span>
                  <button onClick={() => updateCart(item, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cart */}
        <section className="cart">
          <h2>Cart ({Object.keys(cart).length})</h2>
          {Object.values(cart).length === 0 ? (
            <p className="empty">No items</p>
          ) : (
            <>
              <ul>
                {Object.values(cart).map(({ product, quantity }) => (
                  <li key={product.id}>
                    <span>
                      {product.product_name} × {quantity} = ₦
                      {(product.price * quantity).toFixed(2)}
                    </span>
                    <button onClick={() => removeFromCart(product.id)}>×</button>
                  </li>
                ))}
              </ul>
              <div className="total">
                <strong>Total: ₦{cartTotal.toFixed(2)}</strong>
              </div>
              <button className="purchase-btn" onClick={handlePurchase}>
                Checkout
              </button>
            </>
          )}
        </section>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Sale</h2>
            <ul>
              {Object.values(cart).map(({ product, quantity }) => (
                <li key={product.id}>
                  {product.product_name} × {quantity} = ₦
                  {(product.price * quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="total"><strong>₦{cartTotal.toFixed(2)}</strong></p>
            <div className="modal-actions">
              <button onClick={confirmPurchase}>Confirm</button>
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sale;