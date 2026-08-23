import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-base-100">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}