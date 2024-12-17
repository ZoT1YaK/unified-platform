import React, { useState } from "react";
import { loginEmployee } from "../../services/employeeService";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const { token, employee } = await loginEmployee(email, password);

      // Store token and employee profile in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("employee", JSON.stringify(employee));

      setMessage("Login successful!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };


  return (
    <div className="login-page"> {/* Add the login-page class here */}
      <div className="login-container">
        <img src="/StiboLogo.png" alt="icon8" className="logo" />
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p>{error}</p>}

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
};


export default Login;

