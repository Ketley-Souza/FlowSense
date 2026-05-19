import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Breadcrumb ou label adicional à esquerda */
  badge?: ReactNode;
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pt-1">
      <div className="min-w-0">
        {badge && <div className="mb-2">{badge}</div>}
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
