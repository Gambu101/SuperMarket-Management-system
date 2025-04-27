import React, { useState } from "react";
import "./SignIn.css";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
//   const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.username === "" ||
      formData.email === "" ||
      formData.password === ""
    ) {
      setError(true);
    } else {
    //   setSubmitted(true);
      setError(false);
    }
    // Handle form submission logic here (e.g., API call)
    console.log(formData);
  };

  const errorMessage = () => {
    return (
      <div
        className="error"
        style={{
          display: error ? "" : "none",
        }}
      >
        <h1>Please enter all the fields</h1>
      </div>
    );
  };
  return (
    <div className="signup-container">
      {/* Calling to the methods that should happen after */}
      <div className="messages">
        {errorMessage()}

      </div>

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
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
