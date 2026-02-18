import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, TrendingDown } from "lucide-react";
import { EventAttendanceData, AttendeeRow } from "@/hooks/useEventAttendanceCSV";
import { Skeleton } from "@/components/ui/skeleton";

interface EventAttendanceTabsProps {
  data: EventAttendanceData;
  showEmail?: boolean;
  label?: string;
}

function AttendeeTable({ rows, showEmail }: { rows: AttendeeRow[]; showEmail?: boolean }) {
  return (
    <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
          <tr>
            <th className="text-left p-2 font-medium text-muted-foreground">#</th>
            <th className="text-left p-2 font-medium text-muted-foreground">First Name</th>
            <th className="text-left p-2 font-medium text-muted-foreground">Last Name</th>
            {showEmail && <th className="text-left p-2 font-medium text-muted-foreground">Email</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
              <td className="p-2 text-muted-foreground">{i + 1}</td>
              <td className="p-2">{row.firstName}</td>
              <td className="p-2">{row.lastName}</td>
              {showEmail && <td className="p-2 text-muted-foreground">{row.email || "—"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EventAttendanceTabs({ data, showEmail = false, label }: EventAttendanceTabsProps) {
  if (data.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {label && <h3 className="text-lg font-semibold text-foreground">{label}</h3>}
      
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-muted-foreground">Total Sign-ins</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{data.rawCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-muted-foreground">New Attendees</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{data.dedupeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-muted-foreground">Returning Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{data.duplicateRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="actual" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="actual" className="flex-1">
            Actual ({data.rawCount})
          </TabsTrigger>
          <TabsTrigger value="nodupe" className="flex-1">
            New Attendees ({data.dedupeCount})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="actual">
          <AttendeeTable rows={data.rawRows} showEmail={showEmail} />
        </TabsContent>
        <TabsContent value="nodupe">
          <AttendeeTable rows={data.deduplicatedRows} showEmail={showEmail} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
