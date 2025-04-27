import React, { useState } from "react";
import "./SignUp.css";
import BackButton from "../../components/BackButton";

function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // States for checking the errors
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [confirmPassword,setConfirmedPassword] = useState(false)

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
    }if(formData.password === formData.confirmPassword && formData.username !== "" &&
        formData.email !== "" &&
        formData.password !== ""){
        setConfirmedPassword(false)
        setSubmitted(true)
    }if(formData.password !== formData.confirmPassword){
        setConfirmedPassword(true)
        setSubmitted(false)
    }
    else {
      setSubmitted(true);
      setError(false);
    }
    // Handle form submission logic here (e.g., API call)
    console.log(formData);
  };

  // Showing success message
  const successMessage = () => {
    return (
      <div
        className="success"
        style={{
          display: submitted ? "" : "none",
        }}
      >
        <h1>User {formData.username} successfully registered!!</h1>
      </div>
    );
  };

  // Showing error message if error is true
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
  const errorPasswordMessage = () => {
    return (
      <div
        className="error"
        style={{
          display: confirmPassword ? "" : "none",
        }}
      >
        <h1>Passwords don't match</h1>
      </div>
    );
  };

  return (
    <>
    <BackButton/>
    <div className="signup-container">
      

      {/* Calling to the methods */}
      <div className="messages">
        {errorMessage()}
        {successMessage()}
        {errorPasswordMessage()}
      </div>

      <h2>Fill your details below and submit to sign up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
    </>
  );
}

export default SignUp;
