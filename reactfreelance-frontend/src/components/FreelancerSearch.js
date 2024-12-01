import React, { useState } from "react";

const FreelancerSearch = () => {
    const [category, setCategory] = useState("");

    const handleSearch = () => {
        alert(`Searching for freelancers in category: ${category}`);
        // Implement actual search functionality here
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Find Freelancers</h1>
            <select
                style={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="">Select a Category</option>
                <option value="web-development">Web Development</option>
                <option value="graphic-design">Graphic Design</option>
                <option value="content-writing">Content Writing</option>
                <option value="digital-marketing">Digital Marketing</option>
            </select>
            <button style={styles.button} onClick={handleSearch}>
                Search
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
        fontFamily: "Arial, sans-serif",
    },
    header: {
        fontSize: "2.5rem",
        color: "#333",
    },
    select: {
        margin: "20px 0",
        padding: "10px",
        fontSize: "1rem",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px 20px",
        fontSize: "1rem",
        color: "#fff",
        backgroundColor: "#28a745",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default FreelancerSearch;
