import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import Login from "../Pages/Auth/Login";
import Signup from "../Pages/Auth/Signup";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import UserManagement from "../Pages/Admin/UserManagement";
import ManagerDashboard from "../Pages/Manager/ManagerDashboard";
import ProjectsPage from "../Pages/Manager/ProjectsPage";
import ProjectDetailPage from "../Pages/Manager/ProjectDetailPage";
import MemberDashboard from "../Pages/Member/MemberDashboard";
import MyProjectsPage from "../Pages/Member/MyProjectsPage";
import ProjectTasksPage from "../Pages/Member/ProjectTasksPage";
import TaskDetailPage from "../Pages/Member/TaskDetailPage";
import ProtectedRoute from "../components/ProtectedRoute";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import ResetPassword from "../Pages/Auth/ResetPassword";
import Profile from "../Pages/Profile";

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

            <Route path="/member" element={<ProtectedRoute allowedRoles={["TEAM_MEMBER"]}><MemberDashboard /></ProtectedRoute>} />
            <Route path="/member/projects" element={<ProtectedRoute allowedRoles={["TEAM_MEMBER"]}><MyProjectsPage /></ProtectedRoute>} />
            <Route path="/member/projects/:id" element={<ProtectedRoute allowedRoles={["TEAM_MEMBER"]}><ProjectTasksPage /></ProtectedRoute>} />
            <Route path="/member/tasks/:id" element={<ProtectedRoute allowedRoles={["TEAM_MEMBER"]}><TaskDetailPage /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
    )
}
export default MainRoutes;