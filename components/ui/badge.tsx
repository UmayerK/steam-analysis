import { cn } from "@/lib/utils";
import React from "react";

export const Badge = ({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "positive" | "negative" | "neutral";
  children: React.ReactNode;
}) => {
  const variantStyles = {
    default: "bg-slate-800/50 text-white border-white/10",
    positive: "bg-green-500/20 text-green-400 border-green-500/30",
    negative: "bg-red-500/20 text-red-400 border-red-500/30",
    neutral: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
