import { Sidebar } from "../Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  // A sidebar recolhida tem 80px (w-[80px] = w-20).
  // Quando expandida por hover ela flutua por cima (overlay), não empurra o conteúdo.
  // Por isso a margem é sempre fixa em md+: 80px.
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto bg-slate-50 pt-14 md:pt-0 md:ml-20">
        <Outlet />
      </main>
    </div>
  );
}