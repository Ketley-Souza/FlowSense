import { Link, useLocation } from "react-router-dom";

type Props = {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  to: string;
  badge?: number;
};

export function SidebarItem({
  icon,
  label,
  isOpen,
  badge,
  to,
}: Props) {
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      title={!isOpen ? label : undefined}
      className={`
        flex h-12 items-center rounded-xl
        transition-all duration-300

        ${isOpen
          ? "px-3"
          : "justify-center"
        }

        ${isActive
          ? "bg-indigo-50 text-indigo-500"
          : "text-slate-500 hover:bg-indigo-50/60 hover:text-slate-700"
        }
      `}
    >
      {/* ICON */}
      <div className="flex w-5 shrink-0 items-center justify-center">
        {icon}
      </div>

      {/* LABEL */}
      {isOpen && (
        <span
          className={`
    overflow-hidden whitespace-nowrap text-sm font-medium
    transition-all duration-300 ease-out

    ${isOpen
              ? "ml-3 max-w-[140px] opacity-100"
              : "ml-0 max-w-0 opacity-0"
            }
  `}
        >
          {label}
        </span>
      )}

      {/* BADGE */}
      {isOpen && badge && (
        <span
          className={`
    overflow-hidden rounded-full bg-red-500
    text-xs font-semibold text-white
    transition-all duration-300 ease-out

    ${isOpen && badge
              ? "ml-auto px-2 py-0.5 opacity-100"
              : "ml-0 max-w-0 px-0 py-0 opacity-0"
            }
  `}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}