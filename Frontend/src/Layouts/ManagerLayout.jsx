import { LayoutGrid, FolderKanban } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/manager", label: "Dashboard", icon: <LayoutGrid size={18} />, end: true },
  { to: "/manager/projects", label: "Projects", icon: <FolderKanban size={18} /> },
];

export default function ManagerLayout({ children }) {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Project Manager">
      {children}
    </DashboardLayout>
  );
}