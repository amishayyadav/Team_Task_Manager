import { Link } from "react-router-dom";
import { Plus, FolderKanban, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import StatsCards from "@/components/dashboard/StatsCards";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { PriorityBadge, StatusBadge } from "@/components/tasks/TaskBadges";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useDashboard();
  const [createOpen, setCreateOpen] = useState(false);

  const tasks = data?.tasks?.data || [];
  const projects = data?.projects || [];

  return (
    <>
      <PageHeader
        title={`Hey, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's what's on your plate today."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New project
          </Button>
        }
      />

      <StatsCards counts={data?.counts} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No tasks assigned"
                description="When you're assigned a task, it'll show up here."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-28">Priority</TableHead>
                    <TableHead className="w-36">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t) => {
                    const overdue = isOverdue(t.dueDate, t.status);
                    return (
                      <TableRow key={t._id}>
                        <TableCell>
                          <Link
                            to={`/projects/${t.project?._id || t.project}`}
                            className="font-medium hover:underline"
                          >
                            {t.title}
                          </Link>
                          {t.project?.name && (
                            <div className="text-xs text-muted-foreground">
                              {t.project.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell><StatusBadge status={t.status} /></TableCell>
                        <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                        <TableCell className={cn(overdue && "text-red-600 font-medium")}>
                          {t.dueDate ? (
                            <span className="inline-flex items-center gap-1">
                              {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                              {formatDate(t.dueDate)}
                            </span>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create your first project to get going."
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create project
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {projects.map((p) => (
                  <li key={p._id}>
                    <Link
                      to={`/projects/${p._id}`}
                      className="block rounded-md border p-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{p.name}</div>
                        <Badge variant={p.role === "ADMIN" ? "default" : "secondary"}>
                          {p.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {p.taskStats.total} tasks · {p.taskStats.done} done · {p.taskStats.overdue} overdue
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
