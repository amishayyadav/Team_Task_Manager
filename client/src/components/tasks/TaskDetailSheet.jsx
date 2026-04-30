import { Calendar, AlertTriangle, User as UserIcon, Trash2, Edit } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PriorityBadge, StatusBadge } from "./TaskBadges";
import { cn, formatDate, getInitials, isOverdue } from "@/lib/utils";

export default function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) {
  if (!task) return null;
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="pr-8">{task.title}</SheetTitle>
          <SheetDescription>
            Created {formatDate(task.createdAt)} by {task.createdBy?.name || "—"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 px-2.5 py-0.5 text-xs font-medium">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>

          {task.description && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Description</div>
              <p className="text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <Separator />

          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Due date
              </dt>
              <dd className={cn(overdue && "text-red-600 font-medium")}>
                {task.dueDate ? formatDate(task.dueDate) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Assignee
              </dt>
              <dd>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(task.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Last updated</dt>
              <dd>{formatDate(task.updatedAt, "MMM d, yyyy h:mm a")}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex items-center gap-2">
          {canEdit && (
            <Button onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
