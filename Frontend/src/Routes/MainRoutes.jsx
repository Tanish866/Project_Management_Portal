import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import Login from "../Pages/Auth/Login";
import Signup from "../Pages/Auth/Signup";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import UserManagement from "../Pages/Admin/UserManagement";
import ManagerDashboard from "../Pages/Manager/ManagerDashboard";
import ProjectsPage from "../Pages/Manager/ProjectsPage";
import ProjectDetailPage from "../Pages/Manager/ProjectDetailPage";
import ProtectedRoute from "../components/ProtectedRoute";

function MainRoutes(){
    return (
        <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/" element={<Home />} />

            <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><UserManagement /></ProtectedRoute>} />

            <Route path="/manager" element={<ProtectedRoute allowedRoles={["PROJECT_MANAGER"]}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="/manager/projects" element={<ProtectedRoute allowedRoles={["PROJECT_MANAGER"]}><ProjectsPage /></ProtectedRoute>} />
            <Route path="/manager/projects/:id" element={<ProtectedRoute allowedRoles={["PROJECT_MANAGER"]}><ProjectDetailPage /></ProtectedRoute>} />
        </Routes>
    )
}
export default MainRoutes;