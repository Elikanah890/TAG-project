import * as React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function DashboardCard({ className, noPadding, ...props }: DashboardCardProps) {
  return (
    <div
      className={cn("bg-white rounded-xl shadow-sm border border-gray-100", !noPadding && "p-6", className)}
      {...props}
    />
  );
}
