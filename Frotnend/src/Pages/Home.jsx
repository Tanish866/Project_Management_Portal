import { Link } from "react-router-dom";
import Layout from "../Layouts/Layout";

export default function Home() {
  const stats = [
    { label: "Projects", value: "12", sub: "Active Projects" },
    { label: "Tasks", value: "34", sub: "Pending Tasks" },
    { label: "Team Members", value: "18", sub: "Total Members" },
    { label: "Completed Tasks", value: "68%", sub: "Completion Rate" },
  ];

  const progress = [
    { label: "Website Redesign", percent: 75, color: "bg-blue-600" },
    { label: "Mobile App Development", percent: 50, color: "bg-amber-500" },
    { label: "Database Migration", percent: 90, color: "bg-emerald-500" },
  ];

  const tasks = [
    { label: "Design Homepage", date: "May 20" },
    { label: "API Integration", date: "May 22" },
    { label: "User Testing", date: "May 25" },
    { label: "Deployment", date: "May 28" },
  ];

  const features = [
    { icon: "📋", title: "Project Management", desc: "Create and manage projects from start to finish." },
    { icon: "✅", title: "Task Management", desc: "Assign tasks, set priorities, and track progress." },
    { icon: "👥", title: "Team Collaboration", desc: "Work together with team members in real-time." },
    { icon: "📊", title: "Progress Tracking", desc: "Monitor project progress with visual reports and analytics." },
  ];

  return (
    <Layout>
      <section id="home" className="grid gap-10 py-16 md:grid-cols-2 md:items-center">
        <div>
          <span className="badge mb-4 border-none bg-blue-50 text-blue-600">
            Welcome to
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-base-content md:text-5xl">
            Project Management Portal
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-base-content/70">
            Plan, organize, and track your projects efficiently. Collaborate
            with your team, manage tasks, and deliver successful projects on
            time.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn btn-primary">
              Get Started →
            </Link>
            <Link to="/login" className="btn btn-outline btn-primary">
              Login to Account
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-base-300 shadow-xl">
          <div className="flex items-center gap-1.5 bg-blue-600 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            <span className="h-2 w-2 rounded-full bg-white/70" />
            <span className="h-2 w-2 rounded-full bg-white/70" />
          </div>

          <div className="bg-base-100 p-5">
            <h2 className="mb-4 font-semibold text-base-content">Dashboard</h2>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-base-200 p-4 shadow-sm">
                  <p className="text-xs text-base-content/70">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-base-content">{stat.value}</p>
                  <p className="mt-1 text-xs text-base-content/50">{stat.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-base-200 p-4 shadow-sm">
                <p className="mb-3 text-xs font-semibold text-base-content">
                  Project Progress
                </p>
                {progress.map((item) => (
                  <div key={item.label} className="mb-3 last:mb-0">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-base-content/70">{item.label}</span>
                      <span className="text-base-content/50">{item.percent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-base-300">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-base-200 p-4 shadow-sm">
                <p className="mb-2 text-xs font-semibold text-base-content">
                  Upcoming Tasks
                </p>
                {tasks.map((task) => (
                  <div key={task.label} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-base-content/80">{task.label}</span>
                    <span className="text-xs text-base-content/50">{task.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-base-content">
          Our Key Features
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                {feature.icon}
              </div>
              <h3 className="mb-1 font-semibold text-base-content">{feature.title}</h3>
              <p className="text-sm leading-snug text-base-content/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="py-16">
        <h2 className="mb-4 text-2xl font-bold text-base-content">About Us</h2>
        <p className="max-w-2xl text-base-content/70">
          Project Management Portal helps teams plan, organize, and track
          their work in one place. We built this platform to make
          collaboration simple — from assigning tasks to monitoring progress,
          everything your team needs is right here.
        </p>
      </section>

      <section id="contact" className="mb-10 rounded-2xl bg-base-100 px-6 py-8 shadow-sm">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🚀</span>
            <div>
              <h3 className="font-semibold text-base-content">
                Ready to boost your productivity?
              </h3>
              <p className="text-sm text-base-content/70">
                Join our platform and manage your projects effectively.
              </p>
            </div>
          </div>
          <Link to="/signup" className="btn btn-primary whitespace-nowrap">
            Get Started Now →
          </Link>
        </div>
      </section>
    </Layout>
  );
}