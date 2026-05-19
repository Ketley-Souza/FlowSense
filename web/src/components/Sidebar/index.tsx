import { useNavigate } from "react-router-dom";

import {
  Bell,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";

import { SidebarItem } from "@/components/Sidebar/sidebarItem";

import { useSidebar } from "@/contexts/SidebarContext";
import { getUsuarioLogado, logout as logoutAuth } from "@/services/auth";

import logo from "@/assets/Logo.svg";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    icon: <FolderKanban size={20} />,
    label: "Projetos",
    to: "/projetos",
  },
  {
    icon: <Columns3 size={20} />,
    label: "Kanban",
    to: "/kamban",
  },
  {
    icon: <Bell size={20} />,
    label: "Notificações",
    to: "/notificacoes",
    badge: 2,
  },
  {
    icon: <Users size={20} />,
    label: "Equipe",
    to: "/equipe",
  },
];

export function Sidebar() {
  const navigate = useNavigate();

  const usuario = getUsuarioLogado();

  const {
    isOpen,
    setIsOpen,
    isMobileOpen,
    setIsMobileOpen,
  } = useSidebar();

  const showLabels = isMobileOpen || isOpen;

  const sidebarWidth = showLabels ? "w-64" : "w-[80px]";

  const handleLogout = () => {
    logoutAuth();
    navigate("/login");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Abrir menu"
        className="
          fixed left-4 top-4 z-50 rounded-xl border
          border-slate-200 bg-white p-2 text-slate-700
          shadow-sm transition hover:bg-slate-50 md:hidden
        "
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="
            fixed inset-0 z-40 bg-black/50
            backdrop-blur-sm md:hidden
          "
        />
      )}

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`
          fixed left-0 top-0 z-50
          flex h-screen flex-col overflow-hidden

          border-r border-slate-100
          bg-white

          transition-all duration-300 ease-out

          ${sidebarWidth}

          ${
            isMobileOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div
          className={`
            flex h-20 items-center
            transition-all duration-300

            ${showLabels ? "px-5" : "justify-center"}
          `}
        >
          <img
            src={logo}
            alt="FlowSense"
            className="h-8 w-8 shrink-0"
          />

          <span
            className={`
              overflow-hidden whitespace-nowrap
              text-base font-bold text-slate-800

              transition-all duration-300 ease-out

              ${
                showLabels
                  ? "ml-3 max-w-[140px] opacity-100"
                  : "ml-0 max-w-0 opacity-0"
              }
            `}
          >
            FlowSense
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              badge={item.badge}
              isOpen={showLabels}
            />
          ))}
        </nav>

        {/* FOOTER */}
        <div className="border-t border-slate-100 p-3">
          <SidebarItem
            icon={<Settings size={20} />}
            label="Configurações"
            to="/configuracoes"
            isOpen={showLabels}
          />

          {/* USER */}
          <div
            className={`
              mt-2 flex items-center rounded-xl py-2.5
              transition-colors hover:bg-slate-50

              ${showLabels ? "px-3" : "justify-center"}
            `}
          >
            {/* AVATAR */}
            <div
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-full bg-indigo-500
                text-xs font-semibold text-white
              "
            >
              {usuario ? getInitials(usuario.nome) : "U"}
            </div>

            {/* USER INFO */}
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-out

                ${
                  showLabels
                    ? "ml-3 max-w-[160px] opacity-100"
                    : "ml-0 max-w-0 opacity-0"
                }
              `}
            >
              <p className="truncate whitespace-nowrap text-sm font-semibold text-slate-800">
                {usuario?.nome || "Usuário"}
              </p>

              <p className="truncate whitespace-nowrap text-xs text-slate-400">
                {usuario?.email || ""}
              </p>
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              title="Sair"
              className={`
                overflow-hidden rounded-lg p-1
                text-slate-400 transition-all duration-300

                hover:bg-red-50 hover:text-red-500

                ${
                  showLabels
                    ? "ml-auto opacity-100"
                    : "ml-0 max-w-0 opacity-0"
                }
              `}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}