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
            // Send login request to the backend
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/login`,{ 
                email, password 
            });

            // Extract token and user data from the response
            const { token, user } = response.data;

            // Save token to localStorage
            localStorage.setItem("token", token);

            // Optional: Save user info in localStorage or React state
            localStorage.setItem("user", JSON.stringify(user));

            // Display success message or redirect
            setMessage("Login successful!");

            setTimeout(() => {
                window.location.href = "/dashboard"; // Redirect to dashboard
            }, 1000);
        } 
        catch (err) {
            // Handle error response from the server
            setError(err.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    return (
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
    );
};

export default Login;
