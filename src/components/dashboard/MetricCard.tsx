import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "blue" | "purple" | "amber" | "green";
  className?: string;
  delay?: number;
  animate?: boolean;
}

const variantStyles = {
  default: "bg-card border-border",
  blue: "bg-card border-chart-blue/20",
  purple: "bg-card border-chart-purple/20",
  amber: "bg-card border-chart-amber/20",
  green: "bg-card border-emerald-500/20",
};

const valueStyles = {
  default: "text-foreground",
  blue: "text-chart-blue",
  purple: "text-chart-purple",
  amber: "text-chart-amber",
  green: "text-emerald-500",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
  delay = 0,
  animate = true,
}: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  const isNumeric = !isNaN(numericValue) && typeof value !== 'string';
  
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
            {animate && isNumeric ? <CountUp end={numericValue} duration={600} /> : value}
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
