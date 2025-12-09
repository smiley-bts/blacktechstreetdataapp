import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "blue" | "purple" | "amber";
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: "bg-card border-border",
  blue: "bg-card border-chart-blue/20",
  purple: "bg-card border-chart-purple/20",
  amber: "bg-card border-chart-amber/20",
};

const valueStyles = {
  default: "text-foreground",
  blue: "text-chart-blue",
  purple: "text-chart-purple",
  amber: "text-chart-amber",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
  delay = 0,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg opacity-0 animate-fade-in",
        variantStyles[variant],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={cn("text-4xl font-display font-bold mt-2", valueStyles[variant])}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2 rounded-lg", `bg-${variant === 'default' ? 'muted' : variant}/10`)}>
            <Icon className={cn("w-5 h-5", valueStyles[variant])} />
          </div>
        )}
      </div>
    </div>
  );
}
