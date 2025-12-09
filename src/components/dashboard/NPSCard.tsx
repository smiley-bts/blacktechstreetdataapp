import { cn } from "@/lib/utils";

interface NPSData {
  nps: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
  promotersCount: number;
  passivesCount: number;
  detractorsCount: number;
}

interface NPSCardProps {
  data: NPSData;
  className?: string;
}

export function NPSCard({ data, className }: NPSCardProps) {
  const getNPSStatus = (nps: number) => {
    if (nps >= 70) return { label: "Excellent", color: "text-primary-foreground" };
    if (nps >= 50) return { label: "Great", color: "text-primary-foreground" };
    if (nps >= 0) return { label: "Good", color: "text-primary-foreground/90" };
    return { label: "Needs Work", color: "text-primary-foreground/80" };
  };

  const status = getNPSStatus(data.nps);

  return (
    <div className={cn("nps-gradient rounded-xl p-8 shadow-xl animate-fade-in", className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-semibold text-primary-foreground/90">
            Net Promoter Score
          </h2>
          <p className="text-sm text-primary-foreground/70 mt-1">
            Based on {data.total} responses
          </p>
        </div>
        <span className="px-3 py-1 bg-primary-foreground/20 rounded-full text-sm font-medium text-primary-foreground">
          {status.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-7xl font-display font-bold text-primary-foreground">
          {data.nps}
        </span>
        <span className="text-2xl text-primary-foreground/70">/ 100</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-primary-foreground/10 rounded-lg p-4">
          <div className="text-3xl font-display font-bold text-primary-foreground">
            {data.promoters}%
          </div>
          <div className="text-sm text-primary-foreground/80 mt-1">Promoters</div>
          <div className="text-xs text-primary-foreground/60 mt-0.5">
            {data.promotersCount} people (9-10)
          </div>
        </div>
        <div className="bg-primary-foreground/10 rounded-lg p-4">
          <div className="text-3xl font-display font-bold text-primary-foreground">
            {data.passives}%
          </div>
          <div className="text-sm text-primary-foreground/80 mt-1">Passives</div>
          <div className="text-xs text-primary-foreground/60 mt-0.5">
            {data.passivesCount} people (7-8)
          </div>
        </div>
        <div className="bg-primary-foreground/10 rounded-lg p-4">
          <div className="text-3xl font-display font-bold text-primary-foreground">
            {data.detractors}%
          </div>
          <div className="text-sm text-primary-foreground/80 mt-1">Detractors</div>
          <div className="text-xs text-primary-foreground/60 mt-0.5">
            {data.detractorsCount} people (0-6)
          </div>
        </div>
      </div>
    </div>
  );
}
