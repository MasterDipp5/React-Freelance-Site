import React, { useEffect, useState } from "react";
import ColorThief from "colorthief";

const FreelancerDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [accentColor, setAccentColor] = useState("#007bff");
    const [activeTab, setActiveTab] = useState("open");
    const [openProjects, setOpenProjects] = useState([]);
    const [ongoingProjects, setOngoingProjects] = useState([]);
    const [completedProjects, setCompletedProjects] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchFreelancerData = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch("http://127.0.0.1:8000/api/accounts/profile/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    if (data.profile_image) {
                        const img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.src = `http://127.0.0.1:8000${data.profile_image}`;
                        img.onload = () => {
                            const colorThief = new ColorThief();
                            const [r, g, b] = colorThief.getColor(img);
                            setAccentColor(`rgb(${r}, ${g}, ${b})`);
                        };
                    }
                } else {
                    console.error("Failed to fetch freelancer data");
                }
            } catch (err) {
                console.error("Error fetching freelancer data:", err);
            }
        };

        const fetchProjectsAndReviews = async () => {
            try {
                const endpoints = {
                    open: "http://127.0.0.1:8000/api/accounts/freelancer_open_projects/",
                    ongoing: "http://127.0.0.1:8000/api/accounts/freelancer_ongoing_projects/",
                    completed: "http://127.0.0.1:8000/api/accounts/freelancer_completed_projects/",
                    reviews: "http://127.0.0.1:8000/api/accounts/api/reviews/?freelancer_id=me",
                };

                const [open, ongoing, completed, fetchedReviews] = await Promise.all(
                    Object.values(endpoints).map((url) =>
                        fetch(url, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        }).then((res) => (res.ok ? res.json() : []))
                    )
                );

                setOpenProjects(Array.isArray(open) ? open : []);
                setOngoingProjects(Array.isArray(ongoing) ? ongoing : []);
                setCompletedProjects(Array.isArray(completed) ? completed : []);
                setReviews(Array.isArray(fetchedReviews) ? fetchedReviews : []);
            } catch (err) {
                console.error("Error fetching projects or reviews:", err);
            }
        };

        fetchFreelancerData();
        fetchProjectsAndReviews();
    }, []);

    const handleAction = async (projectId, actionType, updateState) => {
        try {
            const endpoint = `http://127.0.0.1:8000/api/accounts/api/${actionType}_project/${projectId}/`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                updateState(projectId);
            } else {
                const errorData = await response.json();
                alert(errorData.message || `Failed to ${actionType} project.`);
            }
        } catch (err) {
            console.error(`Error ${actionType} project:`, err);
        }
    };

    const renderProjects = (projects, buttonLabel, buttonAction) => (
        <div>
            {projects.length === 0 ? (
                <p>No projects available.</p>
            ) : (
                projects.map((project) => (
                    <div key={project.id} style={styles.projectCard}>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <p>
                            <strong>Client:</strong> {project.client}
                        </p>
                        {buttonLabel && (
                            <button
                                style={{ ...styles.actionButton, backgroundColor: accentColor }}
                                onClick={() => buttonAction(project.id)}
                            >
                                {buttonLabel}
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );

    const renderReviews = () => (
        <div>
            {reviews.length === 0 ? (
                <p>No reviews available.</p>
            ) : (
                reviews.map((review) => (
                    <div key={review.id} style={styles.reviewCard}>
                        <h3>{review.heading}</h3>
                        <p>{review.description}</p>
                        <p>
                            <strong>Client:</strong> {review.client_name}
                        </p>
                        <p>
                            <strong>Date:</strong> {new Date(review.created_at).toLocaleDateString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );

    if (!userData) return <p>Loading...</p>;

    return (
        <div style={{ ...styles.container, backgroundColor: "#000" }}>
            <div style={{ ...styles.topPanel, backgroundColor: accentColor }}>
                <button style={styles.logoutButton} onClick={() => localStorage.clear()}>
                    Logout
                </button>
                <div style={styles.profileImageWrapper}>
                    {userData.profile_image ? (
                        <img
                            src={`http://127.0.0.1:8000${userData.profile_image}`}
                            alt="Profile"
                            style={styles.profileImage}
                        />
                    ) : (
                        <div style={styles.placeholderImage}>No Profile Image</div>
                    )}
                </div>
            </div>
            <div style={styles.userInfoPanel}>
                <h1 style={styles.username}>{userData.username}</h1>
                <p style={styles.bio}>{userData.bio}</p>
                <p style={styles.category}>Category: {userData.category}</p>
            </div>
            <div style={styles.tabContainer}>
                {[
                    { key: "open", label: "Open Projects" },
                    { key: "ongoing", label: "Ongoing Projects" },
                    { key: "completed", label: "Completed Projects" },
                ].map((tab) => (
                    <div
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            ...styles.tab,
                            borderBottom: activeTab === tab.key ? `3px solid ${accentColor}` : "none",
                            color: activeTab === tab.key ? accentColor : "#fff",
                        }}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>
            <div style={styles.content}>
                {activeTab === "open" &&
                    renderProjects(openProjects, "Take Project", (id) =>
                        handleAction(id, "take", (projectId) => {
                            const takenProject = openProjects.find((p) => p.id === projectId);
                            setOpenProjects(openProjects.filter((p) => p.id !== projectId));
                            setOngoingProjects([...ongoingProjects, takenProject]);
                        })
                    )}
                {activeTab === "ongoing" &&
                    renderProjects(ongoingProjects, "Close Project", (id) =>
                        handleAction(id, "close", (projectId) => {
                            const closedProject = ongoingProjects.find((p) => p.id === projectId);
                            setOngoingProjects(ongoingProjects.filter((p) => p.id !== projectId));
                            setCompletedProjects([...completedProjects, closedProject]);
                        })
                    )}
                {activeTab === "completed" && renderProjects(completedProjects, null, null)}
                {activeTab === "reviews" && renderReviews()}
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
        height: "150px",
        position: "relative",
        textAlign: "center",
    },
    logoutButton: {
        position: "absolute",
        top: "10px",
        right: "20px",
        padding: "8px 16px",
        backgroundColor: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    profileImageWrapper: {
        position: "absolute",
        top: "75px",
        left: "50%",
        transform: "translateX(-50%)",
    },
    profileImage: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        border: "4px solid #000",
        objectFit: "cover",
    },
    placeholderImage: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#666",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "0.9rem",
        border: "4px solid #000",
    },
    userInfoPanel: {
        marginTop: "80px",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#111",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    username: {
        fontSize: "1.5rem",
        margin: "10px 0",
    },
    bio: {
        fontSize: "1rem",
        margin: "10px 0",
        color: "#bbb",
    },
    category: {
        fontSize: "1rem",
        margin: "10px 0",
        color: "#bbb",
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
        borderBottom: "3px solid transparent",
        transition: "color 0.3s, border-bottom 0.3s",
    },
    content: {
        marginTop: "20px",
        textAlign: "center",
        fontSize: "1.2rem",
    },
    projectCard: {
        backgroundColor: "#222",
        margin: "10px",
        padding: "15px",
        borderRadius: "5px",
        textAlign: "left",
    },
    actionButton: {
        marginTop: "10px",
        padding: "10px 20px",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background-color 0.3s",
    },
    reviewCard: {
        backgroundColor: "#222",
        margin: "10px",
        padding: "15px",
        borderRadius: "5px",
        textAlign: "left",
    },
};

export default FreelancerDashboard;
