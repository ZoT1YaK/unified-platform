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
            .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [items, filter, searchQuery]); // Recompute only when these dependencies change
};
