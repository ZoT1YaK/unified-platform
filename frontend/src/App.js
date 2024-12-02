import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login/Login";
import Home from "./components/Home(explore)/Home";
// import Dashboard from "./components/Dashboard/Dashboard";
import EmployeeProfile from "./components/EmployeeProfile/EmployeeProfile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/profile" element={<EmployeeProfile />} />
      </Routes>
    </Router>
  );
};

export default App;
