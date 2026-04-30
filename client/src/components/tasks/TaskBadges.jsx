import { cn, priorityClasses, statusClasses, statusLabel } from "@/lib/utils";

export function PriorityBadge({ priority, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        priorityClasses(priority),
        className
      )}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusClasses(status),
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
