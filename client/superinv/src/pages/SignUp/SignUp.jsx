import React, { useState } from "react";
import axios from "axios";
import "./SignUp.css";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Frontend-supported roles only
    role: "staff",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.password !== formData.confirmPassword) {
        setError("⚠ Passwords do not match");
        return;
      }
      if (
        !formData.username ||
        !formData.firstname ||
        !formData.lastname ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill in all fields");
        return;
      }
      await axios.post("/api/signup", formData);
      setSuccess(true);
      setError(null);
      window.alert("USER REGISTERED SUCCESSFULLY, PROCEED TO SIGN IN");
      navigate("/signin");
    } catch (error) {
      setError(error.response.data.error);
      setSuccess(false);
    }
  };

  return (
    <>
      <BackButton />
      <div className="signup-container">
        {error && <div className="error">{error}</div>}
        {success && (
          <div className="success">User registered successfully!</div>
        )}
        <h2>Fill your details below and click on submit to sign up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              minLength={3}
              onChange={handleChange}
              placeholder="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstname">First name:</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="firstname"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastname">Last name:</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="lastname"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email address"
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
              minLength={6}
              onChange={handleChange}
              placeholder="password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="confirm password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <button type="submit">Sign Up</button>
        </form>
      </div>
    </>
  );
}

export default SignUp;
