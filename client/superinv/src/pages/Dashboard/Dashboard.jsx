// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [username, setUsername] = useState("");   // "" = loading
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    // --------------------------------------------------------------
    // 1. No token → go to sign-in
    // --------------------------------------------------------------
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    // --------------------------------------------------------------
    // 2. Fetch username
    // --------------------------------------------------------------
    const fetchUsername = async () => {
      try {
        const { data } = await axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend must return { username: "…" }
        if (!data?.username) {
          throw new Error("Username missing in response");
        }

        setUsername(data.username);
        setError("");
      } catch (err) {
        // ----- Detailed error handling -----
        const msg =
          err.response?.data?.error ||
          err.message ||
          "Failed to load user";

        console.error("Dashboard fetch error:", err);
        setError(msg);

        // Invalid token → force logout
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/signin", { replace: true });
        }
      }
    };

    fetchUsername();
  }, [token, navigate]);

  // --------------------------------------------------------------
  // 3. Render
  // --------------------------------------------------------------
  return (
    <div className="dashboard">
      {/* Loading / Error */}
      {error && <p className="error-msg">{error}</p>}

      <h1>
        {username ? `Welcome, ${username}!` : "Welcome!"}
      </h1>

      <div className="dashboard_tabs">
        <Link to="/transactions">
          <div className="transaction_history_tab">
            Transaction History
          </div>
        </Link>

        <Link to="/sale">
          <div className="sale_tab">Sale</div>
        </Link>
      </div>
    </div>
  );
}