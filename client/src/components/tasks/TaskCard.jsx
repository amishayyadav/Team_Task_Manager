import { Calendar, AlertTriangle, User as UserIcon } from "lucide-react";
import { cn, formatDate, getInitials, isOverdue } from "@/lib/utils";
import { PriorityBadge } from "./TaskBadges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TaskCard({ task, onClick, className, dragHandleProps }) {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <button
      type="button"
      onClick={onClick}
      {...dragHandleProps}
      className={cn(
        "w-full text-left bg-card border rounded-md p-3 shadow-sm hover:shadow-md transition-shadow space-y-2 cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        overdue && "border-red-300 dark:border-red-900",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium leading-snug line-clamp-2">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {task.dueDate ? (
            <span className={cn("flex items-center gap-1", overdue && "text-red-600 font-medium")}>
              {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
              {formatDate(task.dueDate, "MMM d")}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              No due date
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {getInitials(task.assignee.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5" />
              Unassigned
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
