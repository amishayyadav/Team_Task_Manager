import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import TaskFormFields from "./TaskFormFields";
import { createTaskSchema } from "@/schemas/task";
import { useCreateTask } from "@/hooks/useTasks";

export default function CreateTaskDialog({ open, onOpenChange, projectId, members = [], defaultStatus }) {
  const create = useCreateTask(projectId);
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: defaultStatus || "TODO",
      priority: "MEDIUM",
      dueDate: null,
      assignee: null,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        description: "",
        status: defaultStatus || "TODO",
        priority: "MEDIUM",
        dueDate: null,
        assignee: null,
      });
    }
  }, [open, defaultStatus, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    };
    try {
      await create.mutateAsync(payload);
      onOpenChange(false);
    } catch {
      /* toast handled in hook */
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Fill in the details and assign it to a teammate.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <TaskFormFields form={form} members={members} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner className="mr-2" />}
              Create task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
