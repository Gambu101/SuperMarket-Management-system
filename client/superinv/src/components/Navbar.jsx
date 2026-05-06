import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUsername(data.username || "");
      } catch {
        // If token is invalid, redirect.
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        SuperInv
      </Link>
      <ul>
        <li>
          <Link to="/inventory">Inventory</Link>
        </li>
        <li>
          <Link to="/transactions">
            Transactions/Review{username ? ` (${username})` : ""}
          </Link>
        </li>
        <li>
          <Link to="/sale">Sale</Link>
        </li>
      </ul>
    </nav>
  );
}
