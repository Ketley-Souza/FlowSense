import { Sidebar } from "../Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}