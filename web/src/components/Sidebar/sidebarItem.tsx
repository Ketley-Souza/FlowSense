import { Link, useLocation } from "react-router-dom";

type Props = {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  to: string;
  badge?: number;
};

export function SidebarItem({ icon, label, isOpen, badge, to }: Props) {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
    flex items-center h-12 rounded-xl
    transition-all duration-300 ease-in-out
    
    px-2
    ${isOpen ? "pl-3" : "pl-[18px]"}
    
    ${
      isActive
        ? "bg-indigo-50 text-indigo-400"
        : "text-gray-600 hover:bg-indigo-50/60"
    }
  `}
    >
      {/* ÍCONE */}
      <div className="flex items-center justify-center min-w-6">{icon}</div>

      {/* TEXTO */}
      <div
        className={`
      overflow-hidden transition-all duration-300
      ${isOpen ? "w-30 ml-3 opacity-100" : "w-0 ml-0 opacity-0"}
    `}
      >
        <span className="text-sm whitespace-nowrap">{label}</span>
      </div>

      {/* BADGE */}
      <div
        className={`
      overflow-hidden transition-all duration-300
      ${isOpen && badge ? "w-auto ml-auto opacity-100" : "w-0 opacity-0"}
    `}
      >
        {badge && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}
