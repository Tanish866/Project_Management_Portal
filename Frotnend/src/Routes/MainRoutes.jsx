import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../Pages/Home";
import Login from "../Pages/Auth/Login";
import Signup from "../Pages/Auth/Signup";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import UserManagement from "../Pages/Admin/UserManagement";

export default function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}