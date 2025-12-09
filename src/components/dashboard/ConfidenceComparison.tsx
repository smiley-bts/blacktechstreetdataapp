import { ArrowRight } from "lucide-react";

interface ParticipantConfidence {
  name: string;
  email: string;
  preSolving: number | null;
  postSolving: number | null;
  preApplying: number | null;
  postApplying: number | null;
  solvingChange: number | null;
  applyingChange: number | null;
}

interface ConfidenceComparisonProps {
  participants: ParticipantConfidence[];
}

const extractConfidenceScore = (value: string | undefined): number | null => {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d)/);
  return match ? parseInt(match[1], 10) : null;
};

const getScoreColor = (score: number | null): string => {
  if (score === null) return "bg-muted";
  if (score >= 4) return "bg-primary";
  if (score >= 3) return "bg-chart-amber";
  return "bg-chart-pink";
};

const getChangeColor = (change: number | null): string => {
  if (change === null) return "text-muted-foreground";
  if (change > 0) return "text-primary";
  if (change < 0) return "text-destructive";
  return "text-muted-foreground";
};

const getChangeSymbol = (change: number | null): string => {
  if (change === null) return "—";
  if (change > 0) return `+${change}`;
  return String(change);
};

export function ConfidenceComparison({ participants }: ConfidenceComparisonProps) {
  const avgSolvingChange = participants
    .filter(p => p.solvingChange !== null)
    .reduce((sum, p) => sum + (p.solvingChange || 0), 0) / 
    participants.filter(p => p.solvingChange !== null).length || 0;

  const avgApplyingChange = participants
    .filter(p => p.applyingChange !== null)
    .reduce((sum, p) => sum + (p.applyingChange || 0), 0) / 
    participants.filter(p => p.applyingChange !== null).length || 0;

  const matchedParticipants = participants.filter(p => p.preSolving !== null || p.preApplying !== null);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {avgSolvingChange > 0 ? "+" : ""}{avgSolvingChange.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Avg. Problem Solving Change</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {avgApplyingChange > 0 ? "+" : ""}{avgApplyingChange.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Avg. Applying Tools Change</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Participant</th>
              <th className="text-center py-3 px-2 font-medium text-muted-foreground" colSpan={3}>
                Problem Solving Confidence
              </th>
              <th className="text-center py-3 px-2 font-medium text-muted-foreground" colSpan={3}>
                Applying AI Tools
              </th>
            </tr>
            <tr className="border-b border-border/50 text-xs">
              <th></th>
              <th className="text-center py-2 px-2 text-muted-foreground">Before</th>
              <th className="text-center py-2 px-2 text-muted-foreground">After</th>
              <th className="text-center py-2 px-2 text-muted-foreground">Δ</th>
              <th className="text-center py-2 px-2 text-muted-foreground">Before</th>
              <th className="text-center py-2 px-2 text-muted-foreground">After</th>
              <th className="text-center py-2 px-2 text-muted-foreground">Δ</th>
            </tr>
          </thead>
          <tbody>
            {matchedParticipants.map((p, idx) => (
              <tr key={p.email || idx} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-2">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[150px]">{p.email}</div>
                </td>
                {/* Solving */}
                <td className="text-center py-3 px-2">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${getScoreColor(p.preSolving)} text-primary-foreground`}>
                    {p.preSolving ?? "—"}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${getScoreColor(p.postSolving)} text-primary-foreground`}>
                      {p.postSolving ?? "—"}
                    </span>
                  </div>
                </td>
                <td className={`text-center py-3 px-2 font-semibold ${getChangeColor(p.solvingChange)}`}>
                  {getChangeSymbol(p.solvingChange)}
                </td>
                {/* Applying */}
                <td className="text-center py-3 px-2">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${getScoreColor(p.preApplying)} text-primary-foreground`}>
                    {p.preApplying ?? "—"}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${getScoreColor(p.postApplying)} text-primary-foreground`}>
                      {p.postApplying ?? "—"}
                    </span>
                  </div>
                </td>
                <td className={`text-center py-3 px-2 font-semibold ${getChangeColor(p.applyingChange)}`}>
                  {getChangeSymbol(p.applyingChange)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Showing {matchedParticipants.length} participants with before/after data • Scores on 1-5 scale
      </div>
    </div>
  );
}

export { extractConfidenceScore };
