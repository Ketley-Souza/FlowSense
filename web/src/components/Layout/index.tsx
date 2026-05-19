import { Sidebar } from "../Sidebar";
import { Outlet } from "react-router-dom";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Layout() {
  const { isOpen, isPinned } = useSidebar();
  const sidebarWidth = isOpen || isPinned ? "ml-64" : "ml-20";

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar />

      <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarWidth}`}>
        <Outlet />
      </main>
    </div>
  );
}