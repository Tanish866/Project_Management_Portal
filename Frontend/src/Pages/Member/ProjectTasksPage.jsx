import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MemberLayout from "../../Layouts/MemberLayout";
import { fetchProjectById, fetchMyTasksInProject, clearCurrentProject } from "../../Redux/slices/MemberSlice";

const PRIORITY_COLORS = {
  LOW: "bg-base-300 text-base-content/60",
  MEDIUM: "bg-amber-500/10 text-amber-600",
  HIGH: "bg-red-500/10 text-red-500",
};

const STATUS_COLORS = {
  TODO: "bg-base-300 text-base-content/60",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600",
  COMPLETED: "bg-emerald-500/10 text-emerald-600",
};

export default function ProjectTasksPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProject, tasks, loading } = useSelector((state) => state.member);

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchMyTasksInProject(id));
    return () => dispatch(clearCurrentProject());
  }, [dispatch, id]);

  if (!currentProject) {
    return (
      <MemberLayout>
        <p className="text-sm text-base-content/40">Loading project...</p>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <Link to="/member/projects" className="flex items-center gap-1 text-sm text-base-content/50 hover:text-base-content">
        <ArrowLeft size={14} /> Back to My Projects
      </Link>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-content">{currentProject.name}</h1>
          <p className="mt-1 max-w-xl text-sm text-base-content/50">{currentProject.description}</p>
        </div>
        <div className="rounded-xl border border-base-300 bg-base-100 px-4 py-2 text-right">
          <p className="font-display text-lg font-bold text-base-content">{currentProject.progress || 0}%</p>
          <p className="text-xs text-base-content/40">Progress</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <p className="font-semibold text-base-content">My Tasks in this Project</p>

        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="py-6 text-center text-sm text-base-content/40">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-base-content/40">No tasks assigned to you here.</p>
          ) : (
            tasks.map((t) => (
              <Link
                key={t._id}
                to={`/member/tasks/${t._id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-base-300 px-4 py-3 hover:border-primary/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-base-content">{t.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                    {t.deadline && (
                      <span className="text-[11px] text-base-content/40">Due {new Date(t.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_COLORS[t.status]}`}>
                  {t.status?.replace("_", " ")}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </MemberLayout>
  );
}