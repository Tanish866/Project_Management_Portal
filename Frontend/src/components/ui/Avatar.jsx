const ROLE_COLORS = {
  ADMIN: "bg-blue-500/10 text-blue-500",
  PROJECT_MANAGER: "bg-emerald-500/10 text-emerald-600",
  TEAM_MEMBER: "bg-amber-500/10 text-amber-600",
};

export default function Avatar({ name, role, size = "sm" }) {
  const sizeClass = size === "lg" ? "h-14 w-14 text-lg" : "h-8 w-8 text-xs";
  return (
    <div className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full font-bold ${ROLE_COLORS[role] || "bg-base-300 text-base-content"}`}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export { ROLE_COLORS };