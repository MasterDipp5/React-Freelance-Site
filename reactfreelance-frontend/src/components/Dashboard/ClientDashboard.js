import React, { useEffect, useState } from "react";

const ClientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState("create");
    const [openProjects, setOpenProjects] = useState([]);
    const [ongoingProjects, setOngoingProjects] = useState([]);
    const [completedProjects, setCompletedProjects] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [loadingStates, setLoadingStates] = useState({
        user: true,
        openProjects: false,
        ongoingProjects: false,
        completedProjects: false,
    });

    const hardcodedCategories = [
        { id: 1, name: "Web Development", value: "web-development" },
        { id: 2, name: "Graphic Design", value: "graphic-design" },
        { id: 3, name: "Content Writing", value: "content-writing" },
        { id: 4, name: "Digital Marketing", value: "digital-marketing" },
    ];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in. Redirecting to login page...");
            window.location.href = "/login";
            return;
        }

        const fetchData = async () => {
            try {
                setLoadingStates((prev) => ({ ...prev, user: true }));
                const response = await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    handleUnauthorized();
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoadingStates((prev) => ({ ...prev, user: false }));
            }
        };

        fetchData();
    }, []);

    const fetchProjects = async (endpoint, setter, loadingKey) => {
        const token = localStorage.getItem("token");
        try {
            setLoadingStates((prev) => ({ ...prev, [loadingKey]: true }));
            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.ok) {
                const data = await response.json();
                setter(Array.isArray(data) ? data : []);
            } else {
                handleUnauthorized();
            }
        } catch (error) {
            console.error(`Error fetching projects from ${endpoint}:`, error);
        } finally {
            setLoadingStates((prev) => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleUnauthorized = () => {
        alert("Your session has expired. Please log in again.");
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleCreateProject = async (title, description) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/accounts/api/open_projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, category: selectedCategory }),
            });

            if (response.ok) {
                const newProject = await response.json();
                alert("Project created successfully!");
                setOpenProjects((prev) => [...prev, newProject]);
                setActiveTab("open");
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || "Failed to create project"}`);
            }
        } catch (error) {
            console.error("Error creating project:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    };

    const renderProjects = (projects, isLoading, type) => {
        if (isLoading) return <p>Loading {type} projects...</p>;
        if (!projects.length) return <p>No {type} projects available.</p>;
    
        return (
            <div>
                {projects.map((project) => (
                    <div key={project.id} style={styles.projectCard}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <p><strong>Category:</strong> {project.category}</p>
                        {type === "ongoing" && <p><strong>Freelancer:</strong> {project.freelancer || "N/A"}</p>}
                        {type === "completed" && (
                            <>
                                <p><strong>Freelancer:</strong> {project.freelancer || "N/A"}</p>
                                <p><strong>Completed On:</strong> {new Date(project.completed_at).toLocaleDateString()}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (loadingStates.user) return <p>Loading user data...</p>;

    return (
        <div style={{ ...styles.container, backgroundColor: "#000" }}>
            <div style={styles.topPanel}>
                <button
                    style={styles.logoutButton}
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                    Logout
                </button>
                <h1 style={styles.header}>Client Dashboard</h1>
            </div>

            <div style={styles.userInfoPanel}>
                <h2>Welcome, {userData.username}!</h2>
                <p>{userData.bio}</p>
            </div>

            <div style={styles.tabContainer}>
                {["create", "open", "ongoing", "completed"].map((tab) => (
                    <div
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            if (tab === "open") {
                                fetchProjects(
                                    "http://127.0.0.1:8000/api/accounts/api/open_projects/",
                                    setOpenProjects,
                                    "openProjects"
                                );
                            }
                            if (tab === "ongoing") {
                                fetchProjects(
                                    "http://127.0.0.1:8000/api/accounts/ongoing_projects/",
                                    setOngoingProjects,
                                    "ongoingProjects"
                                );
                            }
                            if (tab === "completed") {
                                fetchProjects(
                                    "http://127.0.0.1:8000/api/accounts/completed_projects/",
                                    setCompletedProjects,
                                    "completedProjects"
                                );
                            }
                        }}
                        style={{
                            ...styles.tab,
                            borderBottom: activeTab === tab ? "3px solid #007bff" : "none",
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} Projects
                    </div>
                ))}
            </div>

            <div style={styles.content}>
                {activeTab === "create" && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const title = e.target.title.value;
                            const description = e.target.description.value;
                            handleCreateProject(title, description);
                        }}
                        style={styles.form}
                    >
                        <input
                            type="text"
                            name="title"
                            placeholder="Project Title"
                            style={styles.input}
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Project Description"
                            rows="5"
                            style={styles.textarea}
                            required
                        />
                        <select
                            name="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={styles.select}
                            required
                        >
                            <option value="">Select Category</option>
                            {hardcodedCategories.map((category) => (
                                <option key={category.id} value={category.value}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <button type="submit" style={styles.button}>
                            Create Project
                        </button>
                    </form>
                )}
                {activeTab === "open" && renderProjects(openProjects, loadingStates.openProjects, "open")}
                {activeTab === "ongoing" && renderProjects(ongoingProjects, loadingStates.ongoingProjects, "ongoing")}
                {activeTab === "completed" &&
                    renderProjects(completedProjects, loadingStates.completedProjects, "completed")}
            </div>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        color: "#fff",
    },
    topPanel: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#222",
    },
    logoutButton: {
        padding: "10px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    header: {
        fontSize: "24px",
        color: "#fff",
    },
    link: {
        color: "#007bff",
        textDecoration: "none",
    },
    userInfoPanel: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#333",
    },
    tabContainer: {
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
        backgroundColor: "#111",
        padding: "10px 0",
    },
    tab: {
        padding: "10px 20px",
        margin: "0 10px",
        cursor: "pointer",
        textAlign: "center",
        fontSize: "1rem",
        color: "#fff",
        borderBottom: "3px solid transparent",
    },
    content: {
        marginTop: "20px",
        textAlign: "center",
    },
    form: {
        backgroundColor: "#222",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        color: "#fff",
    },
    input: {
        padding: "10px",
        border: "1px solid #555",
        borderRadius: "5px",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1rem",
        outline: "none",
    },
    textarea: {
        padding: "10px",
        border: "1px solid #555",
        borderRadius: "5px",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1rem",
        outline: "none",
        resize: "none",
    },
    select: {
        padding: "10px",
        border: "1px solid #555",
        borderRadius: "5px",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1rem",
        outline: "none",
    },
    button: {
        padding: "10px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        fontSize: "1rem",
        cursor: "pointer",
    },
    projectCard: {
        backgroundColor: "#222",
        margin: "10px",
        padding: "15px",
        borderRadius: "5px",
        textAlign: "left",
    },
    filterContainer: {
        margin: "20px 0",
        textAlign: "center",
    },
};

export default ClientDashboard;
