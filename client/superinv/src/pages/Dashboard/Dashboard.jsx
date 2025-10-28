import React, { useState, useEffect } from "react";
import axios from "axios";
import './Dashboard.css'
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsername();
  }, [token]);

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <div className="dashboard_tabs">
        <Link to="/transactions">
          <div className="transaction_history_tab">Transaction History</div>
        </Link>

        <Link to="/sale">
          <div className="sale_tab">Sale</div>
        </Link>
      </div>
    </div>
  );
}
