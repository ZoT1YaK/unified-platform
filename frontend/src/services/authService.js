export const getStoredEmployee = () => {
    const storedEmployee = localStorage.getItem("employee");
    return storedEmployee ? JSON.parse(storedEmployee) : null;
};

export const getToken = () => {
    return localStorage.getItem("token");
};
