import { LayoutGrid, Users } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: <LayoutGrid size={18} />, end: true },
  { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
];

export default function AdminLayout({ children }) {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin">
      {children}
    </DashboardLayout>
  );
}