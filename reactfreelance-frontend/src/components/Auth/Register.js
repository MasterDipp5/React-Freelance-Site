import React, { useState } from "react";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        category: "",
        bio: "",
        profileImage: null, // Store the file for profile image
    });

    const [showCategory, setShowCategory] = useState(false); // Control category visibility

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle regular text inputs
        setFormData({ ...formData, [name]: value });

        // Show category dropdown only when role is freelancer
        if (name === "role") {
            setFormData((prevFormData) => ({
                ...prevFormData,
                role: value,
                category: value === "freelancer" ? prevFormData.category : "", // Clear category for non-freelancer
            }));
            setShowCategory(value === "freelancer");
        } else {
            setFormData({ ...formData, [name]: value });
        }
        
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profileImage: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Registering with:", formData);

        const form = new FormData();
        form.append("username", formData.username);
        form.append("email", formData.email);
        form.append("password", formData.password);
        form.append("role", formData.role);
        form.append("category", formData.category);
        form.append("bio", formData.bio);
        if (formData.profileImage) {
            form.append("profile_image", formData.profileImage);
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/api/register/", {
                method: "POST",
                body: form,
            });

            if (response.ok) {
                alert("Registration successful!");
                window.location.href = "/login";
            } else {
                const errorData = await response.json();
                console.error("Registration failed:", errorData);
                alert(errorData.detail || "Registration failed. Please try again.");
            }
        } catch (err) {
            console.error("Error during registration:", err);
            alert("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div style={styles.container}>
            <form style={styles.form} onSubmit={handleSubmit}>
                <h1 style={styles.header}>Create an Account</h1>
                <p style={styles.subHeader}>Join us today</p>

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
                    type="email"
                    name="email"
                    placeholder="Email"
                    style={styles.input}
                    value={formData.email}
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
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="bio"
                    placeholder="Tell us about yourself"
                    style={styles.textarea}
                    value={formData.bio}
                    onChange={handleChange}
                ></textarea>

                <select
                    name="role"
                    style={styles.input}
                    value={formData.role}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Role</option>
                    <option value="client">Client</option>
                    <option value="freelancer">Freelancer</option>
                </select>

                {showCategory && (
                    <select
                        name="category"
                        style={styles.input}
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="web-development">Web Development</option>
                        <option value="graphic-design">Graphic Design</option>
                        <option value="content-writing">Content Writing</option>
                        <option value="digital-marketing">Digital Marketing</option>
                    </select>
                )}

                <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    style={styles.input}
                    onChange={handleFileChange}
                />

                <button type="submit" style={styles.button}>
                    Sign Up
                </button>

                <p style={styles.footerText}>
                    Already have an account? <a href="/login" style={styles.link}>Log In</a>
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
        backgroundColor: "#000", // Match dashboard background
    },
    form: {
        width: "100%",
        maxWidth: "400px",
        padding: "20px",
        backgroundColor: "#222", // Match dashboard panels
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
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
        padding: "12px",
        marginBottom: "15px",
        border: "1px solid #555",
        borderRadius: "5px",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1rem",
        outline: "none",
        width: "90%"
    },
    textarea: {
        width: "90%",
        padding: "12px",
        marginBottom: "15px",
        border: "1px solid #555",
        borderRadius: "5px",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1rem",
        height: "80px",
        resize: "none",
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

export default Register;
