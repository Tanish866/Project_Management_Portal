import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  Menu,
  Home as HomeIcon,
  Folder,
  UserCircle,
  FileText,
  Calendar,
  BarChart2,
  Settings,
  Bell,
  Loader,
  CheckCircle2,
  Clock,
  Bot,
  Smartphone,
  Cpu,
  ClipboardList,
  UsersRound,
  ClipboardCheck,
  Building2,
} from "lucide-react";
import Layout from "../Layouts/Layout";

export default function Home() {
  const stats = [
    { label: "Total Projects", value: "128", icon: <Folder size={16} />, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "In Progress", value: "45", icon: <Loader size={16} />, color: "text-amber-500 bg-amber-500/10" },
    { label: "Completed", value: "63", icon: <CheckCircle2 size={16} />, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Pending Review", value: "20", icon: <Clock size={16} />, color: "text-orange-500 bg-orange-500/10" },
  ];

  const activities = [
    { title: "AI Chatbot Project", sub: "Submitted by Team Alpha", time: "2h ago", icon: <Bot size={14} />, color: "text-emerald-500 bg-emerald-500/10" },
    { title: "Mobile App Development", sub: "Review requested", time: "5h ago", icon: <Smartphone size={14} />, color: "text-indigo-500 bg-indigo-500/10" },
    { title: "IoT Smart System", sub: "Approved by Prof. Smith", time: "1d ago", icon: <Cpu size={14} />, color: "text-red-500 bg-red-500/10" },
  ];

  const chartPoints = [30, 55, 42, 65, 50, 78, 68];
  const chartMax = Math.max(...chartPoints);

  const heroStats = [
    { value: "500+", label: "Users", icon: <Users size={18} />, color: "text-indigo-500 bg-indigo-500/10" },
    { value: "120+", label: "Projects", icon: <UsersRound size={18} />, color: "text-emerald-500 bg-emerald-500/10" },
    { value: "50+", label: "Team Leads", icon: <UserCircle size={18} />, color: "text-orange-500 bg-orange-500/10" },
    { value: "10+", label: "Organizations", icon: <Building2 size={18} />, color: "text-blue-500 bg-blue-500/10" },
  ];

  const features = [
    { icon: <ClipboardList size={22} />, title: "Project Management", desc: "Create, organize and track projects effortlessly.", color: "text-indigo-500 bg-indigo-500/10" },
    { icon: <UsersRound size={22} />, title: "Team Collaboration", desc: "Work together with your team in real-time.", color: "text-emerald-500 bg-emerald-500/10" },
    { icon: <ClipboardCheck size={22} />, title: "Submission & Review", desc: "Submit your work and get valuable feedback.", color: "text-orange-500 bg-orange-500/10" },
    { icon: <BarChart2 size={22} />, title: "Analytics & Reports", desc: "Gain insights and generate reports with ease.", color: "text-blue-500 bg-blue-500/10" },
  ];

  return (
    <Layout>
      <section id="home" className="relative overflow-hidden bg-base-100 px-6 py-20 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute -right-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="animate-fade-up font-display text-4xl font-bold leading-[1.15] text-base-content sm:text-5xl">
              Manage Projects.
              <br />
              Empower <span className="text-primary">Innovation.</span>
            </h1>

            <p className="animate-fade-up mt-5 max-w-md text-base leading-relaxed text-base-content/60" style={{ animationDelay: "0.1s" }}>
              A centralized platform for teams and organizations to
              collaborate, track progress, and achieve excellence.
            </p>

            <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.2s" }}>
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-content shadow-lg shadow-primary/25 transition-opacity hover:opacity-90">
                Get Started <ArrowRight size={16} />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-6 py-3 text-sm font-semibold text-base-content transition-colors hover:bg-base-200">
                Explore Features
              </a>
            </div>

            <div className="animate-fade-up mt-9 flex flex-wrap gap-6" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck size={16} />
                </span>
                <span className="text-sm font-medium text-base-content/70">Secure & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <UsersRound size={16} />
                </span>
                <span className="text-sm font-medium text-base-content/70">Collaborative</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Sparkles size={16} />
                </span>
                <span className="text-sm font-medium text-base-content/70">Smart Insights</span>
              </div>
            </div>
          </div>

          <div id="dashboard" className="animate-fade-up overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl shadow-primary/10" style={{ animationDelay: "0.15s" }}>
            <div className="flex">
              <div className="flex w-14 flex-col items-center gap-5 bg-neutral py-5">
                <Menu size={18} className="text-neutral-content/50" />
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-content">
                  <HomeIcon size={16} />
                </div>
                <Folder size={18} className="text-neutral-content/50" />
                <UserCircle size={18} className="text-neutral-content/50" />
                <FileText size={18} className="text-neutral-content/50" />
                <Calendar size={18} className="text-neutral-content/50" />
                <BarChart2 size={18} className="text-neutral-content/50" />
                <Settings size={18} className="mt-auto text-neutral-content/50" />
              </div>

              <div className="flex-1 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-semibold text-base-content">Dashboard</p>
                    <p className="mt-0.5 text-xs text-base-content/40">Welcome back, John 👋</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-base-content/40" />
                    <div className="h-7 w-7 rounded-full bg-primary/10" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-base-300 bg-base-100 p-2.5">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <p className="mt-2 font-display text-lg font-bold text-base-content">{stat.value}</p>
                      <p className="text-[10px] text-base-content/40">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-base-300 bg-base-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-base-content">Project Overview</p>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">+18%</span>
                    </div>
                    <svg viewBox="0 0 220 80" className="mt-2 w-full">
                      <defs>
                        <linearGradient id="homeChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`0,80 ${chartPoints.map((v, i) => `${(i / (chartPoints.length - 1)) * 220},${70 - (v / chartMax) * 60}`).join(" ")} 220,80`}
                        fill="url(#homeChart)"
                      />
                      <polyline
                        points={chartPoints.map((v, i) => `${(i / (chartPoints.length - 1)) * 220},${70 - (v / chartMax) * 60}`).join(" ")}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex justify-between text-[9px] text-base-content/30">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-base-300 bg-base-100 p-4">
                    <p className="mb-3 text-xs font-semibold text-base-content">Recent Activities</p>
                    <div className="space-y-2.5">
                      {activities.map((activity) => (
                        <div key={activity.title} className="flex items-center gap-2.5">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${activity.color}`}>
                            {activity.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-medium text-base-content">{activity.title}</p>
                            <p className="truncate text-[10px] text-base-content/40">{activity.sub}</p>
                          </div>
                          <span className="shrink-0 text-[10px] text-base-content/30">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-up relative z-10 mx-auto mt-14 max-w-5xl rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl" style={{ animationDelay: "0.3s" }}>
          <div className="grid grid-cols-2 gap-6 divide-x divide-base-300 sm:grid-cols-4">
            {heroStats.map((stat, i) => (
              <div key={stat.label} className={`flex items-center gap-3 px-4 ${i === 0 ? "pl-0" : ""}`}>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.color}`}>
                  {stat.icon}
                </span>
                <div>
                  <p className="font-display text-xl font-bold text-base-content">{stat.value}</p>
                  <p className="text-xs text-base-content/50">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-base-100 px-6 py-24 text-center sm:px-10 lg:px-16">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">Why Choose Us</span>
        <h2 className="mx-auto mt-3 max-w-lg font-display text-3xl font-bold text-base-content">
          Everything You Need to <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Succeed</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-base-content/50">
          Powerful features designed to simplify project management and enhance collaboration.
        </p>

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-base-300 bg-base-100 p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="mt-4 font-semibold text-base-content">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-snug text-base-content/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-base-100 px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">About</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-base-content">
              Built as a single system of record
            </h2>
            <p className="mt-4 leading-relaxed text-base-content/60">
              ProjectPortal replaces scattered spreadsheets and status
              meetings with one accountable workspace — every task, owner,
              and deadline visible to the people who need it.
            </p>
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100 p-8">
            <p className="font-display text-5xl font-bold text-base-content">
              75<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">%</span>
            </p>
            <p className="mt-3 text-sm text-base-content/60">
              average completion rate for teams using the portal for 90+ days
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Bring structure to your next project</h3>
            <p className="mt-1 text-sm text-white/80">Set up your workspace in minutes — no credit card required.</p>
          </div>
          <Link to="/signup" className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-105">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </Layout>
  );
}