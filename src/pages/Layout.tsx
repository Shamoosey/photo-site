import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

export function Layout() {
  return (
    <div className="p-2 flex flex-row min-h-screen bg-bright">
      <Navbar />
      <main className="grow">
        <Outlet />
      </main>
    </div>
  );
}
