import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get('/api/user', {
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
        <div className="transaction_history_tab">
          <Link to="/transaction-history">
          <button>Transaction History</button>
        </Link>
        </div>
        <div className="sale_tab">
          <Link to="/sale">
          <button>Sale</button>
        </Link>
        </div>
      </div>
    </div>
  );
}