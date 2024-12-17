import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useDebounce from "./useDebounce";

const cache = {}; // Local cache for storing fetched analytics

const useAnalytics = (employeeId) => {
    const [analytics, setAnalytics] = useState({
        achievementsCount: 0,
        postsCount: 0,
        milestonesCount: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const inFlightRequests = useRef(new Set()); 
    const debouncedEmployeeId = useDebounce(employeeId, 500); 

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!debouncedEmployeeId) return;

            // Check cache first
            if (cache[debouncedEmployeeId]) {
                console.log("Serving analytics from cache:", debouncedEmployeeId);
                setAnalytics(cache[debouncedEmployeeId]);
                return;
            }

            if (inFlightRequests.current.has(debouncedEmployeeId)) return;

            inFlightRequests.current.add(debouncedEmployeeId);
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found");

                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/analytics/analytics`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { employeeId: debouncedEmployeeId },
                    }
                );

                const fetchedData = {
                    achievementsCount: response.data.achievementsCount || 0,
                    postsCount: response.data.postsCount || 0,
                    milestonesCount: response.data.milestonesCount || 0,
                };

                // Update state and cache
                cache[debouncedEmployeeId] = fetchedData;
                setAnalytics(fetchedData);
            } catch (err) {
                console.error("Error fetching analytics:", err.response?.data?.message || err.message);
                setError("Failed to fetch analytics data.");
            } finally {
                inFlightRequests.current.delete(debouncedEmployeeId);
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [debouncedEmployeeId]);

    return { analytics, loading, error };
};

export default useAnalytics;
