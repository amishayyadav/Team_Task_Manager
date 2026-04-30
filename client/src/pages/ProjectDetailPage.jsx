import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, ArrowLeft, UserPlus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/layout/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/hooks/useProjects";
import { useTasks, useDeleteTask } from "@/hooks/useTasks";
import { useAuthStore } from "@/store/auth";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFiltersBar from "@/components/tasks/TaskFiltersBar";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import EditTaskDialog from "@/components/tasks/EditTaskDialog";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import MembersTable from "@/components/members/MembersTable";
import InviteMemberDialog from "@/components/members/InviteMemberDialog";
import ProjectSettings from "@/components/projects/ProjectSettings";
import RoleGate from "@/components/auth/RoleGate";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const { data: project, isLoading } = useProject(id);

  const [filters, setFilters] = useState({});
  const queryFilters = useMemo(() => {
    const f = { ...filters };
    if (!f.search) delete f.search;
    return f;
  }, [filters]);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(id, queryFilters);
  const tasks = tasksData?.data || [];

  const deleteTask = useDeleteTask(id);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState("TODO");

  if (isLoading || !project) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isOwner = project.isOwner;
  const isAdmin = project.role === "ADMIN";
  const ownerId = project.owner?._id || project.owner;

  function canDeleteTask(task) {
    if (!task) return false;
    if (isAdmin) return true;
    if (task.createdBy?._id === user._id) return true;
    return false;
  }

  function canEditTask(task) {
    if (!task) return false;
    if (isAdmin) return true;
    if (task.createdBy?._id === user._id) return true;
    if (task.assignee?._id === user._id) return true;
    return false;
  }

  return (
    <>
      <div className="mb-2">
        <Link
          to="/projects"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
      </div>
      <PageHeader
        title={project.name}
        description={project.description || "No description."}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={isAdmin ? "default" : "secondary"}>{project.role}</Badge>
            <Button onClick={() => { setDefaultStatus("TODO"); setCreateTaskOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> New task
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          ["Total", project.taskStats.total],
          ["To do", project.taskStats.todo],
          ["In progress", project.taskStats.inProgress],
          ["Done", project.taskStats.done],
          ["Overdue", project.taskStats.overdue],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <RoleGate role={project.role} allow={["ADMIN"]}>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </RoleGate>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          {tasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-96" />)}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Add your first task to get this project moving."
              action={
                <Button onClick={() => setCreateTaskOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New task
                </Button>
              }
            />
          ) : (
            <KanbanBoard
              projectId={project._id}
              tasks={tasks}
              onSelectTask={setDetailTask}
            />
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskFiltersBar
            value={filters}
            onChange={setFilters}
            members={project.members}
          />
          {tasksLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks match"
              description="Try adjusting your filters or create a new task."
            />
          ) : (
            <TaskTable
              tasks={tasks}
              onSelect={setDetailTask}
              onEdit={setEditingTask}
              onDelete={async (t) => {
                if (window.confirm(`Delete "${t.title}"?`)) {
                  await deleteTask.mutateAsync(t._id);
                }
              }}
              canDelete={canDeleteTask}
            />
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {project.members.length} {project.members.length === 1 ? "member" : "members"}
            </p>
            {isAdmin && (
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add member
              </Button>
            )}
          </div>
          <MembersTable
            project={{ ...project, owner: ownerId }}
            isAdmin={isAdmin}
            currentUserId={user._id}
          />
        </TabsContent>

        <TabsContent value="settings">
          <ProjectSettings project={project} isOwner={isOwner} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        projectId={project._id}
        members={project.members}
        defaultStatus={defaultStatus}
      />
      <EditTaskDialog
        open={Boolean(editingTask)}
        onOpenChange={(o) => !o && setEditingTask(null)}
        task={editingTask}
        projectId={project._id}
        members={project.members}
      />
      <TaskDetailSheet
        open={Boolean(detailTask)}
        onOpenChange={(o) => !o && setDetailTask(null)}
        task={detailTask}
        canEdit={canEditTask(detailTask)}
        canDelete={canDeleteTask(detailTask)}
        onEdit={() => {
          setEditingTask(detailTask);
          setDetailTask(null);
        }}
        onDelete={async () => {
          await deleteTask.mutateAsync(detailTask._id);
          setDetailTask(null);
        }}
      />
      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        projectId={project._id}
      />
    </>
  );
}
