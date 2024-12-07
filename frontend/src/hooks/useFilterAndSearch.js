import { useMemo } from 'react';

export const useFilterAndSearch = (items, filter, searchQuery) => {
    return useMemo(() => {
        return items
            .filter((item) => {
                if (filter === "All") return true;
                if (filter === "Visible") return item.visible;
                if (filter === "Hidden") return !item.visible;
                return true;
            })
            .filter((item) => {
                // Safeguard against undefined properties
                const title = item.title || ''; // Fallback to an empty string
                const query = searchQuery || ''; // Fallback to an empty string
                return title.toLowerCase().includes(query.toLowerCase());
            });
    }, [items, filter, searchQuery]);
};
