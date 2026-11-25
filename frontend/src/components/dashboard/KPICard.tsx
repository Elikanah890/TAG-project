import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "maroon" | "gold" | "success" | "danger";
  className?: string;
}

const toneStyles: Record<string, string> = {
  default: "bg-gray-100 text-gray-600",
  maroon: "bg-[#7A1F2B]/10 text-[#7A1F2B]",
  gold: "bg-[#C9962B]/15 text-[#A9771F]",
  success: "bg-emerald-50 text-emerald-600",
  danger: "bg-rose-50 text-rose-600",
};

export function KPICard({ label, value, hint, icon: Icon, tone = "default", className }: KPICardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", toneStyles[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
