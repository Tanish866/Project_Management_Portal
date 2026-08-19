import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-base-200">
      <Navbar />
      <div className="mx-auto w-9/12 flex-1">{children}</div>
      <Footer />
    </div>
  );
}