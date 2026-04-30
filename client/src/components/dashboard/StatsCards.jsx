import { CheckSquare, Clock, AlertTriangle, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATS = [
  { key: "total", label: "Assigned to me", icon: CheckSquare, accent: "text-primary" },
  { key: "inProgress", label: "In progress", icon: Clock, accent: "text-blue-500" },
  { key: "dueToday", label: "Due today", icon: CalendarClock, accent: "text-amber-500" },
  { key: "overdue", label: "Overdue", icon: AlertTriangle, accent: "text-red-500" },
];

export default function StatsCards({ counts, isLoading }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s) => (
        <Card key={s.key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.label}
            </CardTitle>
            <s.icon className={`h-4 w-4 ${s.accent}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold">{counts?.[s.key] ?? 0}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
