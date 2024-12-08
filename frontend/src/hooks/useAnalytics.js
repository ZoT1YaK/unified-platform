import { useEffect, useState } from "react";

const useAnalytics = () => {
    const [analytics, setAnalytics] = useState({
        achievementsCount: 0,
        postsCount: 0,
        milestonesCount: 0,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found in localStorage");
                    return;
                }
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/analytics`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                const data = await response.json();
                setAnalytics({
                    achievementsCount: data.achievementsCount || 0,
                    postsCount: data.postsCount || 0,
                    milestonesCount: data.milestonesCount || 0,
                });
            } catch (error) {
                console.error("Error fetching analytics:", error.message);
            }
        };

        fetchAnalytics();
    }, []);

    return analytics;
};

export default useAnalytics;
