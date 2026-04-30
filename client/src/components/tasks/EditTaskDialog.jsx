import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import TaskFormFields from "./TaskFormFields";
import { updateTaskSchema } from "@/schemas/task";
import { useUpdateTask } from "@/hooks/useTasks";

export default function EditTaskDialog({ open, onOpenChange, task, projectId, members = [] }) {
  const update = useUpdateTask(projectId);
  const form = useForm({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: null,
      assignee: null,
    },
  });

  useEffect(() => {
    if (open && task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assignee: task.assignee?._id || null,
      });
    }
  }, [open, task, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      id: task._id,
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      updatedAt: task.updatedAt,
    };
    try {
      await update.mutateAsync(payload);
      onOpenChange(false);
    } catch {
      /* toast handled in hook */
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <TaskFormFields form={form} members={members} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Spinner className="mr-2" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
