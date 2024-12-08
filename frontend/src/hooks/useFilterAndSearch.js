import { useMemo } from "react";

export const useFilterAndSearch = (items, filter, searchQuery, filterKey = "visibility", searchKey = "name") => {
    return useMemo(() => {
        return items
            .filter((item) => {
                if (filter === "All") return true;
                if (filter === "Visible") return item[filterKey];
                if (filter === "Hidden") return !item[filterKey];
                return true;
            })
            .filter((item) => {
                const query = searchQuery || ""; // Fallback to empty string
                const searchValue = searchKey.includes(".") // Support nested keys like badge_id.name
                    ? searchKey.split(".").reduce((obj, key) => (obj ? obj[key] : ""), item)
                    : item[searchKey];
                return (searchValue || "").toLowerCase().includes(query.toLowerCase());
            });
    }, [items, filter, searchQuery, filterKey, searchKey]);
};
