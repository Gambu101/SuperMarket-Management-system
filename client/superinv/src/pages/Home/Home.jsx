import React, { useState, useEffect } from "react";

export default function Sales() {
  const [username, setUsername] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>Awaiting for customers to make orders...</p>
      {/* Display orders here */}
    </div>
  );
}