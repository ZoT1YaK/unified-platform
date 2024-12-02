import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login/Login";
// import Dashboard from "./components/Dashboard/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <ProtectedRoute path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
