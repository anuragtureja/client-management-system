import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    "New": "bg-blue-100 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
    "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "On Hold": "bg-slate-100 text-slate-700 border-slate-200",
  };

  const defaultStyle = "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-semibold border",
      styles[status] || defaultStyle
    )}>
      {status}
    </span>
  );
}
