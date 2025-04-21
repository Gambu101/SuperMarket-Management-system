import React from "react";
import './Navbar.css'
import { Link } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to='/' className="site-title">SuperInv</Link>
      <ul>
        <li>
            <Link to="/home">Home</Link>
        </li>
        <li>
            <Link to="/inventory">Inventory</Link>
        </li>
        <li>
            <Link to="/transactions">Transactions</Link>
        </li>
        <li>
            <Link to="/sale">Sale</Link>
        </li>
      </ul>
    </nav>
  );
}
