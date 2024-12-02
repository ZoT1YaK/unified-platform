import React, { useState } from "react";
import axios from "axios";
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
            // Send login request to backend
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/employees/login`, { email, password });
            
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("employee", JSON.stringify(response.data.employee));
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
                <h2>Login</h2>
                {message && <p style={{ color: "green" }}>{message}</p>}
                {error && <p>{error}</p>}

                <form onSubmit={handleLogin}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
