import StaticPage from "./StaticPage";

export default function Privacy() {
  return (
    <StaticPage
      title="Privacy Policy"
      content="This application stores only the information you provide during registration (name, email, and a securely hashed password) for the purpose of demonstrating authentication and role-based access control. As an academic project, no data is shared with third parties."
    />
  );
}