interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className = "", lines = 3 }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-5 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-100 rounded-full w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-slate-100 rounded-full mb-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 bg-slate-100 rounded-full w-20 mb-3" />
          <div className="h-7 bg-slate-200 rounded-full w-12" />
        </div>
        <div className="w-11 h-11 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
