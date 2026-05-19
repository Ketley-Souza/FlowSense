import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Columns3,
  Bell,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { SidebarItem } from "../Sidebar/sidebarItem";
import { getUsuarioLogado, logout as logoutAuth } from "@/services/auth";
import { useSidebar } from "@/contexts/SidebarContext";
import logo from "@/assets/Logo.svg";

export function Sidebar() {
  const navigate = useNavigate();
  const usuarioLogado = getUsuarioLogado();
  const { isOpen, setIsOpen, isPinned, setIsPinned, isMobileOpen, setIsMobileOpen } = useSidebar();

  const handleMouseEnter = () => {
    if (!isPinned) setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) setIsOpen(false);
  };

  const handleLogout = () => {
    logoutAuth();
    navigate("/login");
  };

  const getInitials = (nome: string) => {
    return nome
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </button>

      {/* OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed h-screen bg-neutral-50 border-r border-slate-200
          transition-all duration-300 ease-in-out
          overflow-hidden left-0 top-0
          ${isOpen ? "w-64" : "w-20"}
          ${isMobileOpen ? "z-50" : "-left-full md:left-0 md:z-30"}
        `}
      >
        <div className="flex flex-col justify-between h-full">
          
          {/* TOP */}
          <div>
            <div className="pl-5 pt-6 mb-6">
              <div className="flex items-center">
                <img src={logo} className="w-9 h-9" />

                {/* LOGO TEXT */}
                <div
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? "w-30 ml-2 opacity-100" : "w-0 ml-0 opacity-0"}
                  `}
                >
                  <span className="font-bold text-lg text-gray-600 whitespace-nowrap">
                    FlowSense
                  </span>
                </div>
              </div>
            </div>

            {/* NAV */}
            <nav className="flex flex-col px-3">
              <div className="mb-2">
                <SidebarItem
                  icon={<LayoutDashboard size={20} />}
                  label="Dashboard"
                  isOpen={isOpen}
                  to="/dashboard"
                />
              </div>

              <div className="mb-2">
                <SidebarItem
                  icon={<FolderKanban size={20} />}
                  label="Projetos"
                  isOpen={isOpen}
                  to="/projetos"
                />
              </div>

              <div className="mb-2">
                <SidebarItem
                  icon={<Columns3 size={20} />}
                  label="Kamban"
                  isOpen={isOpen}
                  to="/kamban"
                />
              </div>

              <div className="mb-2">
                <SidebarItem
                  icon={<Bell size={20} />}
                  label="Notificações"
                  isOpen={isOpen}
                  badge={2}
                  to="/notificacoes"
                />
              </div>

              <div className="mb-2">
                <SidebarItem
                  icon={<Users size={20} />}
                  label="Equipe"
                  isOpen={isOpen}
                  to="/equipe"
                />
              </div>
            </nav>
          </div>

          {/* PIN */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="text-xs text-gray-400 hover:text-gray-700 px-3 mt-2"
          >
            {isPinned ? "Desafixar" : "Fixar"}
          </button>

          {/* FOOTER */}
          <div>
            <div className="border-t border-slate-200 my-3" />

            <div className="px-3">
              <SidebarItem
                icon={<Settings size={20} />}
                label="Configurações"
                isOpen={isOpen}
                to="/configuracoes"
              />

              {/* USER */}
              <div className="flex items-center justify-between px-2 py-3 mt-2 group">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {usuarioLogado ? getInitials(usuarioLogado.nome) : "U"}
                  </div>

                  <div
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${isOpen ? "w-35 ml-2 opacity-100" : "w-0 ml-0 opacity-0"}
                    `}
                  >
                    <span className="text-sm text-gray-700 font-medium block whitespace-nowrap">
                      {usuarioLogado?.nome || "Usuário"}
                    </span>
                    <span className="text-xs text-gray-500 block whitespace-nowrap truncate">
                      {usuarioLogado?.email || "email@example.com"}
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <button
                    onClick={handleLogout}
                    className="shrink-0 ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}