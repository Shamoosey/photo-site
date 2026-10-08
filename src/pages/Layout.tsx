import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export function Layout() {
  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-cream">
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
    </div>
  );
}
