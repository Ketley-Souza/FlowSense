import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;       // ex: "bg-indigo-100"
  iconColor: string;    // ex: "text-indigo-600"
  trend?: {
    value: number;
    positive: boolean;
  };
  sub?: string;
}

export function StatCard({ label, value, icon, iconBg, iconColor, trend, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow">
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
        {sub && <p className="text-xs text-slate-400 mt-1 truncate">{sub}</p>}
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% esta semana
          </p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
    </div>
  );
}
