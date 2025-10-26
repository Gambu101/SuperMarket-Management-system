import React, { useState } from "react";
import "./SignIn.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email === "" || formData.password === "") {
      setError("Please enter all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/signin", formData);
      setError("");
      console.log("Sign-in successful:", response.data);
      navigate("/sales");
    } catch (error) {
      setError(error.response.data.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const errorMessage = () => {
    return (
      <div
        className="error"
        style={{ display: error ? "block" : "none" }}
      >
        <p>{error}</p>
      </div>
    );
  };

  return (
    <div className="signup-container">
      <div className="messages">{errorMessage()}</div>
      <h2>Sign in below</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
