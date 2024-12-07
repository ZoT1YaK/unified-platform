import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login/Login";
import Home from "./components/Home(explore)/Home";
import EmployeeProfile from "./components/EmployeeProfile/EmployeeProfile";
/*import TopBar from "./components/TopBar/TopBar";*/
import LeaderHub from "./components/LeaderHub/LeaderHub";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              component={() => (
                <> 
                  <Home />
                </>
              )}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              component={() => (
                <>
                  <EmployeeProfile />
                </>
              )}
            />
          }
        />

        <Route
          path="/leaderhub"
          element={
            <ProtectedRoute
              component={() => (
                <>
                  <LeaderHub />
                </>
              )}
            />
          }
        />

        {/* Redirect unmatched routes to /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
