import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, FolderKanban } from "lucide-react";
import AdminLayout from "../../Layouts/AdminLayout";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { fetchAllProjects } from "../../Redux/slices/AdminSlice";

const STATUS_COLORS = {
  NOT_STARTED: "bg-base-300 text-base-content/60",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600",
  ON_HOLD: "bg-red-500/10 text-red-500",
  COMPLETED: "bg-emerald-500/10 text-emerald-600",
};

export default function AdminProjectsPage() {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllProjects());
  }, [dispatch]);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold text-base-content">All Projects</h1>
      <p className="mt-1 text-sm text-base-content/50">System-wide view of every project (read-only).</p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={24} />}
            title="No projects in the system"
            description="Once Project Managers start creating projects, they'll show up here."
          />
        ) : (
          projects.map((p) => (
            <div key={p._id} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <p className="font-semibold text-base-content">{p.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-base-content/50">{p.description || "No description"}</p>

              <div className="mt-3 flex items-center gap-2 text-xs text-base-content/50">
                <span>Manager:</span>
                <span className="font-medium text-base-content">{p.manager?.name || "—"}</span>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-base-content/50">
                <Users size={12} />
                {p.teamMembers?.length || 0} team member{p.teamMembers?.length === 1 ? "" : "s"}
              </div>

              <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_COLORS[p.status] || STATUS_COLORS.NOT_STARTED}`}>
                {p.status?.replace("_", " ") || "Not Started"}
              </span>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-base-content/40">
                  <span>Progress</span>
                  <span>{p.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-200">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress || 0}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}