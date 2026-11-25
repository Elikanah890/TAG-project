import * as React from "react";
import { cn } from "@/lib/utils";

export function DataTable({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)} {...props}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
