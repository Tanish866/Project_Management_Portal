export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 px-4 py-5 text-center sm:px-6 lg:px-10">
      <p className="text-sm text-slate-400">
        © {currentYear} Project Management Portal. All rights reserved.
      </p>
    </footer>
  );
}