import BackButton from "../../components/BackButton";
// src/pages/Transactions.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // === Fetch Transactions ===
  useEffect(() => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    const fetchTx = async () => {
      try {
        const { data } = await axios.get("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(data);
        setError("");
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to load transactions";
        setError(msg);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/signin", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTx();
  }, [token, navigate]);

  // === Totals ===
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + Number(t.total_price), 0);
  }, [transactions]);

  const totalItems = useMemo(() => {
    return transactions.reduce((sum, t) => sum + Number(t.quantity), 0);
  }, [transactions]);

  // === Render ===
  if (loading) {
    return <div className="loader">Loading transactions...</div>;
  }

  return (
    <div className="transactions-page">
        <BackButton></BackButton>
      {/* Back Button */}
      <Link to="/dashboard" className="back-btn">
        ← Back to Dashboard
      </Link>

      <h1>Transaction History</h1>

      {error && <p className="error-msg">{error}</p>}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="amount">₦{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Items Sold</h3>
          <p className="amount">{totalItems}</p>
        </div>
        <div className="card">
          <h3>Transactions</h3>
          <p className="amount">{transactions.length}</p>
        </div>
      </div>

      {/* Table */}
      {transactions.length === 0 ? (
        <p className="empty">No transactions yet. Start selling!</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    {new Date(t.transaction_date).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>{t.product_name}</td>
                  <td>{t.quantity}</td>
                  <td>₦{Number(t.unit_price).toFixed(2)}</td>
                  <td className="total">₦{Number(t.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;