import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Users,
  FolderKanban,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ArrowRight,
  Briefcase,
  User,
} from "lucide-react";
import AdminLayout from "../../Layouts/AdminLayout";
import { fetchAdminDashboard, fetchUsers } from "../../Redux/slices/AdminSlice";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { dashboard, users, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchUsers());
  }, [dispatch]);

  const cards = [
    { label: "Total Users", value: dashboard?.totalUsers ?? users.length ?? "—", icon: <Users size={20} />, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Total Projects", value: dashboard?.totalProjects ?? "—", icon: <FolderKanban size={20} />, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Active Users", value: dashboard?.activeUsers ?? users.filter((u) => u.isActive).length ?? "—", icon: <UserCheck size={20} />, color: "text-amber-500 bg-amber-500/10" },
    { label: "Admins", value: dashboard?.totalAdmins ?? users.filter((u) => u.role === "ADMIN").length ?? "—", icon: <ShieldCheck size={20} />, color: "text-blue-500 bg-blue-500/10" },
  ];

  const roleBreakdown = [
    { role: "ADMIN", label: "Admins", icon: <ShieldCheck size={16} />, color: "text-blue-500 bg-blue-500/10" },
    { role: "PROJECT_MANAGER", label: "Project Managers", icon: <Briefcase size={16} />, color: "text-emerald-500 bg-emerald-500/10" },
    { role: "TEAM_MEMBER", label: "Team Members", icon: <User size={16} />, color: "text-amber-500 bg-amber-500/10" },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-content">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-base-content/50">System-wide overview and stats.</p>
        </div>
        <Link to="/admin/users" className="btn btn-primary rounded-xl">
          <UserPlus size={16} /> Manage Users
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
              {card.icon}
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-base-content">
              {loading ? "…" : card.value}
            </p>
            <p className="mt-1 text-xs text-base-content/50">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm lg:col-span-1">
          <p className="font-semibold text-base-content">Users by Role</p>
          <div className="mt-5 space-y-4">
            {roleBreakdown.map((item) => {
              const count = users.filter((u) => u.role === item.role).length;
              const total = users.length || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={item.role}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-base-content/70">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${item.color}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <span className="font-semibold text-base-content">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-base-200">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-base-content">Recently Joined</p>
            <Link to="/admin/users" className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="mt-4 space-y-1">
            {recentUsers.length === 0 ? (
              <p className="py-6 text-center text-sm text-base-content/40">No users yet.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-base-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-content">{u.name}</p>
                      <p className="text-xs text-base-content/40">{u.email}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      u.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {u.role?.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}