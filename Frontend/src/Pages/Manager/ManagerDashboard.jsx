import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FolderKanban, ListChecks, CheckCircle2, Clock, Plus, ArrowRight } from "lucide-react";
import ManagerLayout from "../../Layouts/ManagerLayout";
import EmptyState from "../../components/ui/EmptyState";
import { fetchManagerDashboard, fetchProjects } from "../../Redux/slices/ManagerSlice";

export default function ManagerDashboard() {
  const dispatch = useDispatch();
  const { dashboard, projects, loading, error } = useSelector((state) => state.manager);

  useEffect(() => {
    dispatch(fetchManagerDashboard());
    dispatch(fetchProjects());
  }, [dispatch]);

  const cards = [
    { label: "My Projects", value: dashboard?.totalProjects ?? projects.length, icon: <FolderKanban size={20} />, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Total Tasks", value: dashboard?.totalTasks ?? "—", icon: <ListChecks size={20} />, color: "text-amber-500 bg-amber-500/10" },
    { label: "Completed Tasks", value: dashboard?.completedTasks ?? "—", icon: <CheckCircle2 size={20} />, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Pending Tasks", value: dashboard?.pendingTasks ?? "—", icon: <Clock size={20} />, color: "text-blue-500 bg-blue-500/10" },
  ];

  const recentProjects = projects.slice(0, 5);

  return (
    <ManagerLayout>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-content">Manager Dashboard</h1>
          <p className="mt-1 text-sm text-base-content/50">Overview of your projects and tasks.</p>
        </div>
        <Link to="/manager/projects" className="btn btn-primary rounded-xl">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>{card.icon}</div>
            <p className="mt-4 font-display text-2xl font-bold text-base-content">{loading ? "…" : card.value}</p>
            <p className="mt-1 text-xs text-base-content/50">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-base-content">Recent Projects</p>
          <Link to="/manager/projects" className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="mt-4 space-y-1">
          {recentProjects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban size={22} />}
              title="No projects yet"
              description="Create your first project to get started."
            />
          ) : (
            recentProjects.map((p) => (
              <Link
                key={p._id}
                to={`/manager/projects/${p._id}`}
                className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-base-200"
              >
                <div>
                  <p className="text-sm font-medium text-base-content">{p.name}</p>
                  <p className="text-xs text-base-content/40">{p.status?.replace("_", " ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-base-200">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                  <span className="text-xs text-base-content/50">{p.progress || 0}%</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}