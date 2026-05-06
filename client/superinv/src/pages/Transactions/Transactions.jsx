import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actions, setActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(true);
  const [actionsError, setActionsError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

    const fetchActions = async () => {
      try {
        const { data } = await axios.get("/api/stock-activities", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActions(data);
        setActionsError("");
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to load user actions";
        setActionsError(msg);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/signin", { replace: true });
        }
      } finally {
        setLoadingActions(false);
      }
    };

    fetchTx();
    fetchActions();
  }, [token, navigate]);

  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + Number(t.total_price), 0);
  }, [transactions]);

  const totalItems = useMemo(() => {
    return transactions.reduce((sum, t) => sum + Number(t.quantity), 0);
  }, [transactions]);

  if (loading) {
    return <div className="loader">Loading transactions...</div>;
  }

  return (
    <div className="transactions-page">
      <Link to="/dashboard" className="back-btn">
         Back to Dashboard
      </Link>

      <h1>Transactions / Review</h1>

      {error && <p className="error-msg">{error}</p>}

      <div className="summary-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="amount"> ₦{totalRevenue.toFixed(2)}</p>
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

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <p className="empty">No transactions yet. Start selling!</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const matchingActions = actions.filter(
                  (a) => a.product_name === t.product_name,
                );
                const firstAction = matchingActions[0];

                return (
                  <tr key={t.id}>
                    <td>
                      {new Date(t.transaction_date).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>{firstAction?.username || "-"}</td>
                    <td>{t.product_name}</td>
                    <td>{t.quantity}</td>
                    <td> ₦{Number(t.unit_price).toFixed(2)}</td>
                    <td className="total">
                       ₦{Number(t.total_price).toFixed(2)}
                    </td>
                    <td>
                      {firstAction ? `${firstAction.activity_type}` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* User Actions */}
      <h2 style={{ marginTop: "2.25rem", textAlign: "center" }}>
        Actions by users
      </h2>

      {loadingActions ? (
        <div className="loader" style={{ padding: "1.75rem 0" }}>
          Loading actions...
        </div>
      ) : actionsError ? (
        <p className="error-msg">{actionsError}</p>
      ) : actions.length === 0 ? (
        <p className="empty">No actions found yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>User</th>
                <th>Activity</th>
                <th>Product</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id}>
                  <td>
                    {new Date(a.activity_timestamp).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>{a.username || "Unknown"}</td>
                  <td>{a.activity_type}</td>
                  <td>{a.product_name || "-"}</td>
                  <td>{a.details ? JSON.stringify(a.details) : "-"}</td>
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
