import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, parseISO } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(value, fmt = "MMM d, yyyy") {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return format(d, fmt);
}

export function formatRelative(value) {
  if (!value) return "—";
  const d = typeof value === "string" ? parseISO(value) : value;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === "DONE") return false;
  const d = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  return isPast(d) && !isToday(d);
}

export function priorityClasses(priority) {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
    case "LOW":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function statusClasses(status) {
  switch (status) {
    case "TODO":
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
    case "DONE":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function statusLabel(status) {
  return { TODO: "To do", IN_PROGRESS: "In progress", DONE: "Done" }[status] || status;
}

export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");
}

export function extractFieldErrors(error) {
  return error?.response?.data?.fieldErrors || null;
}

export function extractApiMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || error?.message || fallback;
}
