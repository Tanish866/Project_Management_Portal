import { LayoutGrid, FolderKanban } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  { to: "/member", label: "Dashboard", icon: <LayoutGrid size={18} />, end: true },
  { to: "/member/projects", label: "My Projects", icon: <FolderKanban size={18} /> },
];

export default function MemberLayout({ children }) {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Team Member">
      {children}
    </DashboardLayout>
  );
}