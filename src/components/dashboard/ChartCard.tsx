import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ChartCard({ title, children, className, delay = 0 }: ChartCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-lg font-display font-semibold text-foreground mb-6">
        {title}
      </h2>
      {children}
    </div>
  );
}
