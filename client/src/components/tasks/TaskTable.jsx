import { Calendar, AlertTriangle, MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "./TaskBadges";
import { cn, formatDate, getInitials, isOverdue } from "@/lib/utils";

export default function TaskTable({ tasks, onSelect, onEdit, onDelete, canDelete }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-28">Priority</TableHead>
            <TableHead className="w-40">Assignee</TableHead>
            <TableHead className="w-36">Due</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t) => {
            const overdue = isOverdue(t.dueDate, t.status);
            return (
              <TableRow
                key={t._id}
                className="cursor-pointer"
                onClick={() => onSelect?.(t)}
              >
                <TableCell>
                  <div className="font-medium">{t.title}</div>
                  {t.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {t.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={t.priority} />
                </TableCell>
                <TableCell>
                  {t.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(t.assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{t.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell
                  className={cn(overdue && "text-red-600 font-medium")}
                >
                  {t.dueDate ? (
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                      {formatDate(t.dueDate)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(t)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {canDelete?.(t) && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete?.(t)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
