import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For navigation after login

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh
        setError(null); // Clear previous errors

        try {
            // Make the login request to the backend
            const response = await fetch("http://127.0.0.1:8000/api/accounts/api/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || "Login failed. Please check your credentials.");
                return;
            }

            const data = await response.json();
            const { access, role, username } = data;

            // Store token and user details in localStorage
            localStorage.setItem("token", access);
            localStorage.setItem("role", role);
            localStorage.setItem("username", username);

            // Redirect user based on their role
            if (role === "freelancer") {
                navigate("/dashboard/freelancer");
            } else if (role === "client") {
                navigate("/dashboard/client");
            } else {
                setError("Unexpected role. Contact support.");
            }
        } catch (err) {
            console.error("Error during login:", err);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div style={styles.container}>
            <form style={styles.form} onSubmit={handleSubmit}>
                <h1 style={styles.header}>Welcome Back</h1>
                <p style={styles.subHeader}>Log in to continue</p>

                {error && <p style={styles.error}>{error}</p>}

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    style={styles.input}
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    style={styles.input}
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" style={styles.button}>
                    Log In
                </button>

                <p style={styles.footerText}>
                    Don't have an account? <a href="/register" style={styles.link}>Sign Up</a>
                </p>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#000", // Black background
    },
    form: {
        width: "100%",
        maxWidth: "400px",
        padding: "20px",
        backgroundColor: "#222", // Match dashboard card color
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)", // Subtle shadow
        textAlign: "center",
        color: "#fff", // White text for dark background
    },
    header: {
        fontSize: "2.5rem",
        marginBottom: "15px",
        color: "#fff", // White header text
    },
    subHeader: {
        fontSize: "1rem",
        marginBottom: "20px",
        color: "#bbb", // Lighter gray for subtext
    },
    input: {
        width: "90%",
        padding: "12px",
        marginBottom: "15px",
        border: "1px solid #555", // Subtle border for dark theme
        borderRadius: "5px",
        backgroundColor: "#333", // Match dashboard input background
        color: "#fff",
        fontSize: "1rem",
        outline: "none",
    },
    button: {
        width: "100%",
        padding: "12px",
        fontSize: "1rem",
        color: "#fff",
        backgroundColor: "#007bff", // Accent color
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    error: {
        color: "red",
        fontSize: "0.9rem",
        marginBottom: "15px",
    },
    footerText: {
        fontSize: "0.9rem",
        marginTop: "10px",
        color: "#bbb", // Lighter gray for subtext
    },
    link: {
        color: "#007bff",
        textDecoration: "none",
    },
};

export default Login;
